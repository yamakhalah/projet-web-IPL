var mongoose = require('mongoose');

var nightUserSchema = mongoose.Schema({
    hostId : String,
    userId : String
});

module.exports = mongoose.model('NightUser', nightUserSchema);
