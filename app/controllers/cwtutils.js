/**
 * Created by sridhar on 2/5/17.
 */
var _ = require('underscore');
var isEmpty = require('is-empty');
var config = require(process.cwd() + '/config/global.js');

exports.getJsonResponse = function checkKey(objarr) {
    var result = [];
    var baseurlassign = config.CW_CONFIG.IMAGE_PREFIX;
    _.map(objarr, function (e) {
        var backdropvalue = ((e || {}).posters || {}).backdrop;
        var landscapevalue = ((e || {}).posters || {}).landscape;
        var portraitvalue = ((e || {}).posters || {}).portrait;
        // backdrop
        if (!isEmpty(backdropvalue)) {
            _backdrop = baseurlassign + e.posters.backdrop[0];
        } else {
            _backdrop = config.CW_CONFIG.DEFAULT_BACKDROP;
        }
        // landscape
        if (!isEmpty(landscapevalue)) {
            landscape = baseurlassign + e.posters.landscape[0].replace("710x400", "444x250");
        } else {
            landscape = config.CW_CONFIG.DEFAULT_IMAGE;
        }
        // portrait
        if (!isEmpty(portraitvalue)) {
            portrait = baseurlassign + e.posters.portrait[0].replace("600x800", "350x457");
        } else {
            portrait = config.CW_CONFIG.DEFAULT_IMAGE;
        }

        result.push({
            "tileType": 'type1',
            "tid": e._id,
            "title": e.details.title,
            "poster": landscape,
            "portrait": portrait,
            "background": _backdrop,
            "rating": e.metadata.rating,
            "runtime": e.metadata.runtime,
            "startTime": e.content.startTime,
            "startIndex": e.content.startIndex,
            "target": e.content.target,
            "type": e.content.type,
            "useAlternate": e.content.useAlternate,
            "alternateUrl": e.content.alternateUrl,
            "playstoreUrl": e.content.playstoreUrl,
            "package": e.content.package,
            "detailPage": e.content.detailPage,
            "source": e.content.source,
            "genre": e.metadata.genre,
            "year": e.metadata.year,
            "director": e.metadata.directors,
            "cast": e.metadata.cast,
            "synopsis": e.metadata.synopsis,
        });
    });
    return result;
}



exports.getEscapedString = function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


exports.getJsonResponseFromYoutube = function checkKey(objarr) {
    var result = [];
    _.map(objarr, function (e) {
        var date = new Date(e.publishedAt);
        releaseyear = date.getFullYear();
        result.push({
            "tileType": "type1",
            "tid": e.id,
            "title": e.title,
            "poster": "https://i.ytimg.com/vi/" + e.id + "/mqdefault.jpg", // "https://i.ytimg.com/vi/"+e.id.videoId+"/mqdefault.jpg";
            "portrait": "https://i.ytimg.com/vi/" + e.id + "/mqdefault.jpg",
            "background": "https://i.ytimg.com/vi/" + e.id + "/mqdefault.jpg",
            "rating": 0,
            "runtime": "",
            "startTime": 0,
            "startIndex": 0,
            "target": [e.id],
            "type": "CWYT_VIDEO",
            "useAlternate": false,
            "alternateUrl": "youtube.apk",
            "playstoreUrl": "https://play.google.com/store/apps/details?id=com.google.android.youtube",
            "package": "com.google.android.youtube",
            "detailPage": false,
            "source": "Youtube",
            "genre": [],
            "year": releaseyear,
            "director": [],
            "cast": [],
            "synopsis": e.description
        });
    });
    return result;
}



exports.getJsonResponseFromthirdpartyTiles = function checkobjKey(objarr) {
    var result = [];
    _.map(objarr, function (e) {


        result.push({
            "tileType": "type1",
            "tid": e.id,
            "title": e.details.title,
            "poster": e.posters.banner[0],
            "portrait": e.posters.portrait[0],
            "background": e.posters.backdrop[0],
            "rating": 0,
            "runtime": "",
            "startTime": 0,
            "startIndex": 0,
            "target": e.content.target,
            "type": "START",
            "useAlternate": false,
            "alternateUrl": e.content.alternateUrl,
            "playstoreUrl": e.content.playstoreUrl,
            "package": e.content.package,
            "detailPage": false,
            "source": e.content.source,
            "genre": e.metadata.genre,
            "year": e.metadata.year,
            "director": e.metadata.director,
            "cast": e.metadata.cast,
            "synopsis": e.metadata.synopsis
        });
    });
    return result;
}