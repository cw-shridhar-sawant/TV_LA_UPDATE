var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var lms_skintvlaunchersSchema = new Schema({
    brand: { type: String, uppercase: true },
    vendor: { type: String, uppercase: true },
    factory: { type: String, uppercase: true },
    keymd5: { type: String, uppercase: true },
    board: Array,
    skin: Array
}, { timestamps: true });

mongoose.model('lms_skintvlaunchers', lms_skintvlaunchersSchema);
