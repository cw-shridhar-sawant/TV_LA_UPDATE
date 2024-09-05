/**
 * PURPOSE-This File for Categories application schema defination for mongo db.
 * Created by vaibhavingale on 03/02/17.
**/

/* Configure Moongoose schema here */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/* Schema defination of categories */
var appsSchema = new Schema({
    "appName": {
        "type": "string"
    },
    "appType": {
        "type": "string"
    },
    "bannerId": {
        "type": "string"
    },
    "filterList": {
        "type": "array",
        "items": {}
    },
    "sortList": {
        "type": "array",
        "items": {}
    },
    created_at: { type: Date },
    updated_at: { type: Date }
});

/* Schema defination added timestamp of every record of table Categories */
appsSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

/* exporting Model schema defination here */
mongoose.model('apps', appsSchema);
