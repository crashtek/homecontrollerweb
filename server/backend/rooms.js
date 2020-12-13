import _ from 'lodash';
import express from 'express';

import logger from '../logger';
import { database } from '../Database';

const router = express.Router();

router.get('/', (req, res) => {
  database.getRooms(req.query.homeId)
    .then(rooms => {
      return res.json({ rooms })
    })
    .catch(err => {
      logger.error(`Error: ${err.message}`, err);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.get('/:roomId', (req, res) => {
  database.getRoomById(req.query.homeId, req.params.roomId)
    .then(room => {
      return res.json({ room })
    })
    .catch(err => {
      logger.error(`Error: ${err.message}`, err);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.delete('/:roomId', (req, res) => {
  database.deleteRoom(req.query.homeId, req.params.roomId)
    .then(() => {
      return res.status(204).json({});
    })
    .catch(err => {
      logger.error(`Error: ${err.message}`, err);
      res.status(500).json({ error: 'internal_error' })
    });
});

const roomFields = ['name', 'ipaddress'];
router.post('/', (req, res) => {
  // TODO: add access control here to make sure only owners or permitted are allowed to edit this config
  const newRoomParams = _.pick(req.body, roomFields);
  database.createRoom(req.body.homeId, req.openid.user.sub, newRoomParams)
    .then(room => res.json({ room }))
    .catch(err => {
      logger.error(`Found Error: ${err.message}`);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.patch('/:roomId', (req, res) => {
  const newRoomParams = _.pick(req.body, roomFields);

  logger.debug('PATCH Room: ', newRoomParams);

  database.updateRoom(req.body.homeId, req.params.roomId,
    req.openid.user.sub, newRoomParams)
    .then(room => res.json({ room }))
    .catch(err => {
      logger.error(`Found Error: ${err.message}`);
      res.status(500).json({ error: 'internal_error' })
    });
});

const windowFields = ['name', 'arduinoid'];

// Windows
router.post('/:roomId/windows', (req, res) => {
  const windowParams = _.pick(req.body, windowFields);
  database.addWindow(req.body.homeId, req.params.roomId, req.openid.user.sub, windowParams)
    .then(window => res.json({ window }))
    .catch(err => {
      logger.error(`error: ${err.message}`);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.get('/:roomId/windows/:windowId', (req, res) => {
  database.getRoomById(req.query.homeId, req.params.roomId)
    .then(room => {
      if (req.params.windowId < 0 || req.params.windowId >= room.windows.length)
        return res.status(404).json({ error: 'not found' });
      return res.json({ window: room.windows[req.params.windowId] });
    })
    .catch(err => {
      logger.error(`Error: ${err.message}`, err);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.patch('/:roomId/windows/:windowId', (req, res) => {
  const windowParams = _.pick(req.body, windowFields);

  database.updateWindow(req.body.homeId, req.params.roomId,
    req.openid.user.sub, req.params.windowId, windowParams)
    .then(window => res.json({ window }))
    .catch(err => {
      logger.error(`Error: ${err.message}`, err);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.delete('/:roomId/windows/:windowId', (req, res) => {
  database.deleteWindow(req.query.homeId, req.params.roomId, req.openid.user.sub, req.params.windowId)
    .then(room => res.json({ room }))
    .catch(err => {
      logger.error(`Error: ${err.message}`, err);
      res.status(500).json({ error: 'internal_error' })
    });
});

const scheduleFields = ['command', 'startDoW', 'endDoW', 'hour', 'minute'];

// Schedules
router.post('/:roomId/schedules', (req, res) => {
  const scheduleParams = _.pick(req.body, scheduleFields);
  database.addSchedule(req.body.homeId, req.params.roomId, req.openid.user.sub, scheduleParams)
    .then(schedule => res.json({ schedule }))
    .catch(err => {
      logger.error(`error: ${err.message}`);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.get('/:roomId/schedules/:scheduleId', (req, res) => {
  database.getRoomById(req.query.homeId, req.params.roomId)
    .then(room => {
      if (req.params.scheduleId < 0 || req.params.scheduleId >= room.schedules.length)
        return res.status(404).json({ error: 'not found' });
      return res.json({ schedule: room.schedules[req.params.scheduleId] });
    })
    .catch(err => {
      logger.error(`Error: ${err.message}`, err);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.patch('/:roomId/schedules/:scheduleId', (req, res) => {
  const scheduleParams = _.pick(req.body, scheduleFields);

  database.updateSchedule(req.body.homeId, req.params.roomId,
    req.openid.user.sub, req.params.scheduleId, scheduleParams)
    .then(schedule => res.json({ schedule }))
    .catch(err => {
      logger.error(`Error: ${err.message}`, err);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.delete('/:roomId/schedules/:scheduleId', (req, res) => {
  database.deleteSchedule(req.query.homeId, req.params.roomId, req.openid.user.sub, req.params.scheduleId)
    .then(room => res.json({ room }))
    .catch(err => {
      logger.error(`Error: ${err.message}`, err);
      res.status(500).json({ error: 'internal_error' })
    });
});

router.all('*', function(req, res){
  res.status(404).send({ error: 'not found' });
});


export default router;
