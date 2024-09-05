/**
 * PURPOSE-This File for Categories application schema defination for mongo db.
 * Created by vaibhavingale on 03/02/17.
**/

/* Configure Moongoose schema here */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/* Schema defination of categories */
var tvConfigSchema = new Schema({
    "emac": {
        "type": "string",
        uppercase: true
    },
    "boardSerial": {
        "type": "string"
    },
    "wmac": {
        "type": "string",
        uppercase: true
    },
    "buildProp": {
        "type": "array",
        "items": {
            "type": "string"
        }
    },
    created_at: { type: Date },
    updated_at: { type: Date }
});

/* Schema defination added timestamp of every record of table Categories */
tvConfigSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

/* exporting Model schema defination here */
mongoose.model('tvconfig', tvConfigSchema);
