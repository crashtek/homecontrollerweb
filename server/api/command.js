import express from 'express';

import { commandQueue, LongPollExpiredName } from '../CommandQueue';

const router = express.Router();

const longPollingTime = 30000;

const getNextCommand = async (user, home, lastSync) => new Promise((resolve, reject) => {
  // TODO: make sure user can actually monitor this home

  commandQueue.next(home, lastSync, longPollingTime)
    .then(resolve)
    .catch(reject);

});

router.get('/next', (req, res) => {
  getNextCommand(req.user, req.query.homeId, req.query.lastSync)
    .then(command => {
      res.json({
        command
      })
    })
    .catch(err => {
      if (err.constructor.name === LongPollExpiredName) {
        return res.status(400).json({
          error: LongPollExpiredName
        });
      }

      console.error('Got error processing next command: ', err.message);
      console.error(err);
      return res.status(500).json({
        error: 'InternalError',
        error_description: err.message
      });
    });
});

export default router;
