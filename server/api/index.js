import express from 'express';

import commandRouter from './command';
import roomsRouter from './rooms';

const router = express.Router();

router.use('/command', commandRouter);
router.use('/rooms', roomsRouter);

export default router;
