/**
 * PURPOSE-This File for middleware application controller defination interact with schema.
 * Created by shri on 26/06/18.
 **/

/**
 * Auth wall definations
 */
const authDefinations = {
    ACTIVED: 1,     // access to all services
    DEACTIVATED: 2, // intentionally blocked
    BLOCKED: 0,     // default blocked if entry not found in system
    TRIAL: 3        // temporory or limited or expiration time based
}

/**
 * Configure Moongoose schema here and export schema
 */
var mongoose = require('mongoose')
var _ = require('underscore')
var isEmpty = require('is-empty')
var authwalls = mongoose.model("authwalls")
var allcloudtvs = mongoose.model("allcloudtvs")
var ip2locations = mongoose.model("ip2locations")
var requestIp = require('request-ip');
var debug = require('debug')('dev') // dev is env variable


// list of cloudwalker brand name and cloudwalker model names
const cloudwalker_models_brands = [
    "CLOUDWALKER",
    "CWT55SU-X2",
    "CWT32SF-X2",
    "CWT32SF-X3",
    "CWT32SHX214",
    "CWTSSUA7",
    "CWT32SH04X",
    "CWS43SUA7",
    "CWS65SUA7",
    "CWS55SUA7",
    "CWT43SH04X",
    "CWT32SHX2",
    "CWT65SUX216",
    "VEIRA_CLOUDWALKER",
    "CWT43SUX216",
    "CWT55SUX216",
    "CWT65SUX216",
];


/**
 * Add the new values to the auth wall.
 */
// TODO: To add values to authwall we need to provide the authentication mechanisam and password
exports.addToAuthWall = function (req, res, next) {
    if (req.headers['passphrase'] === "q1w2e3r4t5y6u7i8o9p0") {
        //req.body get whole array in one object to traverse trough for loop

        req.body.forEach(device => {
            //create individual object and there models to save
            var authwallModel = new authwalls();
            authwallModel.emac = device.emac.replace(/(..?)/g, '$1:').slice(0, -1);
            authwallModel.po = device.po;
            authwallModel.keymd5 = device.keymd5;
            authwallModel.state = authDefinations.ACTIVED
            authwallModel.modelno = device.model;
            authwallModel.serialno = device.serial;
            authwallModel.lastacessIP = requestIp.getClientIp(req);

            authwalls.findOne({ "emac": authwallModel.emac }, function (err, _results) {
                if (err) {
                    res.status(500);
                    res.json({ data: "Error occured:" + err })
                }
                if (!_results) {
                    authwallModel.save(function (err, _authwalls) {
                        if (err) {
                            res.status(500);
                            res.json({ data: "Error occured:" + err })
                        }
                    })
                }
            })

        });
        res.status(200);
        res.json({ "status": "Device List Successfully Added!!" })
    } else {
        res.status(403);
        res.json({ "reason": "Forbidden!!" })
    }
    next(); // DEAD END of THIS API here!!
}


/**
 * check of device is present in the auth wall or not?
 */
exports.checkAgainstAuthWall = function (req, res, next) {
    var emactv = req.headers['emac'];
    var wmactv = "" + req.headers['wmac'];
    var keymd5 = ("" + req.headers['keymd5']).toUpperCase().replace(/[^a-zA-Z0-9]/g, "");
    var keysha256 = ("" + req.headers['keysha256']).toUpperCase().replace(/[^a-zA-Z0-9]/g, "");
    var ipaddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace(/^.*:/, '')
    var lastSeen = new Date().toISOString();
    var authwall = {};


    authwalls.findOne({ 'emac': emactv }, ' -created_at -updated_at -__v',
        function (err, _devicepresent) {
            if (err) {
                res.status(500);
                res.json({ data: "Error occured:" + err })
                next(false)
            } else {
                debug("============= TYPE OF DEVICE " + typeof (_devicepresent) + "===========\n");
                /*  apply only for cats otherwise other routes with other apps will set their own values 
                    like analytics app will set its own lversion via features call */
                if (req.route.path.toUpperCase().indexOf("/CATS") !== -1) {
                    debug("============= CATS MATCHED A " + JSON.stringify(_devicepresent) + "===========\n");
                    if (_devicepresent != null && !isEmpty(_devicepresent.emac) &&
                        _devicepresent.state == authDefinations.ACTIVED) { // entry already present
                        debug("Device IS present, UPDATE values!");
                        authwall.wmac = wmactv; // skip if default values comes in header
                        authwall.keymd5 = keymd5;
                        authwall.keysha256 = keysha256;
                        authwall.panel = req.headers['panel'];
                        authwall.lversion = req.headers['lversion'];
                        authwall.package = "" + req.headers['package'];
                        authwall.cotaversion = req.headers['cotaversion']
                        authwall.fotaversion = req.headers['fotaversion'];
                        authwall.skinversion = req.headers['skinversion'];
                        authwall.accept_version = req.headers['accept-version'];
                        authwall.lastacessIP = ipaddress;
                        authwall.lastSeen = lastSeen;
                    } else {
                        debug("Device NOT present, ADD values!");
                        authwall.emac = emactv;
                        authwall.wmac = wmactv;
                        authwall.state = authDefinations.BLOCKED;
                        authwall.mboard = req.headers['mboard'];
                        authwall.keymd5 = keymd5;
                        authwall.keysha256 = keysha256;
                        authwall.model = req.headers['model'];
                        authwall.panel = req.headers['panel'];
                        authwall.lversion = req.headers['lversion'];
                        authwall.package = "" + req.headers['package'];
                        authwall.cotaversion = req.headers['cotaversion']
                        authwall.fotaversion = req.headers['fotaversion'];
                        authwall.skinversion = req.headers['skinversion'];
                        authwall.description = "From TV";
                        authwall.accept_version = req.headers['accept-version'];
                        authwall.lastacessIP = ipaddress;
                        authwall.lastSeen = lastSeen;
                    }
                } else {
                    // not a cats api
                    authwall.lastacessIP = ipaddress;
                    authwall.lastSeen = lastSeen;
                }
                authwalls.findOneAndUpdate({ 'emac': emactv }, { $set: authwall }, {
                    new: true,
                    upsert: false // Make this update into an upsert
                }, function (err, _authtvupdate) {
                    if (err) {
                        res.status(500);
                        res.json({ data: "Error occured:" + err })
                        res.end()
                    } else {
                        debug("==> model: " + cloudwalker_models_brands.includes(req.headers["model"]) +
                            " ,brand: " + cloudwalker_models_brands.includes(req.headers["brand"]));

                        if (req.headers['accept-version'] == "1.0.0" || req.headers['accept-version'] == "2.0.0" &&
                            cloudwalker_models_brands.includes(req.headers["model"]) || cloudwalker_models_brands.includes(req.headers["brand"])) {
                            req.isAuth = true
                            next();
                        }
                        else if ((!isEmpty(_authtvupdate)) && (!isEmpty(_authtvupdate.state)) && _authtvupdate.state == authDefinations.ACTIVED) {
                            req.isAuth = true
                            next();     // API here Already present EMAC replace his details
                        }
                        else {
                            debug('=====B :  Device added in system with deactivated state!!');
                            authwalls.findOneAndUpdate({ 'emac': emactv }, { $set: authwall }, {
                                upsert: true // insert new TV entry here
                            }, function (err, _authtvinsert) {
                                if (err) {
                                    res.status(500);
                                    res.json({ data: "Error occured:" + err })
                                    res.end()
                                } else {
                                    debug("ADDED NEW TV ENTRY WITH DEACTIVATED STATE *********");
                                    req.isAuth = false
                                    next(); 
                                }
                            }) 
                            /* 
                            This can show the popup with error as reason. For now its disabled for videotex and others. 
                            res.status(401);
                            res.json({ "reason": "[B] Activate Licence!" });
                            */
                            //req.isAuth = false
                            //next(); // give data to user even if its not activated because its cloudwalker tv.
                            // res.end();
                        }
                    }
                })
            }
        })
}


/**
 *  Rate limiter added by Sumit 
 *  This will block the same requests being hit by the same mac at the same time.
 */

const NodeCache = require("node-cache");
const expiry = 5;
const cache = new NodeCache({ stdTTL: expiry, checkperiod: 5 });

exports.rateLimiter = function (request, response, next) {
    var mac_route = undefined;
    mac_route = request.headers['emac'] + request.getUrl().pathname;
    if (mac_route == undefined) {
        response.status(401);
        response.end();
    } else {
        if (!cache.has(mac_route)) {
            cache.set(mac_route, true, expiry);
            next();
        } else {
            response.status(204);
            response.end();
        }
    }
};

exports.deliveryTarget = (request, response, next) => {
    var tvip = (request.headers['x-forwarded-for'] || request.connection.remoteAddress).replace(/^.*:/, '');
    getCityByIp(tvip, city => {
        if (city == null || city == '-') {
            console.log(tvip + " ip is not associated to any city");
            next();
        } else {
            var ip2city_logs = mongoose.model("ip2city_logs")
            ip2city_logs.updateMany({
                emac: request.headers['emac'],
            }, { emac: request.headers['emac'], ip: tvip, city: city },
                { upsert: true }, (err, res) => {
                    if (err) {
                        response.status(500);
                        response.json({ data: "Error occured:" + err })
                        response.end()
                    }

                    var query = [{
                        '$match': {
                            'city': city,
                            'mboards': request.headers['mboard'],
                            '$and': [
                                { '$expr': { '$lt': ['$count', '$maxCount'] } },
                                { '$expr': { '$gt': [Date.now(), '$dateFrom'] } },
                                { '$expr': { '$lt': [Date.now(), '$dateTo'] } }
                            ]
                        }
                    }];

                    var ota_delivery_configs = mongoose.model("ota_delivery_configs")
                    ota_delivery_configs.aggregate(query, (err, deliverables) => {
                        if (err) {
                            response.status(500);
                            response.json({ data: "Error occured:" + err })
                            response.end()
                        } else {
                            if (deliverables.length == 0) {
                                next();
                            } else {
                                var ota_devices = mongoose.model("ota_devices")
                                ota_devices.findOne({
                                    emac: request.headers['emac'],
                                    ota_data: { $eq: deliverables[0].ota }
                                }, (err, data) => {
                                    if (data) {
                                        console.log('Exists => next()')
                                        next()
                                    } else {
                                        ota_devices.updateMany({
                                            emac: request.headers['emac'],
                                        }, { emac: request.headers['emac'], $push: { ota_data: deliverables[0].ota }, lastAccessIp: tvip }, { upsert: true },
                                            (error, result) => {
                                                if (error) {
                                                    response.status(500);
                                                    response.json({ data: "Error occured:" + err })
                                                    response.end()
                                                    return;
                                                }
                                                authwalls.updateOne({
                                                    emac: request.headers['emac'],
                                                    features: { $nin: "ZAPR" }
                                                }, { $push: { features: "ZAPR" } },
                                                    (error, result) => {
                                                        if (error) {
                                                            response.status(500);
                                                            response.json({ data: "Error occured:" + err })
                                                            response.end()
                                                            return;
                                                        }
                                                        deliverables[0].count = deliverables[0].count + 1
                                                        ota_delivery_configs.updateOne({ _id: deliverables[0]._id }, deliverables[0], (err, result) => {
                                                            if (err) {
                                                                response.status(500);
                                                                response.json({ data: "Error occured:" + err })
                                                                response.end()
                                                                return;
                                                            }
                                                            next()
                                                        })
                                                    })
                                            })
                                    }
                                })
                            }
                        }
                    })
                })
        }
    })
}


exports.deliveryByconfig = (request, response, next) => {
    var tvip = (request.headers['x-forwarded-for'] || request.connection.remoteAddress).replace(/^.*:/, '');
    var tvmboard =("" + req.headers['mboard']).toUpperCase().replace(/[^a-zA-Z0-9]/g, "");
        var query = [{
            '$match': {
                'mboards': tvmboard,
                '$and': [
                    { '$expr': { '$gt': [Date.now(), '$dateFrom'] } },
                    { '$expr': { '$lt': [Date.now(), '$dateTo'] } }
                ]
            }
        }];

        var ota_delivery_configs = mongoose.model("ota_delivery_configs")
        ota_delivery_configs.aggregate(query, (err, deliverables) => {
            if (err) {
                response.status(500);
                response.json({ data: "Error occured:" + err })
                response.end()
            } else {
                if (deliverables.length == 0) {
                    next();
               } else {
                    var ota_devices = mongoose.model("ota_devices")
                    ota_devices.findOne({
                        emac: request.headers['emac'],
                        ota_data: { $eq: deliverables[0].ota }
                    }, (err, data) => {
                        if (data) {
                            console.log('Exists => next()')
                            next()
                        } else {
                            ota_devices.updateMany({
                                emac: request.headers['emac'],
                            }, { emac: request.headers['emac'], $push: { ota_data: deliverables[0].ota }, lastAccessIp: tvip }, { upsert: true },
                                (error, result) => {
                                    if (error) {
                                        response.status(500);
                                        response.json({ data: "Error occured:" + err })
                                        response.end()
                                        return;
                                    }
                                    else{
                                        next()
                                    }

                                })
                        }
                    })
                }
            }
        })
}


function getCityByIp(ip, callback) {
    var lip = ip2long(ip)
    ip2locations.findOne({ "ip_to": { $gte: lip } }, (err, data) => {
        if (err) {
            response.status(500);
            response.json({ data: "Error occured:" + err })
            response.end()
            return;
        }
        if (data == undefined) {
            callback(null)
        } else {
            callback(('' + data.city_name).toLowerCase())
        }
    })
}

var multipliers = [0x1000000, 0x10000, 0x100, 1];

function ip2long(ip) {
    var longValue = 0;
    ip.split('.').forEach(function (part, i) { longValue += part * multipliers[i]; });
    return longValue;
}

var ota_delivery_logs = mongoose.model("ota_delivery_logs")
exports.ota_delivery_logger = (request, response, next) => {
    var ota = JSON.parse(JSON.stringify(request.ota))
    var emac = request.headers['emac']
    var tvip = (request.headers['x-forwarded-for'] || request.connection.remoteAddress).replace(/^.*:/, '');
    // console.log('ota: ' + JSON.stringify(ota, undefined, 2))
    ota_delivery_logs.insertMany({
        emac: emac,
        ota: ota,
        ip: tvip
    }, (err, logResult) => {
        if (err) {
            console.log("Error occured:" + err);
            next(false)
        } else {
            // console.log(logResult)
            next(true)
        }
    })
};

//For lastSeen field Updation in Authwalls collection to check TV start analytics
exports.authwall_lastseen_logger = (req, res, next) => {
    let emactv = req.headers['emac'];
    let wmactv = req.headers['wmac'];
    let ipaddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace(/^.*:/, '');

    let query = {};
    if ((!isEmpty(emactv))) {
        if ((!isEmpty(wmactv))) {
            if (wmactv.length === 12) {
                wmactv = wmactv.match(/.{1,2}/g).join(':')
            }
            query = { 'emac': emactv, 'wmac': wmactv }
        } else {
            query = { 'emac': emactv }
        }
    }

    debug("query within last senn Logger", query);
    if (req.headers['emac']) {
        authwalls.findOne(query, ' -created_at -updated_at -__v',
            function (err, _devicepresent) {
                if (err) {
                    res.status(500);
                    res.json({ data: "Error occured:" + err })
                    res.end();
                    //next(false)
                } else {
                    authwalls.updateOne(query, { $set: { 'lastSeen': new Date().toISOString(), "lastacessIP": ipaddress } }, { upsert: true },
                        function (err, _authtv) {
                            if (err) {
                                //res.status(500);
                                //res.json({ data: "Error occured:" + err })
                                // next(false)     // DEAD END of THIS API here!!
                                console.log("Lastseen timestamp updation error!!")
                                next(true)
                            } else {
                                next(true)
                            }
                        });
                }
            });
    }
};

/**
 * Add the new values to the auth walls Middleware.
 */

exports.addToAllCloudtvs = function (req, res, next) {

    var emactv = req.headers['emac'];
    var wmactv = req.headers['wmac'];
    var keymd5 = ("" + req.headers['keymd5']).toUpperCase().replace(/[^a-zA-Z0-9]/g, "");
    var keysha256 = ("" + req.headers['keysha256']).toUpperCase().replace(/[^a-zA-Z0-9]/g, "");
    var ipaddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace(/^.*:/, '')
    var lastSeen = new Date().toISOString();

    var query = {};
    /** wmac from tv will be coming as, 
     * null (tv will not send the wmac field)
     * 02:00:00:00:00:00 (tv was not able to get the wmac may be due inablitlty to turn on wifi module)
     * N0:N0:N0:N0:N0:N0 (tv was not able to get wmac from shared pref)
     * colonless mac
     * mac with colon */
    if ((!isEmpty(emactv))) {
        if ((!isEmpty(wmactv))) {
            if (wmactv.length === 12) {
                wmactv = wmactv.match(/.{1,2}/g).join(':')
            }
            query = { 'emac': emactv, 'wmac': wmactv }
        } else {
            query = { 'emac': emactv }
        }

    }
    allcloudtvs.findOne(query, function (err, _results) {
        if (err) {
            res.status(500);
            res.json({ data: "Error occured:" + err })
        }
        allcloudtvs.updateOne(query,
            {
                emac: emactv,
                wmac: wmactv,
                state: authDefinations.BLOCKED,
                mboard: req.headers['mboard'],
                keymd5: keymd5,
                keysha256: keysha256,
                model: req.headers['model'],
                panel: req.headers['panel'],
                brand: req.headers['brand'],
                lversion: req.headers['lversion'],
                package: "" + req.headers['package'],
                cotaversion: req.headers['cotaversion'],
                fotaversion: req.headers['fotaversion'],
                skinversion: req.headers['skinversion'],
                description: "Added BY API",
                accept_version: req.headers['accept-version'],
                lastacessIP: ipaddress,
                lastSeen: lastSeen
            }, { upsert: true },
            function (err, _authtv) {
                if (err) {
                    //res.status(500);
                    //res.json({ data: "Error occured:" + err })
                    // next(false)     // DEAD END of THIS API here!!
                    console.log("Middleware auth updation error!!")
                    next(true)
                } else {
                    console.log("Middleware auth updation!!")
                    next(true)
                }
            });
    });
    next(true)
}
