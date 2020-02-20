import express from 'express';

import database from '../Database';
import commandQueue from '../CommandQueue';
import logger from '../logger';

const router = express.Router();

router.put('/:id', (req, res) => {
  const homeId = 1;

  database.getRoomById(homeId, req.params.id)
    .then(room => {
      commandQueue.commandShade(room.ipaddress, req.body.command);
      res.status(204).send();
    })
    .catch(err => {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ message: 'internal_error' })
    });


});

export default router;
