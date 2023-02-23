const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'The name of the user is required!'],
    unique: [true, 'The user already exists!'],
    minlength: [3, 'The name of the user must have at least 4 characters!'],
  },
  hashedPassword: {
    type: String,
    required: [true, 'Hashed password is missing!'],
  },
  favouriteGenre: {
    type: String,
    required: [true, 'Please provide your favourite genre!'],
  },
});

schema.plugin(uniqueValidator);

module.exports = mongoose.model('User', schema);
