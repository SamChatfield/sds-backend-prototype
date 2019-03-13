const express = require('express');
const moment = require('moment');

const Room = require('../models/room');

const router = express.Router();

const defaultProjection = {
  _id: false,
  __v: false,
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
  console.log(`Create new room with roomId: ${req.body.roomId}`);
  try {
    const room = new Room({
      roomId: req.body.roomId,
      floor: req.body.floor,
      location: {
        latitude: req.body.location.latitude,
        longitude: req.body.location.longitude,
      },
      equipment: req.body.equipment,
      bookings: req.body.bookings,
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

// Update room information
router.put('/:roomId', async (req, res, next) => {
  console.log(`Updating room information for ${req.params.roomId}`);
  try {
    const updateData = {};
    if (req.body.equipment) updateData.equipment = req.body.equipment;
    if (req.body.noiseLevel) updateData.noiseLevel = req.body.noiseLevel;
    if (req.body.temperatureLevel) updateData.temperatureLevel = req.body.temperatureLevel;
    if (req.body.wifiSpeed) updateData.wifiSpeed = req.body.wifiSpeed;

    const data = await Room.findOneAndUpdate({
      roomId: req.params.roomId,
    }, {
      $set: { ...updateData },
    }, {
      new: true,
      projection: defaultProjection,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get booking at specific time
router.get('/:roomId/bookings/:start', async (req, res, next) => {
  console.log(`Get room booking for ${req.params.roomId} at ${req.params.start}`);
  try {
    // TODO: Use aggregation matching to see if there are multiple bookings at one time
    const data = await Room.findOne({
      roomId: req.params.roomId,
    }, {
      bookings: { $elemMatch: { start: req.params.start } },
    }, {
      projection: 'bookings',
    });
    console.log(`data:\n${JSON.stringify(data, null, 2)}`);
    // const data = await Room.aggregate([
    //   { $unwind: '$bookings' },
    //   { $match: { 'bookings.start': '2019-03-13T12:00:00.000Z' } },
    // ]);

    if (!data) {
      res.status(404).send('Room not found');
    } else {
      const bookingData = data.bookings[0];
      console.log(`booking data:\n${JSON.stringify(bookingData, null, 2)}`);

      if (!bookingData) {
        res.json(null);
      } else {
        res.json(bookingData);
      }
    }
  } catch (err) {
    next(err);
  }
});

// Add new booking
router.post('/:roomId/bookings', async (req, res, next) => {
  console.log(`Add new booking to room ${req.params.roomId}`);
  try {
    if (!req.body.start) {
      res.status(400).send('No start time provided');
    } else {
      const startMoment = moment(req.body.start);
      const startMomentString = startMoment.toISOString();
      const startMomentHour = moment(startMoment).startOf('hour');

      if (!startMoment.isSame(startMomentHour)) {
        res.status(400).send('Start time not on the hour');
      } else {
        const newBooking = {
          start: startMomentString,
          end: startMoment.add(1, 'hours').toISOString(),
          leader: req.body.leader,
          users: req.body.users,
        };
        console.log(`newBooking:\n${JSON.stringify(newBooking, null, 2)}`);

        // TODO: Check if there is already a booking at this time

        const data = await Room.findOneAndUpdate({
          roomId: req.params.roomId,
        }, {
          $push: { bookings: newBooking },
        }, {
          new: true,
          projection: defaultProjection,
        });

        res.json(data);
      }
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:roomId/unlock/:userId', async (req, res, next) => {
  const { roomId, userId } = req.params;
  const { time } = req.body;
  console.log(`Should room ${roomId} unlock for user ${userId}?`);
  // Get the time specified in the request or use current time
  const currentMoment = time ? moment(time) : moment();
  const currentSlotStart = currentMoment.startOf('hour').toISOString();
  console.log(`Current slot start time was ${currentSlotStart}`);
  try {
    const data = await Room.findOne({
      roomId: req.params.roomId,
    }, {
      bookings: { $elemMatch: { start: currentSlotStart } },
    }, {
      projection: 'bookings',
    });
    console.log(`data:\n${JSON.stringify(data, null, 2)}`);

    if (!data) {
      res.status(404).send('Room not found');
    } else if (!data.bookings || !data.bookings.length) {
      // Should the room just open and create a new booking if there isn't one already?
      res.status(404).send('Booking not found');
    } else {
      const { users } = data.bookings[0];
      res.json({ unlock: users.includes(userId) });
    }
  } catch (err) {
    next(err);
  }
});

const roomPermissions = {
  222: ['1642203'],
  225: ['1234567'],
};

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
