var NightGame = require('../models/nightGame.js')

module.exports = {
    find: function(params, callback) {
        NightGame.find(params, function(err, nightGames) {
            if (err) {
                callback(err, null)
                return 
            }
            callback(null, nightGames)
        })
    },

    findById: function(id, callback) {
        NightGame.findById(id, function(err, nightGame) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, nightGame)
        })
    },

    create: function(params, callback) {

        NightGame.create(params, function(err, nightGame) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, nightGame)
        })
    },

    update: function(id, params, callback) {
        NightGame.findByIdAndUpdate(id, params, {new:true}, function(err, nightGame){
            if (err) {
                callback(err, null)
                return
            }
            callback(null, nightGame)
        })
    },

    delete: function(id, callback) {
        NightGame.findByIdAndRemove(id, function(err) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, null)
        })
    },
}