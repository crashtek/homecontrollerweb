/* eslint-disable no-console */
import express from 'express';
import session from 'express-session';
import jwt from 'express-jwt';
import cors from 'cors';
import jwks from 'jwks-rsa';
import { auth, requiresAuth } from 'express-openid-connect';
import { join } from 'path';
import morgan from 'morgan';

import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import apiRouter from './api';
import backendRouter from './backend';
import database from './Database';
import commandQueue from './CommandQueue';

dotenv.config();


const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());

/*
  Configure the session object
 */

// config express-session
const sess = {
  secret: process.env.SESSION_SECRET,
  cookie: {
    sameSite: 'none'
  },
  resave: false,
  saveUninitialized: true
};

if (app.get('env') === 'production') {
  console.log("RUNNING PRODUCTION!!!");
  sess.cookie.secure = true; // serve secure cookies, requires https
  sess.cookie.sameSite = 'strict'; // serve secure cookies, requires https
} else {
  app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
  }));
}

app.use(session(sess));

const autoLogin = () => auth({
  required: true
});

const secureBackend = () => ([auth({
  required: true,
  errorOnRequiredAuth: true
}), (req, res, next) => {
  // We just need to validate that a header is coming through so we aren't vulnerable to CSRF (this call is coming
  // from the frontend because we don't allow CORS and this is an XHR if we are getting headers
  if (req.openid.user && req.header('x-csrf-token')) {
    return next();
  }
  res.status(401).json({ message: 'not authorized' });
}]);

const secureApi = () => jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.ISSUER_BASE_URL}/.well-known/jwks.json`
  }),
  audience: 'http://hc.api.crashtek.games/v1/',
  issuer: `${process.env.ISSUER_BASE_URL}/`,
  algorithms: ['RS256']
});

// app.get('/login', passport.authenticate('auth0', {
//   connection: 'google-oauth2',
//   scope: 'openid email profile'
// }), function (req, res) {
//   res.redirect('/');
// });

// // Perform session logout and redirect to homepage
// app.get('/logout', (req, res) => {
//   req.logout();
//
//   let returnTo = req.protocol + '://' + req.hostname;
//   const port = req.connection.localPort;
//   if (port !== undefined && port !== 80 && port !== 443) {
//     returnTo += ':' + port;
//   }
//   const logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
//   const searchString = querystring.stringify({
//     client_id: process.env.AUTH0_CLIENT_ID,
//     returnTo: `${returnTo}/loggedOut`
//   });
//   logoutURL.search = searchString;
//
//   res.redirect(logoutURL);
// });

// Need to secure direct access to the SPA
app.all('/', [auth({
  required: false
}), (req, res, next) => {
  console.log('hello!!!');
  next()
}, requiresAuth()
]);
app.all('/index.html', autoLogin());

// Need to make the static pages available
app.use(express.static(join(__dirname, "..", "build")));

// Have to be able to load the SPA if we want to present the loggedOut page
app.use('/loggedOut', (_, res) => {
  res.sendFile(join(__dirname, "..", "build", "index.html"));
});

app.use('/api', secureApi(), apiRouter);
app.use('/backend', secureBackend(), backendRouter);

// NOTE: This must happen *after* the unsecured routes
app.use(autoLogin());

/*
  Here are the static endpoints for rending the SPA itself
 */
app.use((_, res) => {
  res.sendFile(join(__dirname, "..", "build", "index.html"));
});

/*
  Initialize the command queue
 */
const port = process.env.PORT || 3000;
database.getRooms()
  .then(rooms => {
    const homeConfigs = {};
    rooms.forEach(room => {
      if (!homeConfigs[room.homeId]) {
        homeConfigs[room.homeId] = [];
      }
      homeConfigs[room.homeId].push(room);
    });
    commandQueue.setHomeConfigs(homeConfigs);
  })
  .then(() => app.listen(port, () => console.log(`Listening on port ${port}`)));
