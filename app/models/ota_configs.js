/**
 * PURPOSE-This File for Categories application schema defination for mongo db.
 * Created by shree on 03/02/17.
 **/

/* Configure Moongoose schema here */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/* Schema defination of categories */
var ota_configsSchema = new Schema({
    "otaName": {
        "type": "string"
    },
    "packageName": {
        "type": "string"
    },
    "downloadUrl": {
        "type": "string"
    },
    "md5": {
        "type": "string"
    },
    "versionCode": {
        "type": "string"
    },
    "action": {
        "type": "string"
    },
    "buildDate": {
        "type": "string"
    },
    "size": {
        "type": "string"
    },
    "updateChangeLog": {
        "type": "string"
    },
    "keymd5": {
        "type": "string"
    },
    "isForced":{
        "type":"boolean"
    },
    "onSuccessClear":{
        "type":"boolean"
    },
    "onSuccessReboot":{
        "type":"boolean"
    },
    "headerfilterkeyRegex": {
        "type": "string"//lversion for the regex default
    },
    "headerfiltervalueRegex": {
        "type": "string"
    },
    "headerfilterkey1": {
        "type": "string"
    },
    "headerfiltervalue1": {
        "type": "string"
    },
    "headerfilterkey2": {
        "type": "string"
    },
    "headerfiltervalue2": {
        "type": "string"
    },
    "headerfilterkey3": {
        "type": "string"
    },
    "headerfiltervalue3": {
        "type": "string"
    },
    "comment": {
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
ota_configsSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

/* exporting Model schema defination here */
mongoose.model('ota_configs', ota_configsSchema);