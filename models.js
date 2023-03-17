// First you need to require mongoose from node
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// This is the movieSchema
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

// Another schema for the users
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
  returnbcrypt.hashSync(password, 10);
};

// Create models to use the schemas above
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

// Now export them to use in index.js file
module.exports.Movie = Movie;
module.exports.User = User;
