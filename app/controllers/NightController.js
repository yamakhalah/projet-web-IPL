var Night = require('../models/night.js')

module.exports = {
    find: function(params, callback) {
        Night.find(params, function(err, nights) {
            if (err) {
                callback(err, null)
                return 
            }
            callback(null, nights)
        })
    },

    findByDate: function(params, callback) {
        Night.find(params).sort({date: -1}).exec(function(err, nights) {
            if (err) {
                callback(err, null)
                return 
            }
            callback(null, nights)
        })
    },

    findById: function(id, callback) {
        Night.findById(id, function(err, night) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, night)
        })
    },

    create: function(params, callback) {

        Night.create(params, function(err, night) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, night)
        })
    },

    update: function(id, params, callback) {
        Night.findByIdAndUpdate(id, params, {new:true}, function(err, night){
            if (err) {
                callback(err, null)
                return
            }
            callback(null, night)
        })
    },

    delete: function(id, callback) {
        Night.findByIdAndRemove(id, function(err) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, null)
        })
    },
}