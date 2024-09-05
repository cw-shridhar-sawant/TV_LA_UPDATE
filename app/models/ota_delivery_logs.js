var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ota_delivery_logs = new Schema({
    emac: { type: String },
    ota: Array,
    ip: String,
}, { timestamps: true });

mongoose.model('ota_delivery_logs', ota_delivery_logs);
