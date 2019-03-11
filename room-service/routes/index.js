const express = require('express');

const router = express.Router();

const roomPermissions = {
  222: ['1642203'],
  225: ['1234567'],
};

router.get('/', (req, res) => {
  res.send('Room Service');
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
