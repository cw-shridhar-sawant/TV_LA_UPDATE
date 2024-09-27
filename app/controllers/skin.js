/**
 * PURPOSE-This File for otaupdate application controller defination interact with schema.
 * Created by shridhar on 03/02/17.
 **/

var res_ota = [];   // Response OTA array
var mongoose = require('mongoose')
var _ = require('underscore')
var isEmpty = require('is-empty');
var ota_devices = mongoose.model("ota_devices")
var ota_launchers = mongoose.model("ota_launchers")
var skintv_launchers = mongoose.model("lms_skintvlaunchers")
var authwalls = mongoose.model("authwalls")
var debug = require('debug')('dev') // dev is env variable

/**
 * Auth wall definations
 */
const authDefinations = {
    ACTIVED: 1,     // access to all services
    DEACTIVATED: 2, // intentionally blocked
    BLOCKED: 0,     // default blocked if entry not found in system
    TRIAL: 3        // temporory or limited or expiration time based
}


function maxValue(arr) {
    let max = arr[0];

    for (let val of arr) {
        if (val > max) {
            max = val;
        }
    }
    return max;
}

/*
 * skin Launcher Update
 * 
 */
exports.getSkinTV = function (req, res, next) {
    var header_brand = req.headers['brand'];
    var header_vendor = req.headers['vendor'];
    var header_factory = req.headers['factory'];
    let header_skinversion = req.headers['skinversion'];
    console.log('============Get skin====================\n' + JSON.stringify(req.headers) + "\n========================================")

    if (header_brand == "cloudtv" && header_vendor == "cloudtv" && header_factory == "cloudtv") {
        console.log("brand, vendor, factory is cloudtv -> give skin to this device!!")
        let emactv = req.headers['emac'];
        let wmactv = req.headers['wmac'];
        authwalls.findOne({
            "emac": emactv,
            "wmac": wmactv
        }, ' -created_at -updated_at -__v',
            function (err, _devicepresent) {
                if (err) {
                    console.log('fatal eror on (authwalls.findOne)' + err);
                    res.status(500);
                    res.json({
                        data: "Error occured:" + err
                    })
                } else {
                    if ((!isEmpty(_devicepresent)) && (!isEmpty(_devicepresent.state)) && _devicepresent.state == authDefinations.ACTIVED) {
                        /*
                            debug("device present?: " + _devicepresent + "\n" +
                            "vendor " + _devicepresent.vendor + "\n" +
                            "brand " + _devicepresent.brand + "\n" +
                            "factory " + _devicepresent.factory + "\n" +
                            "keymd5 " + _devicepresent.keymd5.toUpperCase().replace(/[^a-zA-Z0-9]/g, "") + "\n" +
                            "mboard " + _devicepresent.mboard);
                        */
                        skintv_launchers.findOne({
                            'brand': _devicepresent.brand,
                            'vendor': _devicepresent.vendor,
                            'factory': _devicepresent.factory,
                            'keymd5': _devicepresent.keymd5.toUpperCase().replace(/[^a-zA-Z0-9]/g, ""),
                            'board': _devicepresent.mboard
                        }, '-_id -created_at -updated_at -__v',
                            function (err, _skintvDevices) {
                                if (err) {
                                    console.log('fatal eror on (skintv_launchers.findOne)' + err);
                                    res.status(500);
                                    res.json({ data: "Error occured:" + err })
                                    next(false);
                                } else {
                                    console.log('ALL DETAILS-->');
                                    console.log('brand->'+ _devicepresent.brand +'vendor'+ _devicepresent.vendor+'factory'+_devicepresent.factory+'keymd5'+ _devicepresent.keymd5.toUpperCase().replace(/[^a-zA-Z0-9]/g, "")+'board'+ _devicepresent.mboard);
                                    debug('*****************');
                                    console.log('Got this skin value from db :' + JSON.stringify(_skintvDevices));
                                    if (!isEmpty(_skintvDevices)) {
                                        console.log("Skin present for this device: " + JSON.stringify(_skintvDevices));

                                        /*
                                        let finalOtaData = JSON.parse(JSON.stringzipify(_skintvDevices.skin));
                                        finalOtaData.forEach(otaData => {
                                            logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&cota=" + req.headers['cotaversion'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'];
                                            if (otaData.downloadUrl.indexOf(".apk") > -1) {
                                                logTV = logTV + "&src=tvlaupdate&type=apk";
                                            } else if (otaData.downloadUrl.indexOf(".zip") > -1) {
                                                logTV = logTV + "&src=tvlaupdate&type=zip";
                                            } else {
                                                debug("wrong type of file!");
                                            }
                                            otaData.downloadUrl = otaData.downloadUrl + logTV
                                        });
                                        debug("response skin ota block : " + JSON.stringify(finalOtaData[0]));
                                        */
                                        let skinversionData = JSON.parse(JSON.stringify(_skintvDevices.skin));
                                        let skinarray = [];
                                        //console.log(skinversionData.length);                                        
                                        if (skinversionData.length > 1) {
                                            for (var key in skinversionData) {
                                                skinarray.push(skinversionData[key]['versionCode']);
                                            }
                                        }
                                        else {
                                            skinarray.push(skinversionData[0]['versionCode']);
                                        }

                                        let greater_skin = maxValue(skinarray)
                                        let otaindex = skinarray.indexOf(greater_skin);
                                        let otaData = JSON.parse(JSON.stringify(_skintvDevices.skin[otaindex]));
                                        //console.log('DISPLAY',otaData);
                                        logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&cota=" + req.headers['cotaversion'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'];
                                        if (otaData.downloadUrl.indexOf(".apk") > -1) {
                                            logTV = logTV + "&src=tvlaupdate&type=apk";
                                        } else if (otaData.downloadUrl.indexOf(".zip") > -1) {
                                            logTV = logTV + "&src=tvlaupdate&type=zip";
                                        } else {
                                            console.log("wrong type of file!");
                                        }
                                        otaData.downloadUrl = otaData.downloadUrl + logTV
                                        let finalOtaData = [];
                                        finalOtaData.push(otaData)
                                        console.log("response skin ota block : " + JSON.stringify(finalOtaData));
                                        res.status(200);
                                        res.json(finalOtaData);
                                        res.end();
                                        req.ota = finalOtaData;
                                        next(true);
                                    } else {
                                        console.log("No skin defined for this device.");
                                        res.status(500);
                                        res.json({ data: "Please check your internet connection (NOSKI)" });
                                        res.end()
                                        return;
                                    }
                                }
                            })
                    } else {
                        console.log('Error state: tv not found/ tv activation not found/ tv is not activated');
                        res.status(401); // Unauthorized tv, as its not activated on authwall
                        res.json({ data: "Please check your internet connection (NOSKI)" });
                        res.end()
                        next(false);
                    }
                }
            });
    } else if ((!isEmpty(header_skinversion))) {
        console.log('###############SKIN UPDATION##################');
        console.log("brand, vendor, factory is UPDATE skin to this device!!");
        let emactv = req.headers['emac'];
        let wmactv = req.headers['wmac'];
        authwalls.findOne({
            "emac": emactv,
            "wmac": wmactv
        }, ' -created_at -updated_at -__v',
            function (err, _devicepresent) {
                if (err) {
                    debug('fatal eror on (authwalls.findOne)' + err);
                    res.status(500);
                    res.json({
                        data: "Error occured:" + err
                    })
                } else {
                    if ((!isEmpty(_devicepresent)) && (!isEmpty(_devicepresent.state)) && _devicepresent.state == authDefinations.ACTIVED) {
                        skintv_launchers.findOne({
                            'brand': _devicepresent.brand,
                            'vendor': _devicepresent.vendor,
                            'factory': _devicepresent.factory,
                            'keymd5': _devicepresent.keymd5.toUpperCase().replace(/[^a-zA-Z0-9]/g, ""),
                            'board': _devicepresent.mboard
                        }, '-_id -created_at -updated_at -__v',
                            function (err, _skintvDevices) {
                                if (err) {
                                    debug('fatal eror on (skintv_launchers.findOne)' + err);
                                    res.status(500);
                                    res.json({ data: "Error occured:" + err })
                                    next(false);
                                } else {
                                    //debug('Got this skin value from db :' + JSON.stringify(_skintvDevices));
                                    skinLength = header_skinversion.length
                                    skinArray = header_skinversion.split('-')
                                    //debug(skinArray)
                                    if (skinLength > 20 && skinArray.length >= 4) {
                                        skinversionNumber = Number(skinArray[0].replace(/[^0-9]/g, "") + skinArray[2].padStart(3, "0"))
                                    }
                                    console.log("=====DATA: ========len:" + skinLength + "==ver:" + skinversionNumber)

                                    if (!isEmpty(_skintvDevices)) {
                                        //debug("Skin present for this device: " + JSON.stringify(_skintvDevices));

                                        let skinversionData = JSON.parse(JSON.stringify(_skintvDevices.skin));
                                        let skinarray = [];
                                        //debug(skinversionData.length);                                        
                                        if (skinversionData.length > 1) {
                                            for (var key in skinversionData) {
                                                //debug(key);
                                                //debug(skinversionData[key]['versionCode']);
                                                skinarray.push(Number(skinversionData[key]['versionCode']));
                                            }
                                        }
                                        else {
                                            skinarray.push(Number(skinversionData[0]['versionCode']));
                                        }

                                        let greater_skin = maxValue(skinarray)
                                        //debug("greater_skin-------->",greater_skin);
                                        console.log("SKIN********************",typeof(skinversionNumber))
                                        console.log("GREATER********************",typeof(greater_skin))
                                        if (!isEmpty(greater_skin) && (greater_skin !== skinversionNumber)) 
                                        {
                                           
                                            console.log("INSIDE UPDATION********************")
                                            let otaindex = skinarray.indexOf(greater_skin);
                                            //cdebug("otaindex-------->",otaindex);

                                            let otaData = JSON.parse(JSON.stringify(_skintvDevices.skin[otaindex]));
                                            //debug('DISPLAY',otaData);
                                            logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&cota=" + req.headers['cotaversion'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'];
                                            if (otaData.downloadUrl.indexOf(".apk") > -1) {
                                                logTV = logTV + "&src=tvlaupdate&type=apk";
                                            } else if (otaData.downloadUrl.indexOf(".zip") > -1) {
                                                logTV = logTV + "&src=tvlaupdate&type=zip";
                                            } else {
                                                console.log("wrong type of file!");
                                            }
                                            otaData.downloadUrl = otaData.downloadUrl + logTV
                                            let finalOtaData = [];
                                            finalOtaData.push(otaData)
                                            console.log("response skin ota block : " + JSON.stringify(finalOtaData));
                                            res.status(200);
                                            res.json(finalOtaData);
                                            res.end();
                                            req.ota = finalOtaData;
                                            next(true);

                                        } else {
                                            console.log("Already Updated SKIN present");
                                            res.status(204);                                            
                                            res.end();
                                            next(false);
                                        }

                                    } else {
                                        console.log("No skin defined for this device.");
                                        res.status(500);
                                        res.json({ data: "Please check your internet connection (NOSKI)" });
                                        res.end()
                                        return;
                                    }

                                }
                            })
                    } else {
                        console.log('Error state: tv not found/ tv activation not found/ tv is not activated');
                        res.status(401); // Unauthorized tv, as its not activated on authwall
                        res.json({ data: "Please check your internet connection (NOSKI)" });
                        res.end()
                        next(false);
                    }
                }
            });
    }
    else {
        console.log("brand, vendor, factory is NOT cloudtv -> serve regular tv-la-update logic!!")
        lvLength = req.headers["lversion"].length
        lvArray = req.headers["lversion"].split('-')
        debug(lvArray)
        if (lvLength > 20 && lvArray.length >= 4) {
            lvNumber = Number(lvArray[0].replace(/[^0-9]/g, "") + lvArray[1].padStart(3, "0"))
            lvType = lvArray[3].toUpperCase()
        }
        console.log("=====DATA: ========len:" + lvLength + "==ver:" + lvNumber + "==type:" + lvType)
        // ############# Check OTA for individual emac 
        var emactv = req.headers['emac'];
        if (!isEmpty(emactv)) {
            ota_devices.findOne({ 'emac': emactv }, '-_id -created_at -updated_at -__v')
                .populate('ota_data', '-_id -created_at -updated_at -__v')
                .exec(function (err, _otadevices) {
                    if (err) {
                        debug('fatal eror on (ota_devices.findOne)' + err);
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
                            finalOtaData = JSON.parse(JSON.stringify(_otadevices.ota_data));
                            finalOtaData.forEach(otaData => {
                                logTV = "?emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&cota=" + req.headers['cotaversion'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'];
                                if (otaData.downloadUrl.indexOf(".apk") > -1) {
                                    logTV = logTV + "&src=tvlaupdate&type=apk";
                                } else if (otaData.downloadUrl.indexOf(".zip") > -1) {
                                    logTV = logTV + "&src=tvlaupdate&type=zip";
                                } else {
                                    debug("wrong type of file!");
                                }
                                otaData.downloadUrl = otaData.downloadUrl + logTV
                            });
                            console.log("response ota block : " + JSON.stringify(finalOtaData));
                            res.status(200);
                            res.json(finalOtaData);
                            res.end();
                            req.ota = finalOtaData;
                            next(true);
                        }
                        else {
                            // ############# Check LAUNCHER UPDATE for individual emac 
                            ota_launchers.findOne({ 'ltype': lvType, boards: req.headers['mboard'] }, '-_id -created_at -updated_at -__v')
                                .populate('ota', '-_id -created_at -updated_at -__v')
                                .exec(function (err, data) {
                                    if (err) {
                                        debug('fatal eror on (ota_launchers.findOne)' + err);
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
                                            console.log('sending response as : res_ota: ' + res_ota)
                                            res.end();
                                            req.ota = res_ota;
                                            next(true);
                                        } else {
                                            res.status(204);
                                            res.end();
                                            next(false);
                                        }
                                    }
                                })
                        }
                    }
                });
        }
    }
}

