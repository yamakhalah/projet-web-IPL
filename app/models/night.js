var mongoose = require('mongoose');

var nightSchema = mongoose.Schema({
    hostId : String,
    date : Date,
    startTime : Date,
    endTime : Date,
    description : String,
    status : String
});

module.exports = mongoose.model('Night', nightSchema);
