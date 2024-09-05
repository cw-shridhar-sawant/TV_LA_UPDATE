var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ota_launchers = new Schema({
    name: { type: String, uppercase: true },
    boards: [{ type: String, uppercase: true }],
    ltype: { type: String, unique: true, uppercase: true, index: true },
    ota: { type: Schema.Types.ObjectId, ref: 'ota_configs' },
}, { timestamps: true });

mongoose.model('ota_launchers', ota_launchers);