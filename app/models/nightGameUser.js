var mongoose = require('mongoose');

var nightGameUserSchema = mongoose.Schema({
    nightGameId : String,
    userId : String,
});

module.exports = mongoose.model('NightGameUser', nightGameUserSchema);
