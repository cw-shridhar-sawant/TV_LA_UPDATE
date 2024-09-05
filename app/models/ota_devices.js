/**
 * PURPOSE-This File for Categories application schema defination for mongo db.
 * Created by vaibhavingale on 03/02/17.
**/

/* Configure Moongoose schema here */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/* Schema defination of categories */
var ota_devicesSchema = new Schema({
    //emac: { type: String, index: true, unique: true },
    mboard: { type: String, index: true },
    ota_data: [{ type: Schema.Types.ObjectId, ref: 'ota_configs' }],
    lastAccessIp: String
}, { timestamps: true });

/* exporting Model schema defination here */
mongoose.model('ota_devices', ota_devicesSchema);
