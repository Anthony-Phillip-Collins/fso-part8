const { default: mongoose } = require('mongoose');
const { MONGODB_URI } = require('./config');

mongoose.set('strictQuery', false);

module.exports = async () => mongoose.connect(MONGODB_URI);
