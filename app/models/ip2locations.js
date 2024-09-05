/**
 * PURPOSE-This File for authwall application schema defination for mongo db.
 * Created by shridhar on 05/07/19.
**/

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ip2locations = new Schema({
    "ip_from": Number,
    "ip_to": Number,
    "country_code": String,
    "country_name": String,
    "region_name": String,
    "city_name": String
});

/* exporting Model schema defination here */
mongoose.model('ip2locations', ip2locations);
