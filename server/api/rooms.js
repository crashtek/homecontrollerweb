import express from 'express';

import commandQueue from '../CommandQueue';

const router = express.Router();

router.put('/:id', (req, res) => {
  const homeId = 1;

  commandQueue.commandShade(homeId, req.params.id, req.body.command);

  res.status(204).send();
});

export default router;
