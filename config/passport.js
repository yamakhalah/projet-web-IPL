var LocalStrategy   = require('passport-local').Strategy;
var logger = require('./logger');

var User = require('../app/models/user');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        logger.info(email);
        User.findOne({ 'email' :  email }, function(err, user) {
            if (err) {
                logger.info("An error occured when trying to find the user");
                return done(null, false, 'Une erreur est survenue.');
            }

            if (user) {
                logger.info("The user allready exists");
                return done(null, false, 'L\'utilisateur existe déjà' );
            } else {
                var newUser = new User();

                newUser.firstname = req.body.firstname;
                newUser.lastname = req.body.lastname;
                newUser.email = email;
                newUser.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err) {
                        logger.info("An error occured while trying to save the user");
                        return done(null, false, 'Une erreur est survenue.');
                    }
                    logger.info("The user has been added");
                    return done(null, newUser, "Vous pouvez dès a présent vous connecter");
                });
            }

        });

    }));

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        User.findOne({ 'email': email }, function(err, user) {
            if (err) {
                logger.info("An error occured when trying to find the user");
                return done(null, false, 'Une erreur est survenue.');
            }

            if (!user) {
                logger.info("User not found");
                return done(null, false, 'Aucun utilisateur n\'a été trouvé avec cet identifiant.');
            }

            if (!user.validPassword(password)) {
                logger.info("Wrong password.");
                return done(null, false, 'Oops, mauvais mot de passe.'); 
            }

            return done(null, user, 'Connexion réussie');
        });

    }));

};
