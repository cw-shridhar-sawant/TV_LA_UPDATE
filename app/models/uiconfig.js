/**
 * PURPOSE-This File for Categories application schema defination for mongo db.
 * Created by shree on 03/02/17.
 **/

/* Configure Moongoose schema here */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/* Schema defination of categories */
var uiConfigSchema = new Schema({
    "useOta": {
        "type": "boolean"
    },
    "downloadUrl": {
        "type": "string"
    },
    "md5": {
        "type": "string"
    },
    "keymd5": {
        "type": "string"
    },
    "uiVersion": {
        "type": "string"
    },
    "brandColor": {
        "type": "string"
    },
    "searchOrbColor": {
        "type": "string"
    },
    "badgeDrawable": {
        "type": "string"
    },
    "aboutUsBackground": {
        "type": "string"
    },
    "termsNConditionHtml": {
        "type": "string"
    },
    "appStorePackage": {
        "type": "string"
    },
    "liveTvImage": {
        "type": "string"
    },
    "helpDrawable": {
        "type": "string"
    },
    "defaultAppsSequence": {
        "items": {
            "type": "string"
        },
        "type": "array"
    },
    "brand": {
        "type": "string"
    },
    "board": {
        "items": {
            "type": "string"
        },
        "type": "array"
    },
    "keyAllApps": {
        "type": "string"
    },
    "keyInfo": {
        "type": "string"
    },
    "keyCde": {
        "type": "string"
    },
    "keySource": {
        "type": "string"
    },
    "keyProfile": {
        "type": "string"
    },
    "keyRefresh": {
        "type": "string"
    },
    "keyCleaner": {
        "type": "string"
    },
    "keyNetflix": {
        "type": "string"
    },
    "keyYoutube": {
        "type": "string"
    },
    "keyDesktop": {
        "type": "string"
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});

/* Schema defination added timestamp of every record of table Categories */
uiConfigSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

/* exporting Model schema defination here */
mongoose.model('uiconfig', uiConfigSchema);