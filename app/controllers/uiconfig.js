/**
 * PURPOSE: save the ui configration here.
 * Created by shree on 03/02/17.
 **/

let mongoose = require('mongoose')
let _ = require('underscore')
let isEmpty = require('is-empty')
let authwalls = mongoose.model("authwalls")
let uiconfig = mongoose.model("uiconfig")
var debug = require('debug')('dev') // dev is env variable

/**
 * Save new ui configration
 */
exports.getUiConfig = function (req, res, next) {

    debug("################# inside brand UI config ###################");
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

    let custUiVersion = parseInt(req.params.uiVersion);
    let emactv = req.headers['emac'];
    let mboardtv = req.headers['mboard'];
    let keymd5 = ('' + req.headers['keymd5']).trim().toUpperCase();
    let brandTv = ('' + req.headers['brand']).trim().toUpperCase();

    if (!isEmpty(emactv)) {
        debug("emac is " + emactv);
        //For device present check & get brand details of device
        authwalls.findOne({
            'emac': emactv
        }, ' -created_at -updated_at -__v',
            function (err, _authwalls) {
                if (err) {
                    res.status(500);
                    res.json({
                        data: "Error occured:" + err
                    })
                } else {
                    debug(">>>>>>> authwall output" + JSON.stringify(_authwalls));
                    if ((!isEmpty(_authwalls)) && (!isEmpty(_authwalls.state)) && (_authwalls.state != 0) && (!isEmpty(_authwalls.brand))) {
                        debug(">>>>> authwall brand " + _authwalls.brand);
                        brandname = ('' + _authwalls.brand).trim().toUpperCase();
                        //Get details of Brand from UiConfig database
                        debug("Keymd5 parsed >>" + keymd5 + "<<");
                        if (isEmpty(keymd5) || keymd5 == "UNDEFINED") {
                            finalQ = {
                                'brand': brandname,
                                'board': { '$regex': mboardtv, '$options': 'i' },
                                'defaultKey': true
                            }
                            debug("giving CVTE signed");
                        } else {
                            finalQ = {
                                'brand': brandname,
                                'board': { '$regex': mboardtv, '$options': 'i' },
                                'keymd5': keymd5
                            }
                            debug("giving CWT signed: " + JSON.stringify(finalQ));
                        }
                        uiconfig.findOne(finalQ, ' -board -_id -created_at -updated_at -__v -defaultKey -keymd5',
                            function (err, _uiconfig) {
                                if (err) {
                                    res.status(500);
                                    res.json({
                                        data: "Error occured:" + err
                                    })
                                } else {
                                    debug('ADDED' + _uiconfig);
                                    authwallslastAcessTimestampADD(emactv);
                                    if (_uiconfig) {
                                        dbversion = _uiconfig.uiVersion;
                                        // debug("uiconfig.uiVersion = " + _uiconfig.uiVersion);
                                        // debug("Brand give by Authwall brandname = " + brandname);
                                        // debug("brand given by TV brandTv = " + brandTv);
                                        // debug("giving this response: " + JSON.stringify(_uiconfig));
                                        // if ((isEmpty(brandTv) || brandTv != "UNDEFINED") && brandTv != brandname) {
                                        //     let updateTimestamp = authwallslastUpdateTimestampA
                                        //     DD(emactv);
                                        //     if (updateTimestamp) {
                                        //         let newUiConfig = _uiconfig;
                                        //         logTV = "?fromuiver=" + custUiVersion + "&touiver=" + _uiconfig.uiVersion + "&emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&cota=" + req.headers['cotaversion'] + "&board=" + req.headers['mboard'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'] + "&src=branduiconfig&type=zip";
                                        //         // debug("logtv = " + logTV);
                                        //         newUiConfig.downloadUrl = newUiConfig.downloadUrl + logTV;
                                        //         newUiConfig.uiVersion = 100;
                                        //         res.setHeader('Content-Type', 'application/json');
                                        //         res.status(200);
                                        //         // debug("giving this final response: " + newUiConfig);
                                        //         return res.send(newUiConfig);
                                        //     }
                                        // } else 
                                        {
                                            if (custUiVersion == dbversion) {
                                                res.setHeader('Content-Type', 'application/json');
                                                res.status(204);
                                                res.end();
                                            } else {
                                                let updateTimestamp = authwallslastUpdateTimestampADD(emactv);
                                                if (updateTimestamp) {
                                                    let newUiConfig = _uiconfig;
                                                    logTV = "?fromuiver=" + custUiVersion + "&touiver=" + _uiconfig.uiVersion + "&emac=" + req.headers['emac'] + "&fota=" + req.headers['fotaversion'] + "&cota=" + req.headers['cotaversion'] + "&board=" + req.headers['mboard'] + "&brand=" + req.headers['brand'] + "&fromlv=" + req.headers['lversion'] + "&src=branduiconfig&type=zip";
                                                    // debug("logtv = " + logTV);
                                                    newUiConfig.downloadUrl = newUiConfig.downloadUrl + logTV;
                                                    res.setHeader('Content-Type', 'application/json');
                                                    res.status(200);
                                                    // debug("giving this final response: " + newUiConfig);
                                                    return res.send(newUiConfig);
                                                }
                                            }
                                        }
                                    } else {
                                        res.status(403);
                                        res.json({
                                            "reason": "UI config is Not Defined!!"
                                        })
                                    }
                                }
                            })
                    } else {
                        debug('Error state is inactive');
                        res.status(202);
                        //res.json({
                        //    "reason": "This TV is not activated! (NBIAW)" // no brand in auth wall
                        //});
			            res.end();
                        next(false) // DEAD END of THIS API here!!
                    }
                }
            })
    } else {
        res.status(403);
        res.json({
            "reason": "Forbidden!!"
        })
    }
    next(false) // DEAD END of THIS API here!!
}




function authwallslastAcessTimestampADD(emactv) {
    let now = new Date();
    lastacesstime = now;
    //Update entry Of device which Acess with Timestamp and Brand Details also
    authwalls.updateOne({
        'emac': emactv,
    }, {
        $set: {
            'lastAcessTimestamp': lastacesstime
        }
    },
        function (err, _authwalls) {
            if (err) {
                res.status(500);
                res.json({
                    data: "Error occured:" + err
                })
            } else {
                if (_authwalls) {
                    // debug(_authwalls);

                }
            }
        })
    const results = true
    return results;
}


function authwallslastUpdateTimestampADD(emactv) {
    let now = new Date();
    lastacesstime = now;
    //Update entry Of device which Acess with Timestamp and Brand Details also
    authwalls.updateOne({
        'emac': emactv,
    }, {
        $set: {
            'lastUpdateTimestamp': lastacesstime
        }
    },
        function (err, _authwalls) {
            if (err) {
                res.status(500);
                res.json({
                    data: "Error occured:" + err
                })
            } else {
                if (_authwalls) {
                    // debug(_authwalls);

                }
            }
        })
    const results = true
    return results;
}


/**
 * create uiconfig etry based on Save new UI configration With check repeated or not...
 */
exports.createUiconfig = function (req, res, next) {
    let brandname = req.body.brand;
    let boardname = req.body.board;
    if ((!isEmpty(req.body)) && (!isEmpty(brandname)) && (!isEmpty(boardname))) {
        let uiconfigModel = new uiconfig();
        uiconfigModel.useOta = req.body.useOta;
        uiconfigModel.downloadUrl = req.body.downloadUrl;
        uiconfigModel.md5 = req.body.md5;
        uiconfigModel.keymd5 = req.body.keymd5;
        uiconfigModel.uiVersion = req.body.uiVersion;
        uiconfigModel.brandColor = req.body.brandColor;
        uiconfigModel.searchOrbColor = req.body.searchOrbColor;
        uiconfigModel.badgeDrawable = req.body.badgeDrawable;
        uiconfigModel.aboutUsBackground = req.body.aboutUsBackground;
        uiconfigModel.termsNConditionHtml = req.body.termsNConditionHtml;
        uiconfigModel.appStorePackage = req.body.appStorePackage;
        uiconfigModel.liveTvImage = req.body.liveTvImage;
        uiconfigModel.helpDrawable = req.body.helpDrawable;
        uiconfigModel.defaultAppsSequence = req.body.defaultAppsSequence;
        uiconfigModel.brand = req.body.brand;
        uiconfigModel.board = req.body.board;

        uiconfig.findOne({
            "brand": brandname,
            "board": { $in: boardname }
        }, '-created_at -updated_at -__v',
            function (err, _uibrandpresent) {
                if (err) {
                    res.status(500);
                    res.json({
                        data: "Error occured:" + err
                    })
                } else {
                    if (_uibrandpresent) {
                        uiconfig.findOneAndUpdate({
                            "brand": brandname,
                            "board": { $in: boardname }
                        }, req.body,
                            function (err, _newupdatefavoriteusers) {
                                if (err) {
                                    res.status(500);
                                    res.json({
                                        status: "Error"
                                    })
                                } else {
                                    //debug(_newupdatefavoriteusers);
                                    res.json({
                                        status: "Updated"
                                    })
                                }
                            })
                        //res.json({ data: "Already Presented" });
                    } else if (!_uibrandpresent) {
                        uiconfigModel.save(function (err, _uiconfigs) {
                            if (err) {
                                res.status(500);
                                res.json({
                                    data: "Error occured:" + err
                                })
                            }
                        })
                        res.status(200);
                        res.json({
                            status: "Success"
                        })
                    }
                }
            })
    } else {
        res.status(500);
        res.json({
            status: "Brand name not found!"
        })
    }
    next();
};
