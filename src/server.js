import 'babel/polyfill';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import express from 'express';
import favicon from 'serve-favicon';
import logger from'./config/logger';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import db from './config/lowdb';
import map from './api/map';

const server = global.server = express();
const env = process.env.NODE_ENV || 'development';
const templateFile = path.join(__dirname, '../www/index.html');

server.set('port', (process.env.PORT || 5000));
server.use(express.static(path.join(__dirname, '../www')));

// view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//server.use(favicon(__dirname + '/public/favicon.ico'));
//server.use(logger('dev'));
server.use(require("morgan")("combined", {"stream": logger.stream}));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));
server.use(cookieParser());

// Add headers
server.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

server.use('/api/map', map(db));

server.get('/', async (req, res, next) => {
  try {
    let statusCode = 200;

    const html = fs.readFileSync(templateFile, 'utf8');
    res.status(statusCode).send(html);
  } catch (err) {
    next(err);
  }
});

// catch 404 and forward to error handler
server.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (server.get('env') === 'development') {
  server.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
server.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//
// Launch the server
// -----------------------------------------------------------------------------

server.listen(server.get('port'), () => {
  if (process.send) {
    process.send('online');
  } else {
    console.log('The server is running at http://localhost:' + server.get('port'));
  }
});
