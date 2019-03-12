const express = require('express');

const Room = require('../models/room');

const router = express.Router();

const defaultProjection = {
  _id: false,
  __v: false,
};

const roomPermissions = {
  222: ['1642203'],
  225: ['1234567'],
};

// Get all rooms
router.get('/', async (req, res, next) => {
  console.log('Get alll rooms');
  try {
    const data = await Room.find({}, defaultProjection);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Create a new room
router.post('/', async (req, res, next) => {
  console.log(`Create new room, buildingId: ${req.body.buildingId}, roomId: ${req.body.roomId}`);
  try {
    const room = new Room({
      buildingId: req.body.buildingId,
      roomId: req.body.roomId,
      floor: req.body.floor,
      location: {
        latitude: req.body.location.latitude,
        longitude: req.body.location.longitude,
      },
      equipment: req.body.equipment,
      noiseLevel: req.body.noiseLevel,
      temperatureLevel: req.body.temperatureLevel,
      wifiSpeed: req.body.wifiSpeed,
    });
    const data = await room.save();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/:roomNumber/unlock', (req, res) => {
  const { roomNumber } = req.params;
  const { userId } = req.body;

  if (Object.keys(roomPermissions).includes(roomNumber)) {
    if (userId) {
      if (roomPermissions[roomNumber].includes(userId)) {
        res.json({ unlock: true });
      } else {
        res.json({ unlock: false });
      }
    } else {
      res.status(400).json({ error: 'No userId provided' });
    }
  } else {
    res.status(400).json({ error: 'Invalid room number provided' });
  }
});

module.exports = router;
