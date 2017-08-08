var mongoose = require('mongoose');

var gameSchema = mongoose.Schema({
    name : String,
    description : String,
    minPlayers : Number,
    maxPlayers : Number,
    image : String,
});

module.exports = mongoose.model('Game', gameSchema);
