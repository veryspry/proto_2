const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();
const uuidV4 = require('uuid/v4'); //generates cryptographically strong secret with UUID-v4
const mongoStore = require('express-mongoose-store')(session, mongoose);
const db = mongoose.connection;

mongoose.connect('mongodb://localhost:27017/proto_2'); //connection or existing mongoose connection
db.on('error', console.error.bind(console, 'connection error:'));

app.use(session({
    secret: uuidV4(),
    cookie: {
        maxAge: 3600000, // one hour
        secure: app.get('env') === 'production', // sets to true when prod
    },
    store: new mongoStore({
        mongooseConnection: db,
    }),
    rolling: false,
    saveUninitialized: false,
    resave: false
}));

// make user ID available in template
app.use( (req, res, next) => {
  // locals sort of lets us store a custom variable in the locals field
  res.locals.currentUser = req.session.userId;

  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

const routes = require('./routes/index');

app.use('/', routes);

app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

const port = 3000;

app.listen(port, function () {
  console.log(`Express app listening on port ${port}`);
});
