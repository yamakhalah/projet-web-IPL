var mongoose = require('mongoose');

var nightUserSchema = mongoose.Schema({
    nightId : String,
    userId : String
});

module.exports = mongoose.model('NightUser', nightUserSchema);
