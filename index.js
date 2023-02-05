// this gets the express module
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
app.use(bodyParser.json());

// logs the requests
app.use(morgan('common'));

// middleware function to serve static files
app.use(express.static('dist'));

let users = [
  {
    id: 1,
    name: 'Kim',
    favoriteMovies: [],
  },
  {
    id: 2,
    name: 'Jim',
    favoriteMovies: ['Interstellar'],
  },
];

let movies = [
  {
    Title: 'Every thing everywhere all at once',
    Year: 2022,
    Description:
      'A film about a group of scientists trying to save humanity from an impending disaster',
    Genre: {
      Name: 'Sci-Fi',
      Description:
        'A genre of speculative fiction dealing with imaginative and futuristic concepts, typically involving science and technology',
    },
    Director: {
      Name: 'John Doe',
    },
  },
  {
    Title: 'Interstellar',
    Year: 2014,
    Description:
      'A story of a group of astronauts who travel through a wormhole in search of a new home for humanity',
    Genre: {
      Name: 'Sci-Fi',
      Description:
        'A genre of speculative fiction dealing with imaginative and futuristic concepts, typically involving science and technology',
    },
    Director: {
      Name: 'Christopher Nolan',
    },
  },
  {
    Title: 'The Lord of the Rings: The Two Towers',
    Year: 2002,
    Description:
      'The second installment in The Lord of the Rings trilogy, following hobbits, elves, and men as they continue their quest to destroy the One Ring and defeat the dark lord Sauron',
    Genre: {
      Name: 'Fantasy',
      Description:
        'A genre that encompasses imaginative and fantastic stories, typically featuring mythical creatures and magic',
    },
    Director: {
      Name: 'Peter Jackson',
    },
  },
  {
    Title: 'Inception',
    Year: 2010,
    Description:
      'A mind-bending thriller about a group of thieves who enter the subconscious of their targets to steal their secrets',
    Genre: {
      Name: 'Sci-Fi',
      Description:
        'A genre of speculative fiction dealing with imaginative and futuristic concepts, typically involving science and technology',
    },
    Director: {
      Name: 'Christopher Nolan',
    },
  },
  {
    Title: 'The Matrix',
    Year: 1999,
    Description:
      'A classic sci-fi action film about a hacker who discovers that the world around him is a simulated reality created by sentient machines',
    Genre: {
      Name: 'Sci-Fi',
      Description:
        'A genre of speculative fiction dealing with imaginative and futuristic concepts, typically involving science and technology',
    },
    Director: {
      Name: 'The Wachowski Brothers',
    },
  },
  {
    Title: 'Gladiator',
    Year: 2000,
    Description:
      'An epic historical drama about a Roman general who becomes a slave and rises to prominence as a gladiator in ancient Rome',
    Genre: {
      Name: 'Action',
      Description:
        'A genre that features fast-paced, physical action, often in the form of fight scenes and chases',
    },
    Director: {
      Name: 'Ridley Scott',
    },
  },
  {
    Title: 'Spider-Man: Into the Spider-Verse',
    Year: 2018,
    Description:
      'An animated film about a young man named Miles Morales who discovers he has spider powers and joins other versions of Spider-Man from different dimensions to stop a threat to all of their realities',
    Genre: {
      Name: 'Animation',
      Description:
        'A genre that encompasses motion pictures created using animation techniques, such as hand-drawn, computer, or stop-motion animation',
    },
    Director: {
      Name: 'Bob Persichetti, Peter Ramsey, and Rodney Rothman',
    },
  },
  {
    Title: 'Tron: Legacy',
    Year: 2010,
    Description:
      'A sci-fi movie set in a virtual world where a man has to save his father from an evil program',
    Genre: {
      Name: 'Sci-Fi',
      Description:
        'A genre that often involves futuristic and technologically advanced science or science fiction elements',
    },
    Director: {
      Name: 'Joseph Kosinski',
    },
  },
  {
    Title: 'The Dark Knight',
    Year: 2008,
    Description:
      'A superhero movie about the Dark Knight aka Batman, as he tries to stop the Joker from wreaking havoc on Gotham City',
    Genre: {
      Name: 'Action',
      Description:
        'A genre that involves physically thrilling and fast-paced scenes often with hand-to-hand combat or chase scenes',
    },
    Director: {
      Name: 'Christopher Nolan',
    },
  },
  {
    Title: 'Forrest Gump',
    Year: 1994,
    Description:
      'A drama movie about a slow-witted man who ends up becoming involved in some of the major events of the 20th century',
    Genre: {
      Name: 'Drama',
      Description:
        'A genre that deals with serious and important human experiences and relationships, often emphasizing emotional and psychological development',
    },
    Director: {
      Name: 'Robert Zemeckis',
    },
  },
];

// CREATE
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('users need names');
  }
});

// UPDATE
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user');
  }
});

// CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user');
  }
});

// DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user');
  }
});

// DELETE
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id !== id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user');
  }
});

// READ
app.get('/movies', (req, res) => {
  res.json({ movies: movies });
});

// READ
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('no such movie');
  }
});

// READ
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('no such genre');
  }
});

// READ
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.Director.Name === directorName
  ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('no such director');
  }
});

// LISTEN
const port = 3000;
app.listen(port, () => {
  console.log('Server running at http://localhost:3000');
});
