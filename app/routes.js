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

    app.get('/isAuthenticated', function(req, res) {
        logger.info("dedans?");
        if (req.isAuthenticated()) {
            res.status(200).send({ success: "logged in" });
        } else {
            res.status(400).send({ error: "not logged in" });
        }
    })

    /***************************************************
     * All the routes linked to the Login and signup ***
     **************************************************/

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                return next(err);
            }
            
            // if user is false, send error
            if (! user) {
                return res.send({ success : false, message : info });
            }
            req.login(user, loginErr => {
                if (loginErr) {
                    return next(loginErr);
                }
                return res.send({ success : true, message : info });
            });      
        })(req, res, next);
    });

    // process the signup form
    app.post('/signup', function(req, res, next) {
        var data = Array();
        data.push({ value : req.body.firstname, title : 'votre prénom' });
        data.push({ value : req.body.lastname, title : 'votre nom' });
        data.push({ value : req.body.email, title : 'votre adresse mail' });
        data.push({ value : req.body.password, title : 'votre mot de passe' });
        var check = checkData(data);
        if (! check.success) {
            return res.send(check);
        }

        if (req.body.password != req.body.passwordConfirmation) {
            return res.send({ success : false, message : "Les deux mots de passes ne sont pas identiques" });
        }

        passport.authenticate('local-signup', function(err, user, info) {
            if (err) {
                return next(err);
            }
            
            if (! user) {
                return res.send({ success : false, message : info });
            }

            return res.send({ success : true, message : info });
        })(req, res, next);
    });

    // Check if a user is connected before performing any action
    app.get('/*', function(req, res, next) {
        if (req.url == "/webapp/bootstrap/bootstrap.min.css.map") {
            return next();
        }
        if (req.url == "/isAuthenticated") {
            return next();
        }
        if (! req.isAuthenticated()) {
            return res.status(405);
        }

        console.log(req.url);
        return next();
    })

    app.post('/*', function(req, res, next) {
        if (! req.isAuthenticated()) {
            res.status(405);
            return;
        }
        return next();
    })

    /****************************************
     * All the routes linked to the Users ***
     ***************************************/
    // GET all the users
    app.get('/users', function(req, res) {
        var controller = controllers["user"]

        controller.find({password: { $exists: true }}, function(err, results) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
                logger.info(err)
                return
            }

            logger.info("GET Users : OK");
            res.json({
                success: true,
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
                    success: false,
                    message: 'Couldn\'t find the user'
                })
                logger.info(err)
                return
            }

            res.json({
                success: true,
                result: result
            })
        })
    });

    //POST : update user
    app.post('user/update/:id', function (req, res) {
        var controller = controllers["user"];
        var id = req.params.id;

        controller.update(id, req.body, function(err, result) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
                logger.info(err)
                return
            }

            res.json({
                success: true,
                data: result
            })
        });
    });

    // POST : add users by mail
    app.post('/users/addUsersByMail', function(req, res) {
        var controller = controllers["user"];
        var usersArray = Array();
        var emailsArray = Array();
        var itemsCount = 0;

        console.log(req.body.tabEmails);

        req.body.tabEmails.forEach(function(emailUser, index) {
            console.log(emailUser);
            controller.find({ email: emailUser.toString() }, function(err, resultFind) {
                if (err) {
                    res.json({
                        success: false,
                        message: err
                    })
                    logger.info(err)
                    return
                }

                if (resultFind.length === 0) {
                    console.log(itemsCount);
                    var user = { email: emailUser }
                    controller.create(user, function(err, result) {
                        
                        if (err) {
                            res.json({
                                success: false,
                                message: err
                            })
                            logger.info(err)
                            return
                        }

                        usersArray.push(result._id);
                        emailsArray.push({ id: result._id, email: result.email });

                        itemsCount++;
                        if (itemsCount === req.body.tabEmails.length) { 
                            res.json({
                                userIds: usersArray,
                                userEmails: emailsArray
                            });
                        }
                    });
                } else {
                    usersArray.push(resultFind[0]._id);
                    itemsCount++;
                }

                if (itemsCount === req.body.tabEmails.length) {                  
                    res.json({
                        userIds: usersArray,
                        userEmails: emailsArray
                    });
                }
            });

            console.log(usersArray);
            
        });
    })
    
    /****************************************
     * All the routes linked to the Games ***
     ***************************************/
    // GET all games
    app.get('/games', function(req, res) {
        var controller = controllers["game"]

        controller.find(null, function(err, results) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
                logger.info(err)
                return
            }

            res.json({
                data: results,
                success: true
            })
        })
    });

    // GET one game by ID
    app.get('/game/:id', function(req, res) {
        var id = req.params.id
        var controller = controllers["game"]

        controller.findById(id, function(err, result) {
            if (err) {
                res.json({
                    success: false,
                    message: 'Couldn\'t find the game'
                })
                logger.info(err)
                return
            }

            res.json({
                data: result,
                success: true
            })
        })
    });

    // POST a game
    app.post('/game', function(req, res, next) {
        var data = Array();
        data.push({ value : req.body.name, title : 'le nom' });
        data.push({ value : req.body.description, title : 'la description' });
        data.push({ value : req.body.minPlayers, title : 'le nombre de joueurs minimum' });
        data.push({ value : req.body.maxPlayers, title : 'le nombre de joueurs maximum' });
        var check = checkData(data);
        if (! check.success) {
            res.json(check);
            return;
        }

        var controller = controllers["game"]

        controller.create(req.body, function(err, result) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
                logger.info(err)
                return
            }

            res.json({
                data: result,
                success: true,
                message: "Le jeu a bien été ajouté."
            })
        })
    })

    //POST update a game
    app.post('/game/update/:id', function(req, res) {
        var data = Array();
        data.push({ value : req.body.name, title : 'le nom' });
        data.push({ value : req.body.description, title : 'la description' });
        data.push({ value : req.body.minPlayers, title : 'le nombre de joueurs minimum' });
        data.push({ value : req.body.maxPlayers, title : 'le nombre de joueurs maximum' });
        var check = checkData(data);
        if (! check.success) {
            res.json(check);
            return;
        }

        var controller = controllers["game"];
        var id = req.params.id;

        controller.update(id, req.body, function(err, reuslt) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
                logger.info(err);
                return
            }

            res.json({
                success: true,
                message: "The game has been successfully updated"
            })
        });
    });

    // DELETE a game
    app.delete('/game/:id', function(req, res) {
        var controller = controllers["game"];
        var id = req.params.id;

        controller.delete(id, function(err, result) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
                logger.info(err)
                return
            }

            res.json({
                success: true,
                message: "the game has been deleted: " + id
            })
        })
    });

    /****************************************
     * All the routes and method linked to the Emails **
     ***************************************/
    // Methods to send emails to unregistered users
    var sendEmailsToUnregisteredUser = function(user) {
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
                logger.info(err)
                return "Couldn't send email to " + user.email;
            } else {
              return "Email correctly send.";
            }
        }); 
    };

    var sendEmailsToRegisteredUser = function(user) {
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
            text: 'Vous êtes invité à participer à une soirée jeux via night-game.\nVeuillez vous connecter au site pour accèder à l\'invitation'
                + '\n\nA bientôt sur night-game.' 
        };
        
        transporter.sendMail(mailOptions, function(err, info){
            if (err) {
                logger.info(err)
                return "Couldn't send email to " + user.email;
            } else {
              return "Email correctly send.";
            }
        }); 
    };

    var sendConfirmationEmails = function(user, night, game) {
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
            subject: 'Confirmation à une soirée jeux via night-game',
            text: 'La soirée du ' + night.date.toISOString().substring(0, 10) + ' a été confirmé pour le jeu ' + game.name + ' !\nVeuillez vous connecter au site pour accèder à la soirée en question.'
                + '\n\nA bientôt sur night-game.' 
        };
        
        transporter.sendMail(mailOptions, function(err, info){
            if (err) {
                return "Couldn't send mail."
            } else {
                return "Email correctly send.";
            }
        }); 
    }

    // POST send all the confirmation emails of a night
    app.post('/emails/sendConfirmationEmails/:idNight', function(req, res) {
        var controllerNight = controllers["night"];
        var controllerUser = controllers["user"];
        var id = req.params.idNight;

        controllerNight.findById(id, function(err, night) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
                logger.info(err)
                return
            }

            night.guests.forEach(function (user, index) {
                if (user.isValidated) {
                    controllerUser.findById(user.id, function(err, result) {

                    });
                }
            });
        });
    });

    /****************************************
     * All the routes linked to the Nights **
     ***************************************/
    // GET all nights of a host
    app.get('/nights/:hostId', function(req, res) {
        var hostId = req.params.hostId;

        if (hostId == "user")
            hostId = req.user._id.toString();

        var controller = controllers["night"]

        controller.findByDate({ hostId: hostId }, function(err, nights) {
            if (err) {
                logger.info({
                    success: false,
                    message: "Couldn't find any nights for the user"
                })
                return
            }

            var i = 0;
            
            var toReturn = new Array();
            controller = controllers["game"]
            for (let night of nights) {
                let nbParticipants = Array();
                var validated = false;
                let validateds = Array();

                let ids = new Array();
                for (let game of night.games) {
                    nbParticipants.push(game.nbParticipants);
                    validateds.push(game.isValidated);
                    if (game.isValidated) {
                        validated = true;
                    }
                    ids.push(mongoose.Types.ObjectId(game.id));
                }

                controller.find({
                    '_id' : {$in : ids}
                }, function(err, games) {
                    toReturn.push({
                        'id' : night['_id'],
                        'hostId' : night['hostId'],
                        'name' : night['name'],
                        'date' : night['date'],
                        'startTime' : night['startTime'],
                        'endTime' : night['endTime'],
                        'description' : night['description'],
                        'status' : night['status'],
                        'games' : games,
                        'nbParticipants' : nbParticipants,
                        'validated' : validated,
                        'validateds' : validateds
                    });
                    i++;
                    if (i == nights.length) {
                        res.json({
                            data: toReturn,
                            success: true
                        })
                    }
                })
            }
        })
    });

    // GET all games of a night
    app.get('/night/:idNight/games/', function(req, res) {
        var id = req.params.idNight;
        var controller = controllers["night"]

        controller.findById(id, function(err, results) {
            if (err) {
                res.json({
                    success: false,
                    message: "Couldn't find the games of this night : " + id
                })
                logger.info(err)
                return
            }

            res.json({
                data: results.games,
                success: true
            })
        });
    });

    // GET all games by night where user is in
    app.get('/night/findGamesByAuthenticatedUser/:idNight', function(req, res) {
        // TODO
        var controllerNight = controllers["night"];
        var controllerGame = controllers["game"];
        var idNight = req.params.idNight;
        var itemsCount = 0;

        controllerNight.findById(idNight, function(err, result) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
                logger.info(err)
                return
            }

            var games = result.games;
            var gamesToReturn = [];
            games.forEach(function (game, index) {
                if (game.participants.includes(req.user._id)) {
                    controllerGame.findById(game._id, function(err, result) {
                        if (err) {
                            res.json({
                                success: false,
                                message: err
                            })
                            logger.info(err)
                            return
                        }
                        gamesToReturn.push(result);

                        itemsCount++;

                        if (itemsCount === games.length) {
                            res.json({
                                data: gamesToReturn,
                                success: true
                            });
                        }
                    });
                } else {
                    itemsCount++;

                    res.json({
                        data: gamesToReturn,
                        success: true
                    });
                }
            });
        })
    });

    // POST update : validate a user in a night
    // DO NOT USE !!!!!!
    app.post('/night/:idNight/validateUser', function(res, req) {
        var controller = controllers["night"];
        var id = req.params.id;

        controller.findById(id, function (err, result) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
                logger.info(err);
                return
            }

            var index = result.guests.findIndex(function (user) {
                if (req.user._id === user.id) {
                    return user;
                }
            });

            result.guests[index].isValidated = true;

            controller.update(result._id, result, function(err, result) {
                if (err) {
                    res.json({
                        success: false,
                        message: err
                    });
                    logger.info(err);
                    return
                }

                res.json({
                    success: true,
                    message: "User added to the game"
                });
            });
        });
    });

    // POST update : add a participants to a game
    app.post('/night/:idNight/addParticipant/:idGame', function(req, res) {
        var controller = controllers["night"];
        var idNight = req.params.idNight;
        var idGame = req.params.idGame;
        var controllerGame = controllers["game"];

        controller.findById(idNight, function (err, result) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
                logger.info(err);
                return
            }

            var index = result.games.findIndex(function (game) {
                if (game.id === idGame) {
                    return game;
                }
            });


            var indexUser = result.games[index].participants.findIndex(function (user) {
                if (user.userId === req.user._id.toString()) {
                    return user;
                }
            });

            if (indexUser === -1) {
                var indexGuest = result.guests.findIndex(function (user) {
                    if (req.user._id.toString() === user.id) {
                        return user;
                    }
                });

                result.guests[indexGuest].isValidated = true;

                controllerGame.findById(result.games[index].id, function (err, resultGame) {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        });
                        logger.info(err);
                        return
                    }
                    
                    if (result.games[index].nbParticipants < resultGame.maxPlayers) {
                        result.games[index].participants.push({ userId : req.user._id });
                        result.games[index].nbParticipants++;
            
                        controller.update(result._id, result, function(err, result) {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err
                                });
                                logger.info(err);
                                return
                            }
            
                            res.json({
                                success: true,
                                message: "Vous avez bien été ajouté au jeu, vous pouvez désormais y participer"
                            });
                        });
                    } else {
                        res.json({
                            success: false,
                            message: "Le nombre maximum à été atteint pour ce jeu."
                        }); 
                    }
                });
            } else {
                res.json({
                    success: false,
                    message: "Vous êtes déjà enregistré."
                });
            }
            
        });
    });

    // POST update : delete a participants to a game
    app.post('/night/:idNight/deleteParticipant/:idGame', function(res, req) {
        var controller = controllers["night"];
        var idNight = req.params.idNight;
        var idGame = req.params.idGame;

        controller.findById(idNight, function (err, result) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
                logger.info(err);
                return
            }
            var user = Array();
            user.push({ userId : req.user._id });

            var index = result.games.findIndex(function (game) {
                if (game.id == idGame) {
                    return game;
                }
            });

            if (result.games[index].nbParticipants > 0) {
                result.games[index].participants.splice(index, 1);
                result.games[index].nbParticipants--;
    
                controller.update(result._id, result, function(err, result) {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        });
                        logger.info(err);
                        return
                    }
    
                    res.json({
                        success: true,
                        message: "User added to the game"
                    });
                });
            } else {
                res.json({
                    success: false,
                    message: "There is no user in this game."
                })
            }
        })
    });

    // GET : upcomming nights
    app.get('/nights/upCommingNights', function(req, res) {
        var dateNow = Date.now();
        var controller = controllers["night"];

        controller.find({
            date : {$gt: dateNow},
            "games.participants": {$elemMatch: {id: req.user._id.toString()}},
            "games.isValidated": true
        }, function(err, nights) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
                logger.info(err);
                return
            }

            console.log("ixi?");

            var toReturn = new Array();
            controller = controllers['game'];
            for (var night of nights) {
                for (var game of night.games) {
                    if (game.isValidated) {
                        controller.findById(mongoose.Types.ObjectId(game.id), function(err, fullGame) {
                            toReturn.push({
                                'id' : night['_id'],
                                'hostId' : night['hostId'],
                                'name' : night['name'],
                                'date' : night['date'],
                                'startTime' : night['startTime'],
                                'endTime' : night['endTime'],
                                'description' : night['description'],
                                'status' : night['status'],
                                'game' : fullGame,
                                'nbParticipants' : game.nbParticipants
                            });

                            i++;
                            if (i == nights.length) {
                                res.json({
                                    data: toReturn,
                                    success: true
                                })
                            }
                        })
                    }
                }
            }
        })
    });

     // POST to change nights status
     // DO NOT USE !!!!!!!!!!
    app.post('/nights/:id/:status', function(req, res) {
        var controller = controllers["night"]

        controller.update(id, req.body, function(err, results) {
            if (err) {
                res.json({
                    success: false,
                    message: "Couldn't update this night : " + id
                })
                logger.info(err)
                return
            }

            res.json({
                data: results,
                success: true
            })
        })
    });

    // POST Confirm game & night
    app.post('/night/:idNight/confirm/:idGame', function(req, res) {
        var controllerNight = controllers["night"];
        var controllerGame = controllers["game"];
        var controllerUser = controllers["user"];
        var idNight = req.params.idNight;
        var idGame = req.params.idGame;

        controllerNight.findById(idNight, function(err, night) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
                logger.info(err)
                return
            }

            var index = night.games.findIndex(function (game) {
                if (game.id == idGame) {
                    return game;
                }
            });

            if (index !== -1) {
                

                controllerGame.findById(idGame, function (err, game) {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        })
                        logger.info(err)
                        return
                    }

                    if (night.games[index].nbParticipants >= game.minPlayers) {
                        night.games[index].isValidated = true;
                        
                        night.status = constants.CONFIRMED_NIGHT;
    
                        controllerNight.update(idNight, night, function (err, result) {
                            if (err) {
                                res.json({
                                    success: false,
                                    message: err
                                })
                                logger.info(err)
                                return
                            }
    
                            night.guests.forEach(function(user, i) {
                                if (user.isValidated === true) {
                                    controllerUser.findById(user.id, function(err, userDB) {
                                        var message = sendConfirmationEmails(userDB, night, game);
                                        res.json({
                                            success: true,
                                            message: message
                                        })
                                        return
                                    });
                                }
                            });
    
                            res.json({
                                success: true,
                                message: "Soirée mise à jour"
                            });
                            return
                        });
                    } else {
                        res.json({
                            message: "Il n'y a pas assez de joueur."
                        });
                        return
                    }
                });
            } else {
                res.json({
                    message: "Ce jeu n'existe pas dans cette soirée."
                });
                return
            } 
        });
    });

    // POST Cancel a night
    app.post('night/:idNight/cancel', function(req, res) {
        controllerNight.findById(idNight, function(err, night) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                })
                logger.info(err)
                return
            }

            night.status = constants.CANCELLED_NIGHT;

            controllerNight.update(idNight, night, function (err, result) {
                if (err) {
                    res.json({
                        success: false,
                        message: err
                    })
                    logger.info(err)
                    return
                }

                res.json({
                    success: true,
                    message: "Soirée mise à jour."
                });
            });
        });
    });

    // POST a night
    app.post('/night', function(req, res, next) {
        // Check if the data is fully filled
        var data = Array();
        data.push({ value : req.body.name, title : 'le nom' });
        data.push({ value : req.body.date, title : 'la date' });
        data.push({ value : req.body.startTime, title : 'l\'heure de début' });
        data.push({ value : req.body.endTime, title : 'l\'heure de fin' });
        var check = checkData(data);
        if (! check.success) {
            res.json(check);
            return;
        }

        var controller = controllers["night"];

        req.body['hostId'] = req.user._id.toString();
        controller.create(req.body, function(err, result) {
            if (err) {
                res.json({
                    success: false,
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

            controller.update(req.user._id.toString(), req.user, function(err, user) {
                if (err) {
                    res.json({
                        success: false,
                        message: "Couldn't update the user organising the night : " + id
                    })
                    logger.info(err)
                    return
                }

                res.json({
                    data: result,
                    success: true
                });
            });

            req.body.guests.forEach(function(user, index) {
                controller.findById(user.id, function(err, result) {
                    var message;
                    if (result.hasOwnProperty('password')) {
                        message = sendEmailsToRegisteredUser(result);
                    } else {
                        message =sendEmailsToUnregisteredUser(result);
                    }
                    res.json({
                        message: message
                    })
                })
            });
        });
    });

    // Fetch the nights to which the connected user was invited
    app.get('/user-nights', function(req, res) {
        var controller = controllers["night"]
        var dateNow = Date.now();

        controller.findByDate({"guests": {$elemMatch: {id: req.user._id.toString()}}}, function(err, nights) {
            if (err) {
                res.json({
                    success: false,
                    message: "Couldn't find any users with the id : " + req.user._id.toString()
                })
                logger.info(err)
                return
            }

            var i = 0;
            
            var toReturn = new Array();
            controller = controllers["game"]
            for (let night of nights) {
                let nbParticipants = Array();

                let ids = new Array();
                for (let game of night.games) {
                    nbParticipants.push(game.nbParticipants);
                    ids.push(mongoose.Types.ObjectId(game.id));
                }

                if (night.date < dateNow) {
                    night.status = constants.FINISHED_NIGHT;

                    controller.update(night._id, night, function (err, result) {
                        if (err) {
                            res.json({
                                success: false,
                                message: err
                            })
                            logger.info(err)
                            return
                        }
                    });
                }

                controller.find({
                    '_id' : {$in : ids}
                }, function(err, games) {
                    toReturn.push({
                        'id' : night['_id'],
                        'hostId' : night['hostId'],
                        'name' : night['name'],
                        'date' : night['date'],
                        'startTime' : night['startTime'],
                        'endTime' : night['endTime'],
                        'description' : night['description'],
                        'status' : night['status'],
                        'games' : games,
                        'nbParticipants' : nbParticipants
                    });

                    i++;
                    if (i == nights.length) {
                        res.json({
                            data: toReturn.sort({ date : 1}),
                            success: true
                        })
                    }
                })
            }
        })
    });
};

var checkData = function (data) {
    for (var element of data) {
        if (element.value == "" || element.value == null) {
            return {success: false, message: "Veuillez remplir " + element.title}
        }
    }
    return { success: true }
}
