var Game = require('../models/game.js')

module.exports = {
    find: function(params, callback) {
        Game.find(params, function(err, games) {
            if (err) {
                callback(err, null)
                return 
            }
            callback(null, games)
        })
    },

    findById: function(id, callback) {
        Game.findById(id, function(err, game) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, game)
        })
    },

    create: function(params, callback) {

        Game.create(params, function(err, game) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, game)
        })
    },

    update: function(id, params, callback) {
        Game.findByIdAndUpdate(id, params, {new:true}, function(err, game){
            if (err) {
                callback(err, null)
                return
            }
            callback(null, game)
        })
    },

    delete: function(id, callback) {
        Game.findByIdAndRemove(id, function(err) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, null)
        })
    },
}