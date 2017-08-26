var mongoose = require('mongoose');

var nightSchema = mongoose.Schema({
    hostId : String,
    name : String,
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
        participants : [{
            userId : String
        }],
        isValidated : Boolean
    }]
});

module.exports = mongoose.model('Night', nightSchema);
