const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

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
    time: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
  }],
  preferences: {
    type: Map,
    of: Number,
  },
  bookings: [{
    bookingId: ObjectId,
    roomId: String,
    start: Date,
    _id: false,
  }],
});

module.exports = mongoose.model('User', userSchema);
