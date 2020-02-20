import { EventEmitter } from 'events';

const CheckQueueEventName = 'checkqueue';
const HomeClaim = 'http://crashtek.com/claim/homeId';

class LongPollExpired {
}

export const LongPollExpiredName = 'LongPollExpired';

class CommandQueue {
  constructor() {
    this.emitter = new EventEmitter();
    this.homeConfigs = [];
    this.activeCommand = {};
  }

  setHomeConfigs(homeConfigs) {
    this.homeConfigs = homeConfigs;
  }

  getCommand(homeId, lastSync) {
    const config = this.homeConfigs[homeId];
    const room = config.find(room => !lastSync || room.lastUpdate > lastSync);
    if (room) {
      return { type: 'configUpdate', config };
    }

    const command = this.activeCommand[homeId];
    if (command) {
      delete this.activeCommand[homeId];
      return { type: 'command', command };
    }

    return null;
  }

  async next(homeId, lastSync, timeout) {
    const command = this.getCommand(homeId, lastSync);

    if (command) return command;

    const me = this;

    return new Promise((resolve, reject) => {
      const checkQueue = () => {
        const nextCommand = me.getCommand(homeId, lastSync);
        if (nextCommand) return resolve(nextCommand);
      };
      me.emitter.on(CheckQueueEventName, checkQueue);
      // Nothing to do, wait for long
      setTimeout(() => {
        me.emitter.removeListener(CheckQueueEventName, checkQueue);
        reject(new LongPollExpired());
      }, timeout);
    });
  }

  addCommand(homeId, command) {
    this.activeCommand[homeId] = command;
    this.emitter.emit(CheckQueueEventName);
  }

  commandShade(homeId, ipaddress, command) {
    this.activeCommand[homeId] = {
      ipaddress,
      command
    }
  }

  updateRoom(homeId, newRoom) {
    if (!this.homeConfigs[homeId]) this.homeConfigs[homeId] = [];
    const roomIndex = this.homeConfigs[homeId].findIndex(room => toString(room._id) === toString(newRoom._id));
    if (roomIndex >= 0) this.homeConfigs[homeId][roomIndex] = newRoom;
    else this.homeConfigs[homeId].push(newRoom);
    this.emitter.emit(CheckQueueEventName);
  }

  deleteRoom(homeId, roomId) {
    if (!this.homeConfigs[homeId]) this.homeConfigs[homeId] = [];
    const roomIndex = this.homeConfigs[homeId].findIndex(room => toString(room._id) === toString(roomId));
    this.homeConfigs[homeId].splice(roomIndex, 1);
    this.emitter.emit(CheckQueueEventName);
  }
}

export const commandQueue = new CommandQueue();

export default commandQueue;
