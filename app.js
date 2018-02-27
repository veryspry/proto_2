const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
// we have to require the module but also call it with the session argument so that this middleware can access the sessions
const MongoStore = require('connect-mongo')(session);
const app = express(); 

  
const mongoStore = require('express-mongoose-store')(session, mongoose);
mongoose.connect('mongodb://localhost:27017/proto_2'); //connection or existing mongoose connection

const db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

const uuidV4 = require('uuid/v4'); //generates cryptographically strong secret with UUID-v4
const oneHour = 3600000;
const store = new mongoStore({modelName : "sessionName"} /* other store options here*/);
app.use(session(
{
secret : uuidV4(),
cookie : {maxAge: oneHour, secure: true},
store : store,
rolling : false,
saveUninitialized : false,
resave : false
}));

// make user ID available in template
app.use( (req, res, next) => {
  // locals sort of lets us store a custom variable in the locals field

  console.log(req.session, 'in the middleware')

  res.locals.currentUser = req.session.userId;
  next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
const routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
const port = 3000;
app.listen(port, function () {
  console.log(`Express app listening on port ${port}`);
}); 
