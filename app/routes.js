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

        req.body.forEach(function(emailUser, index) {
            controller.find({ email: emailUser }, function(err, resultFind) {
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
                        if (itemsCount === req.body.length) { 
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

                if (itemsCount === req.body.length) {                  
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

    /****************************************
     * All the routes linked to the Emails **
     ***************************************/
    // POST send all the emails of unregistered users
    app.post('/emails/sendEmailsToUnregisteredUser', function(req, res) {
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
                        success: false,
                        message: "Couldn't send email to " + user.email
                    })
                    logger.info(err)
                    return
                } else {
                  res.json({
                      success: true,
                      message: "Email correctly send."
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
    app.get('/night/findByAuthenticatedUser/:idNight', function(req, res) {
        // TODO
        var controllerNight = controllers["night"];
        var controllerGame = controllers["game"];
        var idNight = req.params.idNight;

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
                });
            });
            
            res.json({
                data: gamesToReturn,
                success: true
            });
            
        })
    });

    // POST update : add a participants to a game
    app.post('/night/:idNight/addParticipant/:idGame', function(res, req) {
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
                if (game._id == idGame) {
                    return game;
                }
            });

            result.games[index].participants.push(user);
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
                    message: "User added to the game"
                });
            })
        })
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
                if (game._id == idGame) {
                    return game;
                }
            });

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
            })
        })
    });

    // GET : upcomming nights
    app.get('/nights/upCommingNights', function(req, res) {
        var dateNow = Date.now();
        var controller = controllers["night"];

        controller.find({ date : {$gt: dateNow}}, function(err, result) {
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
                data: result.sort({date: 1})
            })
        })
    });

     // POST to change nights status
     // TODO
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

    // POST a night
    app.post('/night', function(req, res, next) {
        // Check if the data is fully filled
        var data = Array();
        data.push({ value : req.body.date, title : 'la date' });
        data.push({ value : req.body.startTime, title : 'l\'heure de début' });
        data.push({ value : req.body.endTime, title : 'l\'heure de fin' });
        var check = checkData(data);
        if (! check.success) {
            res.json(check);
            return;
        }

        var controller = controllers["night"];

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

            controller.update(req.user._id, req.user, function(err, user) {
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
                            data: toReturn,
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
