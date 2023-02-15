const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const yearMax = new Date().getFullYear();
const yearMin = yearMax - 200;

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'The title of the book is required!'],
    // unique: [true, 'A book with the same title already exists!'],
    minlength: [5, 'The title of the book must have at least 5 characters!'],
  },
  published: {
    type: Number,
    required: [true, 'The year the book was published is required!'],
    min: [
      yearMin,
      `The earliest published year allowed is ${yearMin}. Check the published year!`,
    ],
    max: [
      yearMax,
      `You can't save a book from the future. Check the published year!`,
    ],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  },
  genres: {
    type: [{ type: String }],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'You have to specify at least one genre!',
    },
  },
});

schema.plugin(uniqueValidator);

module.exports = mongoose.model('Book', schema);
