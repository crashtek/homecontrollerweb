import express from 'express';
import fs from 'fs';

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

router.post('/scenariodoc', (req, res) => {
  console.log(req.body);
  try {
    const path = 'fileCache.json';
    fs.writeFileSync(path, JSON.stringify(req.body));
  } catch (err) {
    console.error(err)
  }

  res.json({
    message: 'got it!'
  });
});


export default router;
