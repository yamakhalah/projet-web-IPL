var fs = require('fs');
'use strict';

// To check if a user is authenticated use
// if (req.isAuthenticated())

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        var file = fs.readFileSync("./views/index.html", "UTF8");
        res.status(200).send(file);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // Login page
    app.get('/login', function(req, res) {
        var file = fs.readFileSync("./views/login.html", "UTF8");
        res.status(200).send(file);
    });

    // process the login form
    // Since this is a Single page app, the redirection will be to index.html, but a check is needed to know what to show.
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/',
        failureRedirect : '/',
        failureFlash : true
    }));

    app.get('/signup', function(req, res) {
        res.redirect('/ok');
    });

    // process the signup form
    // Since this is a Single page app, the redirection will be to index.html, but a check is needed to know what to show.
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/',
        failureRedirect : '/',
        failureFlash : true 
    }));
};
