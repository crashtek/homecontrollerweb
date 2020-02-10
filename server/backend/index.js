import express from 'express';

import roomsRouter from './rooms';

const router = express.Router();

router.get('/userinfo', (req, res) => {
  res.json(req.openid.user);
});

router.get('/settings', (req, res) => {
  res.json({
  });
});

router.use('/rooms', roomsRouter);

router.all('*', function(req, res){
  res.status(404).send({ error: 'not found' });
});

export default router;
