import mongo, { ObjectID } from 'mongodb';
import _ from 'lodash';
import logger from './logger';
import commandQueue from './CommandQueue';

class Database {
  constructor() {
    this.db = null;
  }

  async getDb() {
    if (this.db !== null) {
      logger.debug('Using cached db');
      return Promise.resolve(this.db);
    }

    const me = this;
    return mongo.MongoClient.connect(process.env.MONGO_URI,{
        useUnifiedTopology: true,
      })
      .then((client) => {
        me.db = client.db(process.env.MONGO_DB_NAME);
        return me.db;
      });
  }

  async getRoomsCollection() {
    const db = await this.getDb();
    return await db.collection('rooms');
  }

  async createRoom(homeId, userId, params) {
    const roomsCollection = await this.getRoomsCollection();

    let room = await this.getRoomByName( homeId, params.name );

    if (room) throw new Error('Room already exists');

    const now = Date.now();

    const result = await roomsCollection.insertOne({
      homeId,
      userId,
      ...params,
      createdDate: now,
      lastUpdate: now,
      windows: [],
      schedules: [],
      permissions: {
        admin: [userId]
      }
    });

    room = result.ops[0];

    console.log('room2: ', room);

    commandQueue.updateRoom(homeId, room);

    return room;
  }

  static getRoomQuery(homeId, roomId) {
    const query = {
      homeId: parseInt(homeId)
    };

    if (roomId) query._id = ObjectID(roomId);

    return query;
  }

  async updateRoom(homeId, roomId, userId, params) {
    const roomsCollection = await this.getRoomsCollection();

    let oldRoom = await this.getRoomByName( homeId, params.name );

    // First check to see if we have nothing to do
    if (oldRoom) {
      if (roomId === oldRoom._id.toString()) {
        if (params.ipaddress === oldRoom.ipaddress) return oldRoom; // ipaddress and name are all that can change
      }  else {
        throw new Error('Room already exists');
      }
    }

    const now = Date.now();

    const result = await roomsCollection.updateOne(
      Database.getRoomQuery(homeId, roomId), {
      $set: {
        ...params,
        lastUpdate: now,
      }});

    if (result.result.ok) {
      const room = await this.getRoomById(homeId, roomId);
      commandQueue.updateRoom(homeId, room);

      return room;
    }

    throw Error('Update failed');
  }

  async deleteRoom(homeId, roomId) {
    const roomsCollection = await this.getRoomsCollection();

    await roomsCollection.deleteOne(Database.getRoomQuery(homeId, roomId));

    commandQueue.deleteRoom(homeId, roomId);

    return null;
  }

  async getRooms() {
    const roomsCollection = await this.getRoomsCollection();

    return await roomsCollection.find({}).toArray();
  }

  async getRoomsForHome(homeId) {
    const roomsCollection = await this.getRoomsCollection();

    return await roomsCollection.find({ homeId: parseInt(homeId) }).toArray();
  }

  async getRoomByName(homeId, name) {
    const roomsCollection = await this.getRoomsCollection();
    const query = Database.getRoomQuery(homeId);
    return await roomsCollection.findOne({ name, ...query });

    //carlos you were here, you were going to make sure that the get rooms/:id was actually getting by name and
    // setup.  Right now it doesn't seem to be working in frontend or backend that should be tested next.  Then after that you can start creating and configuring windows!!!  Then after that schedules!!!'
  }

  async getRoomById(homeId, id) {
    const roomsCollection = await this.getRoomsCollection();

    return await roomsCollection.findOne(Database.getRoomQuery(homeId, id));
  }

  async addWindow(homeId, roomId, userId, window) {
    const roomsCollection = await this.getRoomsCollection();

    const room = await this.getRoomById( homeId, roomId );

    if (!room) throw new Error('Room does not exist');

    // Check for window with the same name
    const windows = _.filter(room.windows, w => w.name === window.name);
    if (windows.length > 0) throw new Error('Window name already in use');

    room.windows.push(window);

    const windowId = room.windows.length - 1;
    room.windows[windowId].id = windowId;

    const result = await roomsCollection.updateOne(
      Database.getRoomQuery(homeId, roomId), {
        $set: { lastUpdate: Date.now(), windows: room.windows }
      });

    if (result.result.ok) {
      const newRoom = await this.getRoomById(homeId, roomId);
      commandQueue.updateRoom(homeId, newRoom);

      return newRoom.windows[windowId];
    }

    throw Error('Update failed');
  }

  async updateWindow(homeId, roomId, userId, windowId, window) {
    const roomsCollection = await this.getRoomsCollection();

    const room = await this.getRoomById( homeId, roomId );

    if (!room) throw new Error('Room does not exist');
    if (windowId < 0 || windowId >= room.windows.length) throw new Error('Bad windowId');

    // Check for window with the same name
    const windows = _.filter(room.windows, w => w.name === window.name);

    if (windows.length > 1 || (windows.length === 1 && windows[0].name === window.name && room.windows[windowId].name !== window.name)) throw new Error('Window name already in use');

    const now = Date.now();
    _.assign(room.windows[windowId], window);

    const result = await roomsCollection.updateOne(
      Database.getRoomQuery(homeId, roomId), {
        $set: {
          lastUpdate: now,
          windows: room.windows
        }
      });

    console.log('Carlos, result', result);

    if (result.result.ok) {
      const newRoom = await this.getRoomById(homeId, roomId);
      commandQueue.updateRoom(homeId, newRoom);

      return newRoom.windows[windowId];
    }

    throw Error('Update failed');
  }

  async deleteWindow(homeId, roomId, userId, windowId) {
    const roomsCollection = await this.getRoomsCollection();

    const room = await this.getRoomById( homeId, roomId );

    if (!room) throw new Error('Room does not exist');
    if (windowId < 0 || windowId >= room.windows.length) throw new Error('Bad windowId');

    room.windows.splice(windowId,1);

    for(let i=windowId; i<room.windows.length; ++i) {
      room.windows[i].id = i;
    }

    const result = await roomsCollection.updateOne(
      Database.getRoomQuery(homeId, roomId), {
        $set: {
          lastUpdate: Date.now(),
          windows: room.windows
        }
      });

    if (result.result.ok) {
      const newRoom = await this.getRoomById(homeId, roomId);
      commandQueue.updateRoom(homeId, newRoom);

      return newRoom;
    }

    throw Error('Update failed');
  }

  async addSchedule(homeId, roomId, userId, schedule) {
    const roomsCollection = await this.getRoomsCollection();

    const room = await this.getRoomById( homeId, roomId );

    if (!room) throw new Error('Room does not exist');

    room.schedules.push(schedule);

    const scheduleId = room.schedules.length - 1;
    room.schedules[scheduleId].id = scheduleId;

    const result = await roomsCollection.updateOne(
      Database.getRoomQuery(homeId, roomId), {
        $set: { lastUpdate: Date.now(), schedules: room.schedules }
      });

    if (result.result.ok) {
      const newRoom = await this.getRoomById(homeId, roomId);
      commandQueue.updateRoom(homeId, newRoom);

      return newRoom.schedules[scheduleId];
    }

    throw Error('Update failed');
  }

  async updateSchedule(homeId, roomId, userId, scheduleId, schedule) {
    const roomsCollection = await this.getRoomsCollection();

    const room = await this.getRoomById( homeId, roomId );

    if (!room) throw new Error('Room does not exist');
    if (scheduleId < 0 || scheduleId >= room.schedules.length) throw new Error('Bad scheduleId');

    const now = Date.now();
    _.assign(room.schedules[scheduleId], schedule);

    const result = await roomsCollection.updateOne(
      Database.getRoomQuery(homeId, roomId), {
        $set: {
          lastUpdate: now,
          schedules: room.schedules
        }
      });

    console.log('Carlos, result', result);

    if (result.result.ok) {
      const newRoom = await this.getRoomById(homeId, roomId);
      commandQueue.updateRoom(homeId, newRoom);

      return newRoom.schedules[scheduleId];
    }

    throw Error('Update failed');
  }

  async deleteSchedule(homeId, roomId, userId, scheduleId) {
    const roomsCollection = await this.getRoomsCollection();

    const room = await this.getRoomById( homeId, roomId );

    if (!room) throw new Error('Room does not exist');
    if (scheduleId < 0 || scheduleId >= room.schedules.length) throw new Error('Bad scheduleId');

    room.schedules.splice(scheduleId,1);

    for(let i=scheduleId; i<room.schedules.length; ++i) {
      room.schedules[i].id = i;
    }

    const result = await roomsCollection.updateOne(
      Database.getRoomQuery(homeId, roomId), {
        $set: {
          lastUpdate: Date.now(),
          schedules: room.schedules
        }
      });

    if (result.result.ok) {
      const newRoom = await this.getRoomById(homeId, roomId);
      commandQueue.updateRoom(homeId, newRoom);

      return newRoom;
    }

    throw Error('Update failed');
  }
}

export const database = new Database();

export default database;
