// First you need to require mongoose from node
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Define the structure of the movie collection in the database
 * @param {string} Title
 * @param {number} Year
 * @param {string} Description
 * @param {number} Rating
 * @param {object} Director
 * @param {object} Genre
 * @param {array} Actors
 * @param {string} ImagePath
 * @param {boolean} Featured
 * @returns  Movie Schema
 *
 */
const movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Year: { type: Number },
  Description: { type: String },
  Rating: { type: Number },
  Director: {
    Name: String,
    Bio: String,
  },
  Genre: {
    Name: String,
    Description: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

/**
 * Define the structure of the user collection in the database
 * @param {string} Username
 * @param {string} Password
 * @param {string} Email
 * @param {date} Birthday
 * @param {array} FavoriteMovies
 * @returns  User Schema
 *
 */
const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// Create models to use the schemas above
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

// Now export them to use in index.js file
module.exports.Movie = Movie;
module.exports.User = User;
