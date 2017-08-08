var NightGameUser = require('../models/nightGameUser')

module.exports = {
    find: function(params, callback) {
        NightGameUser.find(params, function(err, nightGameUsers) {
            if (err) {
                callback(err, null)
                return 
            }
            callback(null, nightGameUsers)
        })
    },

    findById: function(id, callback) {
        NightGameUser.findById(id, function(err, nightGameUser) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, nightGameUser)
        })
    },

    create: function(params, callback) {

        NightGameUser.create(params, function(err, nightGameUser) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, nightGameUser)
        })
    },

    update: function(id, params, callback) {
        NightGameUser.findByIdAndUpdate(id, params, {new:true}, function(err, nightGameUser){
            if (err) {
                callback(err, null)
                return
            }
            callback(null, nightGameUser)
        })
    },

    delete: function(id, callback) {
        NightGameUser.findByIdAndRemove(id, function(err) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, null)
        })
    },
}