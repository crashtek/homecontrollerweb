import express from 'express';

const router = express.Router();

router.get('/userinfo', (req, res) => {
  res.json(req.user);
});

export default router;
