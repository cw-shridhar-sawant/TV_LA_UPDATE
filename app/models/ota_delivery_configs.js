var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ota_delivery_configs = new Schema({
    city: [String],
    count: Number,
    maxCount: Number,
    dateFrom: Number,
    dateTo: Number,
    mboards: [String],
    ota: { type: Schema.Types.ObjectId, ref: 'ota_configs' }
}, { timestamps: true });

mongoose.model('ota_delivery_configs', ota_delivery_configs);
