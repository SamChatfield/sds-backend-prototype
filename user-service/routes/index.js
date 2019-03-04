const express = require('express');

const User = require('../models/user');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('User Service');
});

// Create a new user
router.post('/', async (req, res, next) => {
  console.log(`Create new user with userId: ${req.body.userId}`);
  try {
    const user = new User({
      userId: req.body.userId,
    });
    const data = await user.save();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get location data for user
router.get('/:userId/locations', async (req, res, next) => {
  console.log(`Find location data for userId: ${req.params.userId}`);
  try {
    const data = await User.findOne({ userId: req.params.userId }, 'locations');
    res.json(data.locations);
  } catch (err) {
    next(err);
  }
});

// Add location data to a user
router.post('/:userId/locations', async (req, res, next) => {
  console.log(`Add location data for userId: ${req.params.userId}`);
  try {
    const newLocation = {
      time: req.body.time || Date.now(),
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };
    const data = await User.findOneAndUpdate({
      userId: req.params.userId,
    }, {
      $push: { locations: newLocation },
    }, {
      new: true,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
