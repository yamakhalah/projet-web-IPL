var mongoose = require('mongoose');

var nightGameSchema = mongoose.Schema({
    nightId : String,
    gameId : String,
    participantsNb : Number,
    isValidated : Boolean
});

module.exports = mongoose.model('NightGame', nightGameSchema);
