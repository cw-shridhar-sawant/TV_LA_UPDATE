/**
 * PURPOSE: save the tv configration here.
 * Created by vaibhavingale on 03/02/17.
 **/

var mongoose = require('mongoose')
var _ = require('underscore')
var isEmpty = require('is-empty')
var tvconfig = mongoose.model("tvconfig")
var panels = mongoose.model("tvpanel")

/**
 * Save new tv configration
 */
exports.addToTvConfig = function (req, res, next) {
	res.status(200);
	res.json({ "status": true })
	res.end();
//    if (!isEmpty(req.body)) {
//
//        var emactv = req.headers['emac'];
//        var wmactv = req.headers['wmac'];
//
//        var query = {};
//        /** wmac from tv will be coming as, 
//         * null (tv will not send the wmac field)
//         * 02:00:00:00:00:00 (tv was not able to get the wmac may be due inablitlty to turn on wifi module)
//         * N0:N0:N0:N0:N0:N0 (tv was not able to get wmac from shared pref)
//         * colonless mac
//         * mac with colon */
//        if ((!isEmpty(emactv))) {
//            if ((!isEmpty(wmactv))) {
//                if (wmactv.length === 12) {
//                    wmactv = wmactv.match(/.{1,2}/g).join(':')
//                }
//                query = { 'emac': emactv, 'wmac': wmactv }
//            } else {
//                query = { 'emac': emactv }
//            }
//
//        }
//
//        debug("QUERY of the tv-config emac issue-->" + query);
//        var tvconfigModel = new tvconfig();
//        tvconfigModel.emac = emactv;
//        tvconfigModel.wmac = wmactv;
//        tvconfigModel.boardSerial = req.body.boardSerial;
//        tvconfigModel.buildProp = req.body.buildProp
//        tvconfig.findOne({ query },
//            function (err, _results) {
//                if (err) {
//                    res.status(500);
//                    res.json({ data: "Error occured:" + err })
//                    res.end();
//                }
//                if (!_results) {
//                    tvconfigModel.save(function (err, _tvconfigs) {
//                        if (err) {
//                            res.status(500);
//                            res.json({ data: "Error occured:" + err })
//                            res.end();
//                        }
//                        else {
//                            res.status(200);
//                            res.json({ "status": true })
//                            res.end();
//                        }
//                    })
//                } else {
//                    tvconfig.updateOne({ query },
//                        { buildProp: req.body.buildProp, wmac: wmactv },
//                        function (err, _tvconfigs) {
//                            if (err) {
//                                res.status(500);
//                                res.json({ data: "Error occured:" + err })
//                                res.end();
//                            } else {
//
//                                res.status(200);
//                                res.json({ "status": true })
//                                res.end();
//                            }
//                        });
//                }
//            })
//    } else {
//        res.status(403);
//        res.json({ "reason": "Forbidden!!" })
//        res.end();
//    }
}

//It's function to get screen size here..
exports.getScreenSize = function (req, res, next) {
    var panelname = req.headers['panel'];
    if (!isEmpty(panelname)) {
        panels.findOne({ 'panelList': panelname }, '-_id -created_at -updated_at -__v -panelList',
            function (err, _panels) {
                if (err) {
                    res.status(500);
                    res.json({ data: "Error occured:" + err })
                } else {
                    if (_panels) {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200);
                        return res.send(_panels);
                    } else {
                        res.json({ data: " GET Tvusers: " + req.params.panelno + " not found" })
                    }
                }
            })
    } else {
        res.status(500);
        res.json({ data: "Error in Detecting the Size " })
    }
    next();
};
