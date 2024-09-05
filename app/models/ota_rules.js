var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ota_rulesSchema = new Schema({
    rules: [Object],
    ota_data: [{ type: Schema.Types.ObjectId, ref: 'ota_configs' }],
    configuration: [Object],
    description: { type: String, default: '' },
    isEnabled: { type: Boolean, default: false },
}, { timestamps: true });

mongoose.model('ota_rules', ota_rulesSchema);