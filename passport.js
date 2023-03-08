const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models');
const passportJWT = require('passport-jwt');

const Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// Strategy #1 LocalStrategy, defines you basic HTTP authentication for login requests
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      console.log('Login Attempt: ' + username);
      try {
        const user = await Users.findOne({ Username: username });
        if (!user) {
          console.log('incorrect username');
          return callback(null, false, {
            message: 'Incorrect username.',
          });
        }
        console.log('finished');
        return callback(null, user);
      } catch (error) {
        console.log(error);
        return callback(error);
      }
    }
  )
);

// Strategy #2 JWTStrategy, allows you to authenticate users based on the JWT submitted alongside their request
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    async (jwtPayload, callback) => {
      try {
        const user = await Users.findById(jwtPayload._id);
        return callback(null, user);
      } catch (error) {
        return callback(error);
      }
    }
  )
);
