/* eslint-disable no-console */
import _ from 'lodash';
import express from 'express';
import { join } from 'path';
import morgan from 'morgan';
import passport from 'passport';
import Auth0Strategy from 'passport-auth0';
import dotenv from 'dotenv';
import session from 'express-session';
import querystring from 'querystring';

import apiRouter from './api';

dotenv.config();

const app = express();

app.use(morgan("dev"));

/*
  Configure the session object
 */

// config express-session
const sess = {
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: true
};

if (app.get('env') === 'production') {
  sess.cookie.secure = true; // serve secure cookies, requires https
}

app.use(session(sess));

/*
  Need to check whether or not the user is logged in before rendering the SPA
 */
const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);
passport.use('auth0', strategy);

passport.serializeUser(function(user, done) {
  if (_.isObject(user.name)) {
    user.name = `${user.name.givenName} ${user.name.familyName}`;
  }
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  if (_.isObject(user.name)) {
    user.name = `${user.name.givenName} ${user.name.familyName}`;
  }
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

const secureEverything = (req, res, next) => {
  if (req.user) { return next(); }
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

const secureApi = (req, res, next) => {
  if (req.user) { return next(); }
  res.status(401).json({ message: 'not authorized' });
};


app.get('/login', passport.authenticate('auth0', {
  connection: 'google-oauth2',
  scope: 'openid email profile'
}), function (req, res) {
  res.redirect('/');
});


// Perform the final stage of authentication and redirect to previously requested URL or '/user'
app.get('/callback', function (req, res, next) {
  passport.authenticate('auth0', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || '/user');
    });
  })(req, res, next);
});

// Perform session logout and redirect to homepage
app.get('/logout', (req, res) => {
  req.logout();

  let returnTo = req.protocol + '://' + req.hostname;
  const port = req.connection.localPort;
  if (port !== undefined && port !== 80 && port !== 443) {
    returnTo += ':' + port;
  }
  const logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  const searchString = querystring.stringify({
    client_id: process.env.AUTH0_CLIENT_ID,
    returnTo: `${returnTo}/loggedOut`
  });
  logoutURL.search = searchString;

  res.redirect(logoutURL);
});

// Need to secure direct access to the SPA
app.all('/', secureEverything);
app.all('/index.html', secureEverything);

// Need to make the static pages available
app.use(express.static(join(__dirname, "..", "build")));

// Have to be able to load the SPA if we want to present the loggedOut page
app.use('/loggedOut', (_, res) => {
  res.sendFile(join(__dirname, "..", "build", "index.html"));
});

app.use('/api', secureApi, apiRouter);

// NOTE: This must happen *after* the unsecured routes
app.use(secureEverything);

/*
  Here are the static endpoints for rending the SPA itself
 */
app.use((_, res) => {
  res.sendFile(join(__dirname, "..", "build", "index.html"));
});

app.listen(3000, () => console.log("Listening on port 3000"));
