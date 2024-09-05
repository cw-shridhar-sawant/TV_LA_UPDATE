
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ip2city_logs = new Schema({
    emac: { type: String, unique: true },
    ip: String,
    city: String
}, { timestamps: true });

mongoose.model('ip2city_logs', ip2city_logs);
