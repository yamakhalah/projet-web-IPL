var mongoose = require('mongoose');

var nightSchema = mongoose.Schema({
    hostId : String,
    date : Date,
    startTime : Date,
    endTime : Date,
    description : String,
    status : String,
    guests : [{
        id : String,
        isValidated : Boolean
    }],
    games : [{
        id : String,
        nbParticipants : Number,
        participants : [{ UserId : String }]
    }]
});

module.exports = mongoose.model('Night', nightSchema);
