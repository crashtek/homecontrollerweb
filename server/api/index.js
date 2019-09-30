import express from 'express';

const router = express.Router();

router.get('/userinfo', (req, res) => {
  res.json(req.user);
});

router.get('/settings', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleAppId: process.env.GOOGLE_APP_ID
  });
});

export default router;
