var fs = require('fs');
var logger = require('../config/logger');
var controllers = require('./controllers'); // no need to put /index.js because it is the default file
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var constants = require('../config/constants');
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

    // GET all games by night where user are registered

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
     * All the routes linked to the Emails **
     ***************************************/
    // POST send all the emails of unregistered users
    app.post('/emails/sendEmails', function(req, res) {
        req.body.users.forEach(function(user, index) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'night.game.ipl@gmail.com',
                    pass: 'n1ght.g4m3_1PL'
                }
            });
    
            var mailOptions = {
                from: 'night.game.ipl@gmail.com',
                to: user.email,
                subject: 'Invitation à une soirée jeux via night-game',
                text: 'Vous êtes invité à participer à une soirée jeux via night-game.\nVeuillez vous inscrire via ce lien: '
                    + constants.SERVER_ADDRESS + '/registration/' + user.id + ' \n\nA bientôt sur night-game.' 
            };
            
            transporter.sendMail(mailOptions, function(err, info){
                if (err) {
                    res.json({
                        confirmation: 'fail',
                        message: "Couldn't send email to " + user.email
                    })
                    logger.info(err)
                    return
                } else {
                  res.json({
                      confirmation: 'success'
                  })
                }
              }); 
        });
        
    });

    /****************************************
     * All the routes linked to the Nights **
     ***************************************/
    // GET all nights of a host (TO CONTINUE (Gaby))
   /* app.get('/nights/:host_id', function(req, res) {
        var controller = controllers["user"]

        // 1) Retrieve the user
        controller.findById(host_id, function(err, result) {

            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: "Couldn't find any games with that host_id : " + host_id
                })
                logger.info(err)
                return
            }

            // 2) Retrieve all the nights that have been created my the user
            controllers["night"].find({'_id': { $in: result.organisedNights.id}}, function(err, docs){
                console.log(docs);
            })
   
            res.json({
                data: results
            })
        })
    });*/


    // GET all games of a night
    app.get('/nights/games/:id/', function(req, res) {
        var controller = controllers["night"]

        controller.findById(id, function(err, results) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: "Couldn't find the games of this night : " + id
                })
                logger.info(err)
                return
            }

            res.json({
                data: results.games
            })
        });
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

    // POST a night
    app.post('/night', function(req, res, next) {
        var controller = controllers["night"]

        controller.create(req.body, function(err, result) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: err
                })
                logger.info(err)
                return
            }

            var nightId = {
                'id': result._id,
                'isValidated': false
            }
            if (req.user.organisedNights) {
                req.user.organisedNights.push(nightId)
            } else {
                req.user['organisedNights'] = [nightId]
            }

            var controller = controllers["user"]

            controller.update(req.user._id, req.user, function(err, user) {
                if (err) {
                    res.json({
                        confirmation: 'fail',
                        message: "Couldn't update this night : " + id
                    })
                    logger.info(err)
                    return
                }

                res.json({
                    data: result
                })
            })
        })
    })

    // Fetch the nights to which the connected user was invited
    app.get('/user-nights', function(req, res) {
        var controller = controllers["night"]

        controller.find(req.user._id.toString(), function(err, nights) {
            if (err) {
                res.json({
                    confirmation: 'fail',
                    message: "Couldn't find any users with the id : " + req.user._id.toString()
                })
                logger.info(err)
                return
            }

            var i = 0;
            
            var toReturn = new Array();
            controller = controllers["game"]
            for (let night of nights) {

                let ids = new Array();
                for (let game of night.games) {
                    ids.push(mongoose.Types.ObjectId(game.id));
                }

                controller.find({
                    '_id' : {$in : ids}
                }, function(err, games) {
                    toReturn.push({
                        'hostId' : night['hostId'],
                        'date' : night['date'],
                        'startTime' : night['startTime'],
                        'endTime' : night['endTime'],
                        'description' : night['description'],
                        'status' : night['status'],
                        'games' : games
                    })

                    i++;
                    if (i == nights.length-1) {
                        res.json({
                            data: toReturn
                        })
                    }
                })
            }
        })
    });
};

    