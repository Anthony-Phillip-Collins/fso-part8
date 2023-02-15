const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  value: {
    type: String,
    required: [true, 'A Token is required for authentication!'],
  },
});

module.exports = mongoose.model('Token', schema);
