const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();

/**
 * Create HTTP server.
 */

const server = http.Server(app);

/**
 * Create socket.io instance
 */

const io = socketio(server, {
  path: '/file-socket',
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('bookingId', (bookingId) => {
    socket.join(bookingId);
    console.log(`Added socket to room: ${bookingId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.io = io;
  next();
});

app.use('/', indexRouter);

module.exports = {
  app,
  server,
};
