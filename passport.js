const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models'),
  passportJWT = require('passport-jwt');

const Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

// Strategy #1 LocalStrategy, defines you basic HTTP authentication for login requests
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    (username, password, callback) => {
      console.log(username + ' ' + password);
      Users.findOne({ Username: username }, (error, user) => {
        // mongoose to check DB if username exists NOT THE PASSWORD
        if (error) {
          console.log(error);
          return callback(error);
        }
        if (!user) {
          console.log('incorrect username');
          return callback(null, false, {
            message: 'Incorrect username or password.',
          });
        }
        console.log('finished');
        return callback(null, user);
      });
    }
  )
);

// Strategy #2 JWTStrategy, allows you to authenticate users based on the JWT submitted alongside their request
passport.use(
  new JWTStrategy(
    {
      jewtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
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
