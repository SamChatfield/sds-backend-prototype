const express = require('express');
const multer = require('multer');
const fs = require('fs');

const User = require('../models/user');

const router = express.Router();

const defaultProjection = {
  _id: false,
  __v: false,
};

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

// Get all user data
router.get('/:userId', async (req, res, next) => {
  console.log(`Get user data for userId: ${req.params.userId}`);
  try {
    const data = await User.findOne({ userId: req.params.userId }, defaultProjection);
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
      projection: defaultProjection,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// List all files for the user
router.get('/:userId/files', async (req, res, next) => {
  console.log(`Get all files for userId: ${req.params.userId}`);
  try {
    const data = await User.findOne({ userId: req.params.userId }, 'files');
    res.json(data.files);
  } catch (err) {
    next(err);
  }
});

// Handle file upload for the user
router.post('/:userId/files', multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const path = `public/files/${req.params.userId}`;
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      cb(null, path);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
}).array('file'), async (req, res, next) => {
  console.log(req.files);
  try {
    const newFiles = req.files.map(f => ({ path: f.path.replace(/^public/, '/api/user') }));
    console.log(`newFiles:\n${JSON.stringify(newFiles)}`);

    const data = await User.findOneAndUpdate({
      userId: req.params.userId,
    }, {
      $addToSet: { files: { $each: newFiles } },
    }, {
      new: true,
      projection: defaultProjection,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
