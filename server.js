var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var path = require('path');

var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');
var logger = require("./config/logger.js");

mongoose.connect(configDB.url, function(err, res) {
    if (err) {
        ('DB CONNECTION FAILED')
    } else {
        logger.info('CONNECTED SUCCESSFULLY TO DATABASE')
    }
});


require('./config/passport')(passport);

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use('/webapp', express.static(path.join(__dirname, '/views')));

// passport
app.use(session({
    secret: 'SDFGsdfgsdfgDFg hjgJFGH ertyERTdff',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

require('./app/routes.js')(app, passport);

app.listen(port);
logger.info('The magic happens on port ' + port);
