/**
 * PURPOSE-This File for otaupdate application controller defination interact with schema.
 * Created by vaibhavingale on 03/02/17.
 **/

var res_ota = [];   // Response OTA array
var mongoose = require('mongoose')
var _ = require('underscore')
var isEmpty = require('is-empty')
var ota_devices = mongoose.model("ota_devices")
var ota_rules = mongoose.model("ota_rules")
var ota_launchers = mongoose.model("ota_launchers")
var ota_configs = mongoose.model("ota_configs")
var authwalls = mongoose.model("authwalls")
var debug = require('debug')('dev') // dev is env variable


var remove_old_hotstar = {
    "packageName": "in.startv.hotstar",
    "action": "uninstall",
    "versionCode": 761,
    "buildDate": "20200409102030",
    "md5": "50407f4f6bd76c45e2063bc00f6b69da",
    "size": "17596447",
    "downloadUrl": "http://asset.s4.cloudwalker.tv/apk/cw_hotstar_3.3.0.apk"
};

var ss_updater_update = {
    "packageName": "tv.cloudwalker.updater",
    "action": "install",
    "versionCode": 110018,
    "buildDate": "20191206_135846",
    "md5": "c515e65390441ac8985e962efec2781d",
    "size": "3162694",
    "downloadUrl": "http://asset.s4.cloudwalker.tv/cw-apps/cwupdater_release_110018_553.apk"
}

var ss_doitall_cota = {
    "action": "cota",
    "buildDate": "20191206_160921",
    "md5": "a8fab3957dff2b5aef1a05b27f6c21a3",
    "size": "73202180",
    "isForced": false,
    "updateChangeLog": "http://asset.s4.cloudwalker.tv/cota/smartscreen/doitall/doitall_update_info.jpg",
    "downloadUrl": "http://asset.s4.cloudwalker.tv/cota/smartscreen/doitall/cwt_smartscreen_553_ota_v2.zip"
}

/*
 * 5510 Launcher Update
 * */
exports.getCloudTVUpdate = function (req, res, next) {

    debug("**** ACCEPT VERSION***" + req.headers['accept-version']);
    switch (req.headers['accept-version']) {
        case "1.4.1":
            // show update tile to convert smartscreen launcher from normal launcher - update apk
            switch (req.headers['model']) {
                case "CWT43SUX216":      // for 43" smart screen factory version (20190830_144033)
                case "CWT55SUX216":      // for 55" smart screen factory version (20190830_015020)
                case "CWT65SUX216":      // for 65" smart screen factory version (20190830_014928 | 20190613_145938 | 20190429_101751)
                    if (req.headers["lversion"] == "1.4.0-46-g6c123c6") {
                        finalOtaData = JSON.parse(JSON.stringify(ss_updater_update));
                        logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&brand=smartscreen" + "&fromlv=" + req.headers['lversion'] + "&src=tvlaupdate&type=apk"
                        finalOtaData.downloadUrl = finalOtaData.downloadUrl + logTV
                        res_ota.length = 0;
                        res_ota.push(finalOtaData);
                        res.status(200);
                        res.json(res_ota);
                        res.end();
                        req.ota = res_ota;
                        next(true);
                    }
                    break;
            }
            if (req.headers["lversion"] == undefined) {
                res.status(204);
                res.end();
                break;
            }

            lvLength = req.headers["lversion"].length
            lvArray = req.headers["lversion"].split('-')
            console.log(lvArray)
            if (lvLength > 20 && lvArray.length >= 4) {
                lvNumber = Number(lvArray[0].replace(/[^0-9]/g, "") + lvArray[1].padStart(3, "0"))
                lvType = lvArray[3].toUpperCase()
            }
            console.log("=====DATA: ========len:" + lvLength + "==ver:" + lvNumber + "==type:" + lvType)
            // ############# Check for individual emac 
            //var emactv = req.headers['emac']; //for emac query
            var mboardtv = req.headers['mboard'];
            if (!isEmpty(mboardtv)) {
                ota_devices.findOne({ 'mboard': mboardtv }, '-_id -created_at -updated_at -__v')
                    .populate('ota_data', '-_id -created_at -updated_at -__v')
                    .exec(function (err, _otadevices) {
                        if (err) {
                            res.status(500);
                            res.json({ data: "Error occured:" + err })
                            next(false)
                        } else {
                            var isUpdateable = false
                            // find cota entry and check if update is required.
                            if (_otadevices && _otadevices.ota_data && _otadevices.ota_data.length > 0) {
                                isUpdateable = true
                                _otadevices.ota_data.map(data => {
                                    if (data.action == "cota") {
                                        isUpdateable = !(parseInt(req.headers['cotaversion'].replace('_', '')) >= parseInt(data.buildDate.replace('_', '')))
                                    }
                                })
                            }
                            //TODO: Update spacing to 4 before commiting
                            if (isUpdateable) { // for special individual ota update
                                debug("lvtype else part of ota launcher 1", lvType);
                                finalOtaData = JSON.parse(JSON.stringify(_otadevices.ota_data));
                                finalOtaData.forEach(otaData => {
                                    logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&cota=" + req.headers['cotaversion'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'];
                                    if (otaData.downloadUrl.indexOf(".apk") > -1) {
                                        logTV = logTV + "&src=tvlaupdate&type=apk";
                                    } else if (otaData.downloadUrl.indexOf(".zip") > -1) {
                                        logTV = logTV + "&src=tvlaupdate&type=zip";
                                    } else {
                                        console.log("wrong type of file!");
                                    }
                                    otaData.downloadUrl = otaData.downloadUrl + logTV
                                });
                                //console.log("logtv = " + logTV)
                                res.status(200);
                                res.json(finalOtaData);
                                res.end();
                                req.ota = finalOtaData;
                                next(true);
                            }
                            else {
                                /// This is only to update launchers
                                debug("lvtype else part of ota launcher 2", lvType);
                                ota_launchers.findOne({ 'ltype': lvType, boards: req.headers['mboard'] }, '-_id -created_at -updated_at -__v')
                                    .populate('ota', '-_id -created_at -updated_at -__v')
                                    .exec(function (err, data) {
                                        if (err) {
                                            res.status(500);
                                            res.json({ data: "Error occured:" + err })
                                            next(false)
                                        } else {
                                            if (data && data.ota && lvNumber < data.ota.versionCode) {
                                                logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'] + "&src=tvlaupdate&type=apk"
                                                data.ota.downloadUrl = data.ota.downloadUrl + logTV
                                                res_ota.length = 0;
                                                res_ota.push(data.ota);
                                                res.status(200);
                                                res.json(res_ota);
                                                // console.log('res_ota: ' + res_ota)
                                                res.end();
                                                req.ota = res_ota;
                                                next(true);
                                            } else {
                                                // rest of the updates other than launcher updates
                                                // res_ota.length = 0;
                                                // res_ota.push(remove_old_hotstar)
                                                res.status(204);
                                                // res.json(res_ota);
                                                // console.log("================== \n" + JSON.stringify(res_ota) + "\n======================");
                                                res.end();
                                                // req.ota = res_ota;
                                                next(false);
                                            }
                                        }
                                    })
                            }
                        }
                    });
            }

            break; // for case 1.4.1
        case "0.0.7":
        case "0.0.8":
        case "1.0.0":
        case "1.4.0":
            res.status(204);
            res.end();
            next(false);
            break;
        default:
            res.status(204);
            res.end();
            next(false);		    
    }// end of accept-version switch case 
}
// VIL, COM, 83472

/**
 * create uiconfig etry based on Save new UI configration With check repeated or not...
 */
exports.globalOTA = function (req, res, next) {
    var dummyUptoDate = {
        "action": "fota",
        "buildDate": req.body['fota'],
        "md5": "11112222333344445555666677778888",
        "size": "12345",
        "isForced": false,
        "updateChangeLog": "update.jpg",
        "downloadUrl": "noota.zip"
    }
    {
        if (req.body['model'] == "CWT43SUX216" || req.body['model'] == "CWT55SUX216" || req.body['model'] == "CWT65SUX216") {
            finalOtaData = JSON.parse(JSON.stringify(ss_doitall_cota));
            logTV = "?emac=" + req.body['emac'] + "&fota=" + req.body['fota'] + "&brand=" + req.body['brand'] + "&fromlv=" + req.body['lversionName'] + "&src=global_updater_app&type=zip"
            finalOtaData.downloadUrl = finalOtaData.downloadUrl + logTV
            res_ota.length = 0;
            res_ota.push(finalOtaData);
            res.status(200);
            res.json(res_ota);
            res.end();
            req.ota = res_ota;
            next(true);
        } else {
            res_ota.length = 0;
            res_ota.push(dummyUptoDate);
            res.status(200);
            res.json(res_ota);
            res.end();
            next(false);
        }
    }
    return res;
};

function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}

/*
 * 5510 Launcher Update
 * */
exports.getCloudTVMarketUpdate = function (req, res, next) {

    debug("################# inside OTA RULES config ###################");
    debug("HEADER: brand    ==== " + req.headers['brand']);
    debug("HEADER: emac      ==== " + req.headers['emac']);
    debug("HEADER: mboard    ==== " + req.headers['mboard']);
    debug("HEADER: panel     ==== " + req.headers['panel']);
    debug("HEADER: model     ==== " + req.headers['model']);
    debug("HEADER: lversion  ==== " + req.headers['lversion']);
    debug("HEADER: cota      ==== " + req.headers['cotaversion']);
    debug("HEADER: fota      ==== " + req.headers['fotaversion']);
    debug("HEADER: keymd5      ==== " + req.headers['keymd5']);
    debug("HEADER: version   ==== " + req.headers['accept-version']);
    debug("HEADER: UI ver    ==== " + req.params.uiVersion);

    debug("############# INSIDE FUNC VERSION MARKET ###################################");
    

    debug("**** ACCEPT VERSION***" + req.headers['accept-version']);
    switch (req.headers['accept-version']) {
        case "1.4.1":
            // show update tile to convert smartscreen launcher from normal launcher - update apk
            switch (req.headers['model']) {
                case "CWT43SUX216":      // for 43" smart screen factory version (20190830_144033)
                case "CWT55SUX216":      // for 55" smart screen factory version (20190830_015020)
                case "CWT65SUX216":      // for 65" smart screen factory version (20190830_014928 | 20190613_145938 | 20190429_101751)
                    if (req.headers["lversion"] == "1.4.0-46-g6c123c6") {
                        finalOtaData = JSON.parse(JSON.stringify(ss_updater_update));
                        logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&brand=smartscreen" + "&fromlv=" + req.headers['lversion'] + "&src=tvlaupdate&type=apk"
                        finalOtaData.downloadUrl = finalOtaData.downloadUrl + logTV
                        res_ota.length = 0;
                        res_ota.push(finalOtaData);
                        res.status(200);
                        res.json(res_ota);
                        res.end();
                        req.ota = res_ota;
                        next(true);
                    }
                    break;
            }
            if (req.headers["lversion"] == undefined) {
                res.status(204);
                res.end();
                break;
            }

            lvLength = req.headers["lversion"].length
            lvArray = req.headers["lversion"].split('-')
            console.log(lvArray)
            if (lvLength > 20 && lvArray.length >= 4) {
                lvNumber = Number(lvArray[0].replace(/[^0-9]/g, "") + lvArray[1].padStart(3, "0"))
                lvType = lvArray[3].toUpperCase()
            }
            console.log("=====DATA: ========len:" + lvLength + "==ver:" + lvNumber + "==type:" + lvType)
            // ############# Check for individual emac 
            //var emactv = req.headers['emac']; //for emac query
            var mboardtv = req.headers['mboard'];
            if (!isEmpty(mboardtv)) {
                
                    var TV_DETAILS = [];
                    authwalls.find({ "emac": req.headers['emac'], 'state': '1' }, '-created_at -updated_at -__v',
                        function (err, _authwalluser) {
                            if (err) {
                                console.log('ERROR: ' + JSON.stringify(error));
                                response.status(204).end();
                                return
                            } else {
                                let OTACONFIGS_LIST = [];
                                let result_feature = _authwalluser.map(a => a.features);
                                debug(" INSIDE PRESENT =======>", typeof (_authwalluser))
                                debug("PRESENT HERE Features=======>--------", result_feature[0])
            
                                ota_rules.find({"isEnabled":true}, (error, rules) => {
                                    if (error) {
                                        console.log('ERROR: ' + JSON.stringify(error));
                                        response.status(204).end();
                                        return
                                    }
                                    var APPLICABLE_RULES = [];
                                    if (rules.length > 0) {
                                        rules.map(element => {
                                            if (element.isEnabled) {
                                                var TEMP_COUNT = 0;
                                                element.rules.map(condition => {
                                                    debug(`CHECKING - HEADERS[${condition.field}]:${req.headers[condition.field]} ${condition.operator} ${condition.values}`)
                                                    var isPresent = (condition.values.indexOf(req.headers[condition.field]) > -1);
                                                    if (condition.operator === 'NIN')
                                                        isPresent = !isPresent;
                                                    if (isPresent)
                                                        TEMP_COUNT++;
                                                    //debug('isPresent: ' + isPresent)
                                                })
                                                debug('element.rules: ' + element.rules.length)
                                                if (TEMP_COUNT == element.rules.length) {
                                                    APPLICABLE_RULES.push(element);
                                                }
                                            }
                                        })
                                        debug('APPLICABLE_RULES: ' + JSON.stringify(APPLICABLE_RULES, undefined, 2))
                                    }                                   

                                    /*
                                    get OTA_CONFIG madhun result ghya
                                    */
                                    debug("LENGTH",APPLICABLE_RULES.length)

                                    
                                    for(var i=0; i< APPLICABLE_RULES.length; i++){
                                        OTACONFIGS_LIST.push(APPLICABLE_RULES[i].ota_data)
                                        debug('APPLICABLE_RULES OTA RULES--->: ' + JSON.stringify(APPLICABLE_RULES[i].ota_data))
                                    }
                                    const flattened = [].concat(...OTACONFIGS_LIST);
                                    debug(flattened);
                                    var finalarray = removeDuplicates(flattened);
                                    debug("###############################################")
                                    debug('OTA CONFIGS: ' + JSON.stringify(finalarray));
                                    debug("###############################################")
                                    ota_configs.find({ 
                                        "_id" : {
                                            "$in" : 
                                            finalarray
                                        }
                                     }, '-created_at -updated_at -__v -_id',
                                        function (err, _otadevices) {
                                                                if (err) {
                                                                    res.status(500);
                                                                    res.json({ data: "Error occured:" + err })
                                                                    next(false)
                                                                } else {
                                                                    debug("###############################################")
                                                                    debug('OTA FINL check CONFIGS: ' + JSON.stringify(_otadevices));
                                                                    debug("###############################################") 
                                                                    // rest of the updates other than launcher updates
                                                                    var isUpdateable = false
                                                                    // find cota entry and check if update is required.
                                                                    if (_otadevices && _otadevices.length > 0) {
                                                                        isUpdateable = true
                                                                        _otadevices.map(data => {
                                                                            if (data.action == "cota") {
                                                                                isUpdateable = !(parseInt(req.headers['cotaversion'].replace('_', '')) >= parseInt(data.buildDate.replace('_', '')))
                                                                            }
                                                                        })
                                                                    }
                                                                    //TODO: Update spacing to 4 before commiting
                                                                    if (isUpdateable) { // for special individual ota update
                                                                        debug("lvtype else part of ota launcher 1", lvType);
                                                                        finalOtaData = JSON.parse(JSON.stringify(_otadevices));
                                                                        finalOtaData.forEach(otaData => {
                                                                            logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&cota=" + req.headers['cotaversion'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'];
                                                                            if (otaData.downloadUrl.indexOf(".apk") > -1) {
                                                                                logTV = logTV + "&src=tvlaupdate&type=apk";
                                                                            } else if (otaData.downloadUrl.indexOf(".zip") > -1) {
                                                                                logTV = logTV + "&src=tvlaupdate&type=zip";
                                                                            } else {
                                                                                console.log("wrong type of file!");
                                                                            }
                                                                            otaData.downloadUrl = otaData.downloadUrl + logTV
                                                                        });
                                                                        //console.log("logtv = " + logTV)
                                                                        res.status(200);
                                                                        res.json(finalOtaData);
                                                                        res.end();
                                                                        req.ota = finalOtaData;
                                                                        next(true);
                                                                    }
                                                                    else {
                                                                        /// This is only to update launchers
                                                                        debug("lvtype else part of ota launcher 2", lvType);
                                                                        ota_launchers.findOne({ 'ltype': lvType, boards: req.headers['mboard'] }, '-_id -created_at -updated_at -__v')
                                                                            .populate('ota', '-_id -created_at -updated_at -__v')
                                                                            .exec(function (err, data) {
                                                                                if (err) {
                                                                                    res.status(500);
                                                                                    res.json({ data: "Error occured:" + err })
                                                                                    next(false)
                                                                                } else {
                                                                                    if (data && data.ota && lvNumber < data.ota.versionCode) {
                                                                                        logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'] + "&src=tvlaupdate&type=apk"
                                                                                        data.ota.downloadUrl = data.ota.downloadUrl + logTV
                                                                                        res_ota.length = 0;
                                                                                        res_ota.push(data.ota);
                                                                                        res.status(200);
                                                                                        res.json(res_ota);
                                                                                        // console.log('res_ota: ' + res_ota)
                                                                                        res.end();
                                                                                        req.ota = res_ota;
                                                                                        next(true);
                                                                                    } else {
                                                                                        // rest of the updates other than launcher updates
                                                                                        // res_ota.length = 0;
                                                                                        // res_ota.push(remove_old_hotstar)
                                                                                        res.status(204);
                                                                                        // res.json(res_ota);
                                                                                        // console.log("================== \n" + JSON.stringify(res_ota) + "\n======================");
                                                                                        res.end();
                                                                                        // req.ota = res_ota;
                                                                                        next(false);
                                                                                    }
                                                                                }
                                                                            })
                                                                    }                                                                          
                                                                }
                                                            }) 
                                })
                            }
                        });   
            }

            break; // for case 1.4.1
        case "0.0.7":
        case "0.0.8":
        case "1.0.0":
        case "1.4.0":
            res.status(204);
            res.end();
            next(false);
            break;
        default:
            res.status(204);
            res.end();
            next(false);		    
    }// end of accept-version switch case 
}
// VIL, COM, 83472
