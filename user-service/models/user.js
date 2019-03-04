const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  locations: [{
    time: {
      type: Date,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    _id: false,
  }],
  files: [{
    path: {
      type: String,
      required: true,
    },
    _id: false,
  }],
});

module.exports = mongoose.model('User', userSchema);
