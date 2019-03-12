const mongoose = require('mongoose');

const { Schema } = mongoose;

const equipmentEnum = [
  'TV',
  'PROJECTOR',
];

const roomSchema = new Schema({
  buildingId: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  floor: {
    type: Number,
    required: true,
  },
  location: {
    type: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    required: true,
  },
  equipment: {
    type: [{
      type: String,
      uppercase: true,
      enum: equipmentEnum,
    }],
    required: true,
  },
  noiseLevel: {
    type: String,
    uppercase: true,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  },
  temperatureLevel: {
    type: String,
    uppercase: true,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  },
  wifiSpeed: Number,
});

module.exports = mongoose.model('Room', roomSchema);
