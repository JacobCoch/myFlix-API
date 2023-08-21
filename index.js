// this gets the express module
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models');
const cors = require('cors');

const { check, validationResult } = require('express-validator');
const app = express();

require('dotenv').config();

// import schema models
const Movies = Models.Movie;
const Users = Models.User;

// MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: true })); // handles urlencoded data
app.use(bodyParser.json()); // handles json encoded data
app.use(morgan('common')); // logs the requests to the console
app.use(express.static('dist')); // serves static files from 'dist' directory

// connects to the DB on the localhost
const connection_uri = process.env.connection_uri;
console.log(connection_uri);

// This connects mongoose to mongodb database
async function databaseConnect() {
  try {
    await mongoose.connect(connection_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');
  } catch (error) {
    console.log('Error connecting to database: ', error);
  }
}
databaseConnect();

// Use cors to allow cross-origin requests
let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://localhost:4200',
  'https://jarjardinks.github.io/myFlix-Client-Angular/',
  'https://themovieflicks.netlify.app',
  'https://mymovieapidb.herokuapp.com/',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // if a specific origin isn't found on the list of allwed origins
        let message =
          'The CORS policy for this app does NOT allow access from origin ' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

const auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// READ
app.get('/', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

// GET all movies
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find();
      res.status(201).json(movies);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// GET movie by title
app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ Title: req.params.Title });
      res.status(201).json(movie);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// GET data about a genre by title
app.get(
  '/movies/genres/:Name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const genre = await Movies.findOne(
        { 'Genre.Name': req.params.Name },
        { 'Genre.$': 1 } // projection param (only the first matching element gets returned)
      );
      if (genre) {
        res.status(200).json(genre);
      } else {
        res.status(404).send('Genre not found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// GET director by name
app.get(
  '/movies/directors/:Name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const director = await Movies.findOne(
        { 'Director.Name': req.params.Name },
        { 'Director.$': 1 }
      );
      if (director) {
        res.status(200).json(director);
      } else {
        res.status(400).send('no such director');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// Get all users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const users = await Users.find();
      res.status(200).json(users);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// GET a user by username
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const users = await Users.findOne({ Username: req.params.Username });
      res.status(200).json(users);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// PUT to update user info
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const hashedPassword = await Users.hashPassword(req.body.Password);
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          },
        },
        { new: true }
      );
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// POST, allow user to add movie to fav list
app.post(
  '/users/:Username/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $push: { FavoriteMovies: req.params.id } },
        { new: true }
      );

      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(400).send('No such user');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// POST, creates a new user
app.post(
  '/users',
  [
    check('Username', 'Username is required.').isLength({ min: 5 }),
    check('Username', 'Username cannot be empty.').notEmpty(),
    check('Password', 'Password is required.').notEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail(),
  ],
  async (req, res) => {
    console.log(req.body);
    try {
      const errors = validationResult(req);
      const hashedPassword = await Users.hashPassword(req.body.Password);
      const user = await Users.findOne({ Username: req.body.Username });
      console.log(user);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        await Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        });
        return res.status(201).json({ Username: req.body.Username }); //TODO send more  info but password
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// DELETE movie from favorite list
app.delete(
  '/users/:Username/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { Username, id } = req.params;

    try {
      const updateUser = await Users.findOneAndUpdate(
        { Username: Username },
        { $pull: { FavoriteMovies: id } },
        { new: true }
      );
      if (updateUser) {
        res.json(updateUser);
      } else {
        res.status(400).send('no such user');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// DELETE
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const Username = req.params.Username;

    try {
      const user = await Users.findOneAndDelete(
        { Username: req.params.Username },
        { $pull: { Username } },
        { new: true }
      );
      if (user) {
        res
          .status(200)
          .send(`${Username} has been removed from the Users list`);
      } else {
        res.status(400).send('no such user');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// LISTEN
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
