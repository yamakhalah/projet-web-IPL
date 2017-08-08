var NightUser = require('../models/nightUser')

module.exports = {
    find: function(params, callback) {
        NightUser.find(params, function(err, nightUsers) {
            if (err) {
                callback(err, null)
                return 
            }
            callback(null, nightUsers)
        })
    },

    findById: function(id, callback) {
        NightUser.findById(id, function(err, nightUser) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, nightUser)
        })
    },

    create: function(params, callback) {

        NightUser.create(params, function(err, nightUser) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, nightUser)
        })
    },

    update: function(id, params, callback) {
        NightUser.findByIdAndUpdate(id, params, {new:true}, function(err, nightUser){
            if (err) {
                callback(err, null)
                return
            }
            callback(null, nightUser)
        })
    },

    delete: function(id, callback) {
        NightUser.findByIdAndRemove(id, function(err) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, null)
        })
    },
}