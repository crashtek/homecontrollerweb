import express from 'express';
import fs from 'fs';

import Discovery from '../discovery';
import Guidance from '../guidance';

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
  try {
    const path = 'fileCache.json';
    fs.writeFileSync(path, JSON.stringify(req.body));

    const discovery = new Discovery(req.body);
    const guidance = new Guidance(discovery);

    return res.json(guidance.getJSON());
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err
    });
  }
});


export default router;
