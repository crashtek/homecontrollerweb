import express from 'express';

import commandRouter from './command';

const router = express.Router();

router.use('/command', commandRouter);

export default router;
