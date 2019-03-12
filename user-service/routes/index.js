const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const del = require('del');

const User = require('../models/user');

const router = express.Router();

const defaultProjection = {
  _id: false,
  __v: false,
};

// Get all users
router.get('/', async (req, res, next) => {
  console.log('Get all users');
  try {
    const data = await User.find({}, defaultProjection);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Create a new user
router.post('/', async (req, res, next) => {
  console.log(`Create new user with userId: ${req.body.userId}`);
  try {
    const user = new User({
      userId: req.body.userId,
      locations: req.body.locations,
      files: req.body.files,
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
      const userDir = `public/files/${req.params.userId}`;
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      cb(null, userDir);
    },
    filename: (req, file, cb) => {
      // Add the current ISO time string to the request as req.params.time
      req.params.time = new Date().toISOString();
      const { name, ext } = path.parse(file.originalname);
      cb(null, `${name}-${req.params.time}${ext}`);
    },
  }),
}).array('file'), async (req, res, next) => {
  console.log(req.files);
  try {
    const newFiles = req.files.map(f => ({
      time: req.params.time,
      name: f.filename,
      path: f.path.replace(/^public/, '/api/user'),
    }));
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

// Delete all files for the user
router.delete('/:userId/files', async (req, res, next) => {
  console.log(`Delete all files from user with userId ${req.params.userId}`);
  try {
    const data = await User.findOneAndUpdate({
      userId: req.params.userId,
    }, {
      $set: { files: [] },
    }, {
      new: true,
      projection: defaultProjection,
    });

    const deleted = await del([`public/files/${req.params.userId}/*`]);
    console.log(`Deleted: ${JSON.stringify(deleted)}`);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Delete file for the user
router.delete('/:userId/files/:fileId', async (req, res, next) => {
  console.log(`Delete file with fileId ${req.params.fileId} from user with userId ${req.params.userId}`);
  try {
    // Find the existing file
    const fileObj = (await User.findOne({
      userId: req.params.userId,
      // files: { _id: req.params.fileId },
    }, {
      files: { $elemMatch: { _id: req.params.fileId } },
    }, {
      projection: 'files',
    })).files[0];

    if (!fileObj) {
      console.log('File not found');
      res.status(404).send('File not found');
    } else {
      console.log(`Existing file object found: ${JSON.stringify(fileObj)}`);

      const data = await User.findOneAndUpdate({
        userId: req.params.userId,
      }, {
        $pull: { files: { _id: req.params.fileId } },
      }, {
        new: true,
        projection: defaultProjection,
      });

      const filePath = fileObj.path.replace(/^\/api\/user/, 'public');
      const deleted = await del([filePath]);
      if (!deleted) {
        console.warn(`Tried to delete ${JSON.stringify(deleted)} but deleted was empty`);
      } else {
        console.log(`Deleted: ${JSON.stringify(deleted)}`);
      }

      res.json(data);
    }
  } catch (err) {
    next(err);
  }
});

// Update preferences for user
router.put('/:userId/preferences', async (req, res, next) => {
  console.log(`Update preferences for user ${req.params.userId}`);
  try {
    const data = await User.findOneAndUpdate({
      userId: req.params.userId,
    }, {
      $set: { preferences: req.body },
    }, {
      new: true,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
