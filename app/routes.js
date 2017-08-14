var fs = require('fs');
var logger = require('../config/logger');
var controllers = require('./controllers') // no need to put /index.js because it is the default file
'use strict';

// To check if a user is authenticated use
// if (req.isAuthenticated())

/**
 * Export the module
 * @param  {express} app     Instance of the express middleware
 * @param  {passport} passport Instance of the passport middleware
 */
module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        var file = fs.readFileSync("./views/index.html", "UTF8");
        res.status(200).send(file);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/isAuthenicated', function(req, res) {
        if (req.isAuthenticated()) {
            logger.info("oui");
            res.status(200).send({ success: "logged in" });
        } else {
            res.status(400).send({ error: "not logged in" });
        }
    })

    /****************************************
     * All the routes linked to the Users ***
     ***************************************/
    // GET all the users
    app.get('/users', function(req, res) {
        var controller = controllers["user"]

        controller.find(null, function(err, results) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: err
                })
                logger.info(err)
                return
            }

            logger.info("GET Users : OK");
            res.json({
                confirmation: 'success',
                data: results
            })
        })
    });

    // GET one user by ID
    app.get('/user/:id', function(req, res) {
        var id = req.params.id
        var controller = controllers["user"]

        controller.findById(id, function(err, result) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: 'Couldn\'t find the user'
                })
                logger.info(err)
                return
            }

            res.json({
                confirmation: 'success',
                result: result
            })
        })
    });

    
    /****************************************
     * All the routes linked to the Games ***
     ***************************************/
    // GET all games
    app.get('/games', function(req, res) {
        var controller = controllers["game"]

        controller.find(null, function(err, results) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: err
                })
                logger.info(err)
                return
            }

            res.json(
                {data: results}
            )
        })
    });

    // GET one game by ID
    app.get('/game/:id', function(req, res) {
        var id = req.params.id
        var controller = controllers["game"]

        controller.findById(id, function(err, result) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: 'Couldn\'t find the game'
                })
                logger.info(err)
                return
            }

            res.json({
                data: result
            })
        })
    });

    // POST a game
    app.post('/game', function(req, res, next) {
        var controller = controllers["game"]

        controller.create(req.body, function(err, result) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: err
                })
                logger.info(err)
                return
            }

            res.json({
                data: result
            })
        })
    })

    /***************************************************
     * All the routes linked to the Login and signup ***
     **************************************************/
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

    /****************************************
     * All the routes linked to the Nights **
     ***************************************/
    // GET all nights of a host
    app.get('/nights/:host_id', function(req, res) {
        var controller = controllers["night"]

        controller.find(host_id, function(err, results) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: "Couldn't find any games with that host_id : " + host_id
                })
                logger.info(err)
                return
            }

            res.json({
                data: results
            })
        })
    });

     // POST to change nights status
    app.post('/nights/:id', function(req, res) {
        var controller = controllers["night"]

        controller.update(id, req.body, function(err, results) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: "Couldn't update this night : " + id
                })
                logger.info(err)
                return
            }

            res.json({
                data: results
            })
        })
    });

    // Fetch the nights to which the connected user was invited
    app.get('/night-users', function(req, res) {
        var controller = controllers["night-user"]

        controller.find(req.user._id, function(err, results) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: "Couldn't find any users with the id : " + req.user._id
                })
                logger.info(err)
                return
            }

            controller = controllers["night"];
            let toReturn = {}
            for (let result in results) {
                controller.findById(result.nightId, function(err, night) {
                    if (err) {
                        logger.info("The night with the id: " + result.nightId + " could not be found");
                    }
                    toReturn[night._id] = night;
                })
            }

            res.json({
                data: toReturn
            })
        })
    });
};

    