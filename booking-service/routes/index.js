const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Booking service');
});

router.post('/:bookingId/new-files', (req, res) => {
  const newFiles = req.body;
  console.log(`New files:\n${JSON.stringify(newFiles, null, 2)}`);
  console.log(`Send to room: ${req.params.bookingId}`);
  res.io.to(`${req.params.bookingId}`).emit('new files', newFiles);
  res.status(200).send();
});

module.exports = router;
