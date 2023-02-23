const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The name of the author is required!'],
    unique: [true, 'The author already exists!'],
    minlength: [4, 'The name of the author must have at least 4 characters!'],
  },
  born: {
    type: Number,
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
});

schema.plugin(uniqueValidator);

module.exports = mongoose.model('Author', schema);
