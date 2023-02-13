const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'The title of the book is required!'],
    unique: [true, 'A book with the same title already exists!'],
    minlength: [5, 'The title of the book must have at least 5 characters!'],
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  },
  genres: [{ type: String }],
});

schema.plugin(uniqueValidator);

module.exports = mongoose.model('Book', schema);
