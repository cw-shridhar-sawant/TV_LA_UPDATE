/**
 * PURPOSE-This File for authwall application schema defination for mongo db.
 * Created by shridhar on 05/07/19.
**/

/* Configure Moongoose schema here */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/* Schema defination of authwall */
var allcloudtvSchema = new Schema({
    "emac": {
        "type": "string",
        uppercase: true
    },
    "wmac": {
        "type": "string",
        uppercase: true
    },
    "accept_version": {
        "type": "string"
    },
    "mboard": {
        "type": "string"
    },
    "keymd5": {
        "type": "string",
        uppercase: true
    },
    "keysha256": {
        "type": "string",
        uppercase: true
    },
    "model": {
        "type": "string"
    },
    "panel": {
        "type": "string"
    },
    "lversion": {
        "type": "string"
    },
    "package": {
        "type": "string"
    },
    "cotaversion": {
        "type": "string"
    },
    "fotaversion": {
        "type": "string"
    },
    "po": {
        "type": "string"
    },
    "serialno": {
        "type": "string"
    },
    "brand": {
        "type": "string"
    },
    "factory": {
        "type": "string"
    },
    "vendor": {
        "type": "string"
    },
    "state": {
        "type": "string",
        "enum": ['0', '1'],
    },
    "skinversion": {
        "type": "string"
    },
    "description": {
        "type": "string"
    },
    "lastAcessTimestamp": {
        "type": "string"
    },
    "lastUpdateTimestamp": {
        "type": "string"
    },
    "lastacessIP": {
        "type": "string"
    },
    "lastSeen": {
        type: Date
    },
    "activatedAt": {
        type: Date
    },
    "features": {
        "items": {
            "type": "string"
        },
        "type": "array"
    },
    created_at: { type: Date },
    updated_at: { type: Date }
});

/* Schema defination added timestamp of every record of table Categories */
allcloudtvSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

/* exporting Model schema defination here */
mongoose.model('allcloudtvs', allcloudtvSchema);
