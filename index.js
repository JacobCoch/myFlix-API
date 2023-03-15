// this gets the express module
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models');

// import schema models
const Movies = Models.Movie;
const Users = Models.User;

const app = express(); // express module

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true })); // handles urlencoded data
app.use(bodyParser.json()); // handles json encoded data
app.use(morgan('common')); // logs the requests to the console
app.use(express.static('dist')); // serves static files from 'dist' directory

// Require passport module and import passport.js file
const auth = require('./auth')(app);
const passport = require('passport'); // module
require('./passport');

// This connects mongoose to mongodb database
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/newmoviedb');
  console.log('connected');
}
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
      res.status(201).json(users);
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
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: {
            Username: req.body.Username,
            Password: req.body.Password,
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
  '/users/:Username/:Title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { Username, Title } = req.params;

    try {
      const user = await Users.findOneAndUpdate(
        { Username: Username },
        { $push: { favoriteMovies: Title } },
        { new: true }
      );

      if (user) {
        res
          .status(200)
          .send(`${Title} has been added to user ${Username}'s array`);
      } else {
        res.status(400).send('no such user');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// POST, creates a new user
app.post('/users', async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.body.Username });
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
      const newUser = await Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      });
      res.status(201).json(newUser);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

// DELETE movie from favorite list
app.delete(
  '/users/:Username/:Title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { Username, Title } = req.params;

    try {
      const user = await Users.findOneAndUpdate(
        { Username: Username },
        { $pull: { favoriteMovies: Title } },
        { new: true }
      );
      if (user) {
        res
          .status(200)
          .send(`${Title} has been removed from user ${Username}'s array`);
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
const port = 8080;
app.listen(port, () => {
  console.log('Server running at http://localhost:8080');
});
