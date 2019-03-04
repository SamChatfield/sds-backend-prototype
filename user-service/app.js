require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');

const app = express();

// Database setup
setTimeout(() => {
  mongoose.connect('mongodb://db/user?authSource=admin', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  }).then(() => {
    console.log('Connected to database');
  }).catch((err) => {
    console.error(`Could not connect to database. Exiting...\n${err}`);
    process.exit(1);
  });
}, 2000);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;
