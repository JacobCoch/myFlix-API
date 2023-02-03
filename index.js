// this gets the express module
const express = require('express');
const morgan = require('morgan');

const app = express();

// logs the requests
app.use(morgan('common'));

// Create a GET route for "/movies"
app.get('/movies', (req, res) => {
  const topMovies = [
    { title: 'Every thing everywhere all at once', year: 2022 },
    { title: 'Interstellar', year: 2014 },
    { title: 'The Lord of the Rings: The Two Towers', year: 2002 },
    { title: 'Inception', year: 2010 },
    { title: 'The Matrix', year: 1999 },
    { title: 'Gladiator', year: 2000 },
    { title: 'Spider-Man: Into the Spider-Verse', year: 2018 },
    { title: 'Tron: Legacy', year: 2010 },
    { title: 'The Dark Knight', year: 2008 },
    { title: 'Forrest Gump', year: 1994 },
  ];
  res.json({ movies: topMovies });
});

// Create a GET route for "/"
app.get('/', (req, res) => {
  res.send('Welcome to my movie list');
});

// middleware function to serve static files
app.use(express.static('public'));

// INTENTIONAL ERROR to see how the error funciton below works
app.get('/error', (req, res, next) => {
  const error = new Error('Intentional Error');
  error.status = 400;
  next(error);
});

// last middleware function to handle all errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = 3000;
app.listen(port, () => {
  console.log('Server running at http://localhost:${port}');
});
