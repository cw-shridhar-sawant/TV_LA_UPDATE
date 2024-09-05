/**
 * PURPOSE-This File for otaupdate application controller defination interact with schema.
 * Created by vaibhavingale on 03/02/17.
 **/

var res_ota = [];   // Response OTA array
var mongoose = require('mongoose')
var _ = require('underscore')
var isEmpty = require('is-empty')
var ota_devices = mongoose.model("ota_devices")
var ota_configs = mongoose.model("ota_configs")
var ota_launchers = mongoose.model("ota_launchers")
var debug = require('debug')('dev') // dev is env variable
const NodeCache = require("node-cache");
const appCache =new NodeCache({stdTTL: 900 })


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
            key_ota_configlist=req.headers['lversion']+'-'+req.headers['mboard'];//1.4.1-CWTXCEVAL(mboard)
            var emactv = req.headers['emac'];
            var mboardtv = req.headers['mboard'];
            var lversiontv = req.headers['lversion'];
            var fotaversiontv = req.headers['fotaversion'];
            let otaconfigarray;
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
                    
                    console.log('Retrieved value from NEW !!');                  
    
                        ota_configs.find({'headerfilterkeyRegex' : { '$exists' : true },'headerfilterkey1' : { '$exists' : true }}, '-_id -created_at -updated_at -__v')
                        .exec(function (err, _otaconfigs) {
                        if (err) {
                            res.status(500);
                            res.json({ data: "Error occured:" + err })
                            next(false)
                        } else 
                        {
                            //lversion,mboard,fotaversion,emac
                            //console.log("Display-->",_otaconfigs)
                            appCache.set(key_ota_configlist, _otaconfigs);
                            otaconfigarray = _otaconfigs;
                            //console.log("TOTAL ARRAYS "+otaconfigarray);      
    
                            //var otaconfigkeylist = _otaconfigs.map(function (el) { return el.headerfilterkey; });
                            //console.log("KAY LIST DISPLAY-->",otaconfigkeylist);
                            //let uniqval = removeDuplicates(otaconfigkeylist);
                            //console.log("UNique LISt->",uniqval);
    
                            //for loop checker length of _otaconfigs array present headerfilterkey  
                            //otaconfigarray check in this emac 
    
                            uniqval=["lversion","mboard","fotaversion","emac"];
    
                            const litems = _otaconfigs.filter(litem =>((lversiontv.toLowerCase().includes(litem.headerfiltervalueRegex)) && litem.headerfilterkeyRegex === uniqval[0]));
                            var litems_count= Object.keys(litems).length;
                            console.log("Regex lversion Length %%%%%%%%%%%>"+litems_count);
                            console.log("Regex lversion--->"+litems);
                            console.log("***********************************");
                            console.log("***********************************");
                            //console.log(_otaconfigs[0].headerfiltervalueRegex);
                            console.log("***********************************");
                            //console.log(lversiontv.toLowerCase().includes(_otaconfigs[0].headerfiltervalueRegex));
                            console.log("***********************************");
                            
                            //console.log("regex check this-------->"+(lversiontv.toLowerCase().includes(_otaconfigs[0].headerfiltervalueRegex) !== -1) )
                            const items_mboards = litems.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1]));
                            var items_mboards_count= Object.keys(items_mboards).length;
                            console.log("Mboard Length %%%%%%%%%%%>"+items_mboards_count);
                            var fotatv_count=0;
                            var emactv_count=0;
    
                            /*
                            for (let i = 0; i < items_mboards_count; i++) 
                            {
                                if(items_mboards[i]["headerfilterkey2"] === null || items_mboards[i]["headerfilterkey2"]  === ''  || items_mboards[i]["headerfilterkey2"] === undefined) {
                                    console.log("the key fota NOT exists on the object");
                                    fotatv_count++;
                                }
                            }    
                            */
    
                            console.log("***********************************");
                            for (let key in items_mboards) {
                                // Console logs all the 
                                // values in the objArr Array:
                                console.log(items_mboards[key]);
                                /*
                                for(var k in items_mboards){
                                    if(items_mboards["headerfilterkey2"] !== "" && items_mboards["headerfilterkey2"] === null)
                                    {
                                        console.log("the key fota exists on the object");
                                        fotatv_count++;
                                    }
                                }
                                */
                                if (uniqval[2] === items_mboards[key]["headerfilterkey2"] && items_mboards[key]["headerfiltervalue2"] === fotaversiontv) {
                                    console.log("the key fota exists******* the object");
                                    fotatv_count++;
                                }
                                if (uniqval[3] === items_mboards[key]["headerfilterkey3"] && items_mboards[key]["headerfiltervalue3"] === emactv) {
                                    console.log("the key EMAC exists&&&&&&&& the object");
                                    emactv_count++;
                                }
                                /*
                                if ("headerfilterkey3" in items_mboards[key]) {
                                    console.log("the key emac exists on the object");
                                    emactv_count++;
                                }
                                */
                                
                            }
                           
                            let combined_array =[];
                            let arr_fota=[];
                            let arr_emac=[];
                            let arr_fota_emac=[];
                           
                            
                            let items_fota_emac,items_fota_emac_count,fotaarr_count,emacarr_count,items1,items2;
    
                            //console.log("fotatv_count OBJECT---> "+fotatv_count+" emactv_count OBJECT---> "+emactv_count);
                            //console.log("***********************************");
                            
                            if(fotatv_count >= 1 && emactv_count >= 1){
                                items_fota_emac = items_mboards.filter(item1 => ((item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2]) && (item1.headerfiltervalue3 === emactv && item1.headerfilterkey3 === uniqval[3])));
                                items_fota_emac_count= Object.keys(items_fota_emac).length;
                                //console.log("fotaversion Length %%%%%%%%%%%>"+ items_fota_emac_count);
                                //console.log("fotaversion DDDDDDD--->"+items_fota_emac);                            
                            }
    
                            if(items_fota_emac_count > 0)
                            {
                                combined_array.push(...items_fota_emac);
                                arr_fota_emac = items_mboards.filter(elm => !items_fota_emac.map(elm => JSON.stringify(elm)).includes(JSON.stringify(elm)));
    
    
                            }
                            //console.log("%%%%%%%%%%%");
                            //console.log("%%%%%%%%%%% **************** EMAC NOT fotaversion--->"+fotatv_count);
                            //console.log("%%%%%%%%%%% **************** FOTA NOT fotaversion--->"+emactv_count);
                           // console.log("%%%%%%%%%%%");
    
                            if(fotatv_count >=1)
                            {
                                //console.log("%%%%%%%%%%%");
                                //console.log("EMAC COUNT0$$$$$$$$$$$$$$$$$$$$$$");
                                //console.log("%%%%%%%%%%%");
                                items1 = items_mboards.filter(item1 => (item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2] && item1.headerfilterkey3 === ""));
                                //console.log("%%%%%%%%%%% **************** EMAC NOT fotaversion--->"+items1);
                                fotaarr_count= Object.keys(items1).length;
                                //console.log("%%%%%%%%%%% ****************fotaversion--->"+fotaarr_count)
                                combined_array.push(...items1);
                                arr_fota = items_mboards.filter(elm => !items1.map(elm => JSON.stringify(elm)).includes(JSON.stringify(elm)));
                            }else if(emactv_count >= 1){
                                items2 = items_mboards.filter(item2 => (item2.headerfiltervalue3 === emactv && item2.headerfilterkey3 === uniqval[3] && item2.headerfiltervalue2 === ''));
                                //console.log("%%%%%%%%%%%&********************* emac items-->"+items2);
                                //console.log("fotatv_count COUNT 0 $$$$$$$$$$$$$$$$$$$$$$");
                                emacarr_count= Object.keys(items2).length;
                                //console.log("%%%%%%%%%%% ****************emacarr_count--->"+emacarr_count)
                                combined_array.push(...items2);
                                arr_emac = items_mboards.filter(elm => !items2.map(elm => JSON.stringify(elm)).includes(JSON.stringify(elm)));
                            }
                                //console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ")
                                const items_mboardslist = items_mboards.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1] && item.headerfiltervalue2 === '' && item.headerfiltervalue3 === ''));
                                combined_array.push(...items_mboardslist);
                          
                            
                                final_ota_data = [...combined_array];
                                //console.log("\n\n###############################")                               
                                //console.log("MIXED ARRAY-->"+JSON.stringify(final_ota_data));
                                //console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                            
                                let uniqval_ota = removeDuplicates(final_ota_data);
                                console.log("EMAC LIST ----------->"+uniqval_ota);
                                /****OLD CODE****/
    
                                var isUpdateable = false
                                // find cota entry and check if update is required.
                                if (uniqval_ota && uniqval_ota.length > 0) {                               
                                    uniqval_ota.map(data => {
                                        if (data.action == "cota") {
                                            isUpdateable = !(parseInt(req.headers['cotaversion'].replace('_', '')) >= parseInt(data.buildDate.replace('_', '')))
                                        }
                                        else
                                        {
                                             isUpdateable = true
                                        }
                                    })
                                }
                                //TODO: Update spacing to 4 before commiting
                                if (isUpdateable) { // for special individual ota update
                                    debug("lvtype else part of ota launcher 1", lvType);
                                    finalOtaData = JSON.parse(JSON.stringify(uniqval_ota));
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
                                    //finalOtaData.forEach(function(v){ delete v.headerfilterkeyRegex , delete v.headerfiltervalueRegex ,
                                    //    delete v.headerfilterkey1,  delete v.headerfiltervalue1 ,delete v.headerfilterkey2,  delete v.headerfiltervalue2, 
                                    //   delete v.headerfilterkey3,  delete v.headerfiltervalue3  });
    
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

function search(nameKey, myArray){
    for (let i=0; i < myArray.length; i++) {
        console.log("KEYLIST" + myArray[i].headerfilterkey)
        console.log("nameKey =>" + nameKey)
        if (myArray[i].headerfilterkey === nameKey) {
            console.log(myArray[i]);
            return myArray[i];
        }
    }
}


function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}


function getUniqueheaderfilterkeyRegex(arr){
    let mapObj = new Map()
    
    arr.forEach(v => {
      let prevValue = mapObj.get(v.headerfilterkeyRegex)
      if(!prevValue || prevValue.type === "headerfilterkeyRegex"){
        mapObj.set(v.headerfilterkeyRegex, v)
      } 
    })
    return [...mapObj.values()]
  }

  function getUniqueheaderfilterkey1(arr){
    let mapObj = new Map()
    
    arr.forEach(v => {
      let prevValue = mapObj.get(v.headerfilterkey1)
      if(!prevValue || prevValue.type === "headerfilterkey1"){
        mapObj.set(v.headerfilterkey1, v)
      } 
    })
    return [...mapObj.values()]
  }


  function getUniqueheaderfilterkey2(arr){
    let mapObj = new Map()
    
    arr.forEach(v => {
      let prevValue = mapObj.get(v.headerfilterkey2)
      if(!prevValue || prevValue.type === "headerfilterkey2"){
        mapObj.set(v.headerfilterkey2, v)
      } 
    })
    return [...mapObj.values()]
  }


  function getUniqueheaderfilterkey3(arr){
    let mapObj = new Map()
    
    //console.log("********************"+arr)
    arr.forEach(v => {
      let prevValue = mapObj.get(v.headerfilterkey3)
      console.log("\n\n^^^^^^^^^^^^^^^^\n\n"+ prevValue);

      if(!prevValue || prevValue.type === "headerfilterkey3"){
        mapObj.set(v.headerfilterkey3, v)
      }
      console.log("\n\n^^^^^^^^^^^^^^^^\n\n"+ JSON.stringify(mapObj)); 
    })
    return [...mapObj.values()]
  }

  
/*
 * PostHog Update
 * 
 */
exports.getPostHogTVUpdate1 = function (req, res, next) {

    key_ota_configlist=req.headers['lversion']+'-'+req.headers['mboard'];//1.4.1-CWTXCEVAL(mboard)
    var emactv = req.headers['emac'];
    var mboardtv = req.headers['mboard'];
    var lversiontv = req.headers['lversion'];
    var fotaversiontv = req.headers['fotaversion'];
    let otaconfigarray;
    debug("**** ACCEPT VERSION***" + req.headers['accept-version']);
    let final_ota_data=[];

            //console.log('Retrieved value from cache !!');            
            // Serve response from cache using
            if(appCache.has(key_ota_configlist))
            {
                        //appCache.get(key_ota_configlist);
                        otaconfigarray = appCache.get(key_ota_configlist);
                        //console.log("TOTAL ARRAYS "+otaconfigarray);                        
                        //var otaconfigkeylist = otaconfigarray.map(function (el) { return el.headerfilterkey; });
                        //console.log("KAY LIST DISPLAY-->",otaconfigkeylist);
                        //let uniqval = removeDuplicates(otaconfigkeylist);
                        //console.log("UNique LISt->",uniqval);

                        //for loop checker length of _otaconfigs array present headerfilterkey  
                        //otaconfigarray check in this emac 
                        /*
                        for (let i = 0; i < uniqval.length; i++) 
                        {
                            var newArrayemac = [];
                            var newArraymboard = [];
                            console.log(` cacche uniqval ${i+1}: ${uniqval[i]}`)
                            if(uniqval[i] == "emac"){
                                newArrayemac = otaconfigarray.filter(element => (element.headerfiltervalue == emactv && element.headerfilterkey == uniqval[i]));
                                final_ota_data.push(...newArrayemac);
                            }
                            else{
                                if(uniqval[i] == "mboard"){
                                    newArraymboard = otaconfigarray.filter(element => (element.headerfiltervalue == mboardtv && element.headerfilterkey == uniqval[i]));                                    
                                    final_ota_data.push(...newArraymboard);
                                }
                            }
                            
                        }
                        */
                        uniqval=["lversion","mboard","fotaversion","emac"];

                        const litems = otaconfigarray.filter(item =>((lversiontv.toLowerCase().includes(item.headerfiltervalueRegex)) && item.headerfilterkeyRegex === uniqval[0]));
                        console.log("Regex lversion--->"+litems);
                        console.log("***********************************");
                        console.log("***********************************");
                        console.log(otaconfigarray[0].headerfiltervalueRegex);
                        console.log("***********************************");
                        console.log(lversiontv.toLowerCase().includes(otaconfigarray[0].headerfiltervalueRegex));
                        console.log("***********************************");
                        console.log("***********************************");
                        console.log("regex check this-------->"+(lversiontv.toLowerCase().includes(otaconfigarray[0].headerfiltervalueRegex) !== -1) )
                        const items = otaconfigarray.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1]));
                        console.log("MBOARD--->"+items);
                        const items1 = otaconfigarray.filter(item1 => (item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2]));
                        console.log("fotaversion--->"+items1);
                        const items2 = otaconfigarray.filter(item2 => (item2.headerfiltervalue3 === emactv && item2.headerfilterkey3 === uniqval[3]));
                        console.log("emac--->"+items2);

                        let combined_array =[];
                        combined_array.push(...litems);
                        combined_array.push(...items);
                        combined_array.push(...items1);
                        combined_array.push(...items2);

                        console.log("MIXED ARRAY"+JSON.stringify(combined_array));
                        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                        
                        let uniqval_otaconfig1 = getUniqueheaderfilterkeyRegex(combined_array);
                        let uniqval_otaconfig2 = getUniqueheaderfilterkey1Regex(combined_array);
                        let uniqval_otaconfig3 = getUniqueheaderfilterkey2Regex(combined_array);


                        //console.log("FINAL ARRAY RESULT*******************"+uniqval_otaconfig1)
                        //console.log("FINAL ARRAY RESULT*******************"+uniqval_otaconfig2)
                        //console.log("FINAL ARRAY RESULT*******************"+uniqval_otaconfig3)

                        final_ota_data = [...uniqval_otaconfig1,...uniqval_otaconfig2, ...uniqval_otaconfig3];
                        console.log("\n\n###############################")
                        let uniqval_ota = removeDuplicates(final_ota_data);
                        console.log("Uniqueval ----------->"+uniqval_ota);
                        
                                res.status(200);
                                res.json(uniqval_ota);
                                res.end();
                                req.ota = uniqval_ota;
                                next(true);
            }else{
                console.log('Retrieved value from NEW !!');

                    ota_configs.find({'headerfilterkeyRegex' : { '$exists' : true },'headerfilterkey1' : { '$exists' : true }}, '-_id -created_at -updated_at -__v')
                    .exec(function (err, _otaconfigs) {
                    if (err) {
                        res.status(500);
                        res.json({ data: "Error occured:" + err })
                        next(false)
                    } else {
                        //lversion,mboard,fotaversion,emac

                        //console.log("Display-->",_otaconfigs)
                        appCache.set(key_ota_configlist, _otaconfigs);
                        otaconfigarray = _otaconfigs;
                        console.log("TOTAL ARRAYS "+otaconfigarray);      

                        //var otaconfigkeylist = _otaconfigs.map(function (el) { return el.headerfilterkey; });
                        //console.log("KAY LIST DISPLAY-->",otaconfigkeylist);
                        //let uniqval = removeDuplicates(otaconfigkeylist);
                        //console.log("UNique LISt->",uniqval);

                        //for loop checker length of _otaconfigs array present headerfilterkey  
                        //otaconfigarray check in this emac 

                        uniqval=["lversion","mboard","fotaversion","emac"];

                        const litems = _otaconfigs.filter(item =>((lversiontv.toLowerCase().includes(item.headerfiltervalueRegex)) && item.headerfilterkeyRegex === uniqval[0]));
                        console.log("Regex lversion--->"+litems);
                        console.log("***********************************");
                        console.log("***********************************");
                        console.log(_otaconfigs[0].headerfiltervalueRegex);
                        console.log("***********************************");
                        console.log(lversiontv.toLowerCase().includes(_otaconfigs[0].headerfiltervalueRegex));
                        console.log("***********************************");
                        console.log("***********************************");
                        console.log("regex check this-------->"+(lversiontv.toLowerCase().includes(_otaconfigs[0].headerfiltervalueRegex) !== -1) )
                        const items = _otaconfigs.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1]));
                        console.log("MBOARD--->"+items);
                        const items1 = _otaconfigs.filter(item1 => (item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2]));
                        console.log("fotaversion--->"+items1);
                        const items2 = _otaconfigs.filter(item2 => (item2.headerfiltervalue3 === emactv && item2.headerfilterkey3 === uniqval[3]));
                        console.log("emac--->"+items2);

                        let combined_array =[];
                        combined_array.push(...litems);
                        combined_array.push(...items);
                        combined_array.push(...items1);
                        combined_array.push(...items2);

                        console.log("MIXED ARRAY"+JSON.stringify(combined_array));
                        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                        
                        let uniqval_otaconfig1 = getUniqueheaderfilterkeyRegex(combined_array);
                        let uniqval_otaconfig2 = getUniqueheaderfilterkey1Regex(combined_array);
                        let uniqval_otaconfig3 = getUniqueheaderfilterkey2Regex(combined_array);


                        //console.log("FINAL ARRAY RESULT*******************"+uniqval_otaconfig1)
                        //console.log("FINAL ARRAY RESULT*******************"+uniqval_otaconfig2)
                        //console.log("FINAL ARRAY RESULT*******************"+uniqval_otaconfig3)

                        final_ota_data = [...uniqval_otaconfig1,...uniqval_otaconfig2, ...uniqval_otaconfig3];
                        console.log("\n\n###############################")
                        let uniqval_ota = removeDuplicates(final_ota_data);
                        console.log("Uniqueval ----------->"+uniqval_ota);
                        /*
                        for (let i = 0; i < uniqval.length; i++) 
                        {

                            
                            var newArrayemac = [];
                            var newArraymboard = [];
                            console.log(`uniqval ${i+1}: ${uniqval[i]}`)
                            if(uniqval[i] == "emac"){
                                console.log("uniqval[i]"+uniqval[i])
                                newArrayemac = _otaconfigs.filter(element => (element.headerfiltervalue === emactv && element.headerfilterkey === uniqval[i]));
                                //console.log("newArrayemac====>"+newArrayemac)
                                    final_ota_data.push(...newArrayemac);
                            }
                            else{
                                if(uniqval[i] == "mboard"){
                                    newArraymboard = _otaconfigs.filter(element => (element.headerfiltervalue === mboardtv && element.headerfilterkey === uniqval[i]));                                    
                                    console.log("newArraymboard====>"+newArraymboard)
                                    final_ota_data.push(...newArraymboard);
                                }
                            }
                            //console.log("D$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
                           //final_ota_data = [...newArrayemac, ...newArraymboard];
                        }
                        */
                                //console.log("EMAC LIST ----------->"+final_ota_data);
                                res.status(200);
                                res.json(uniqval_ota);
                                res.end();
                                req.ota = uniqval_ota;
                                next(true);

                       }
                    });   
                
            }
}


/*
 * PostHog Update
 * 
 */
exports.getPostHogTVUpdate2 = function (req, res, next) {

    key_ota_configlist=req.headers['lversion']+'-'+req.headers['mboard'];//1.4.1-CWTXCEVAL(mboard)
    var emactv = req.headers['emac'];
    var mboardtv = req.headers['mboard'];
    var lversiontv = req.headers['lversion'];
    var fotaversiontv = req.headers['fotaversion'];
    let otaconfigarray;
    var lvLength = req.headers["lversion"].length;
            lvArray = req.headers["lversion"].split('-')
            console.log(lvArray)
            if (lvLength > 20 && lvArray.length >= 4) {
                lvNumber = Number(lvArray[0].replace(/[^0-9]/g, "") + lvArray[1].padStart(3, "0"))
                lvType = lvArray[3].toUpperCase()
            }
            console.log("=====DATA: ========len:" + lvLength + "==ver:" + lvNumber + "==type:" + lvType)
    debug("**** ACCEPT VERSION***" + req.headers['accept-version']);
    let final_ota_data=[];

            //console.log('Retrieved value from cache !!');            
            // Serve response from cache using
            /*if(appCache.has(key_ota_configlist))
            {
                        //appCache.get(key_ota_configlist);
                        otaconfigarray = appCache.get(key_ota_configlist);
            }else
            */
            {
                console.log('Retrieved value from NEW !!');
                

                    ota_configs.find({'headerfilterkeyRegex' : { '$exists' : true },'headerfilterkey1' : { '$exists' : true }}, '-_id -created_at -updated_at -__v')
                    .exec(function (err, _otaconfigs) {
                    if (err) {
                        res.status(500);
                        res.json({ data: "Error occured:" + err })
                        next(false)
                    } else {
                        //lversion,mboard,fotaversion,emac

                        //console.log("Display-->",_otaconfigs)
                        appCache.set(key_ota_configlist, _otaconfigs);
                        otaconfigarray = _otaconfigs;
                        //console.log("TOTAL ARRAYS "+otaconfigarray);      

                        //var otaconfigkeylist = _otaconfigs.map(function (el) { return el.headerfilterkey; });
                        //console.log("KAY LIST DISPLAY-->",otaconfigkeylist);
                        //let uniqval = removeDuplicates(otaconfigkeylist);
                        //console.log("UNique LISt->",uniqval);

                        //for loop checker length of _otaconfigs array present headerfilterkey  
                        //otaconfigarray check in this emac 

                        uniqval=["lversion","mboard","fotaversion","emac"];

                        const litems = _otaconfigs.filter(litem =>((lversiontv.toLowerCase().includes(litem.headerfiltervalueRegex)) && litem.headerfilterkeyRegex === uniqval[0]));
                        var litems_count= Object.keys(litems).length;
                        console.log("Regex lversion Length %%%%%%%%%%%>"+litems_count);
                        console.log("Regex lversion--->"+litems);
                        console.log("***********************************");
                        console.log("***********************************");
                        //console.log(_otaconfigs[0].headerfiltervalueRegex);
                        console.log("***********************************");
                        //console.log(lversiontv.toLowerCase().includes(_otaconfigs[0].headerfiltervalueRegex));
                        console.log("***********************************");
                        
                        //console.log("regex check this-------->"+(lversiontv.toLowerCase().includes(_otaconfigs[0].headerfiltervalueRegex) !== -1) )
                        const items_mboards = litems.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1]));
                        var items_mboards_count= Object.keys(items_mboards).length;
                        console.log("Mboard Length %%%%%%%%%%%>"+items_mboards_count);
                        var fotatv_count=0;
                        var emactv_count=0;

                        /*
                        for (let i = 0; i < items_mboards_count; i++) 
                        {
                            if(items_mboards[i]["headerfilterkey2"] === null || items_mboards[i]["headerfilterkey2"]  === ''  || items_mboards[i]["headerfilterkey2"] === undefined) {
                                console.log("the key fota NOT exists on the object");
                                fotatv_count++;
                            }
                        }    
                        */

                        console.log("***********************************");
                        for (let key in items_mboards) {
                            // Console logs all the 
                            // values in the objArr Array:
                            console.log(items_mboards[key]);
                            /*
                            for(var k in items_mboards){
                                if(items_mboards["headerfilterkey2"] !== "" && items_mboards["headerfilterkey2"] === null)
                                {
                                    console.log("the key fota exists on the object");
                                    fotatv_count++;
                                }
                            }
                            */
                            if (uniqval[2] === items_mboards[key]["headerfilterkey2"] && items_mboards[key]["headerfiltervalue2"] === fotaversiontv) {
                                console.log("the key fota exists******* the object");
                                fotatv_count++;
                            }
                            if (uniqval[3] === items_mboards[key]["headerfilterkey3"] && items_mboards[key]["headerfiltervalue3"] === emactv) {
                                console.log("the key EMAC exists&&&&&&&& the object");
                                emactv_count++;
                            }
                            /*
                            if ("headerfilterkey3" in items_mboards[key]) {
                                console.log("the key emac exists on the object");
                                emactv_count++;
                            }
                            */
                            
                        }
                       
                        let combined_array =[];
                        let arr_fota=[];
                        let arr_emac=[];
                        let arr_fota_emac=[];
                       
                        
                        let items_fota_emac,items_fota_emac_count,fotaarr_count,emacarr_count,items1,items2;

                        console.log("fotatv_count OBJECT---> "+fotatv_count+" emactv_count OBJECT---> "+emactv_count);
                        console.log("***********************************");
                        
                        if(fotatv_count >= 1 && emactv_count >= 1){
                            items_fota_emac = items_mboards.filter(item1 => ((item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2]) && (item1.headerfiltervalue3 === emactv && item1.headerfilterkey3 === uniqval[3])));
                            items_fota_emac_count= Object.keys(items_fota_emac).length;
                            console.log("fotaversion Length %%%%%%%%%%%>"+ items_fota_emac_count);
                            console.log("fotaversion DDDDDDD--->"+items_fota_emac);                            
                        }

                        if(items_fota_emac_count > 0)
                        {
                            combined_array.push(...items_fota_emac);
                            arr_fota_emac = items_mboards.filter(elm => !items_fota_emac.map(elm => JSON.stringify(elm)).includes(JSON.stringify(elm)));


                        }
                        console.log("%%%%%%%%%%%");
                        console.log("%%%%%%%%%%% **************** EMAC NOT fotaversion--->"+fotatv_count);
                        console.log("%%%%%%%%%%% **************** FOTA NOT fotaversion--->"+emactv_count);
                        console.log("%%%%%%%%%%%");

                        if(fotatv_count >=1)
                        {
                            console.log("%%%%%%%%%%%");
                            console.log("EMAC COUNT0$$$$$$$$$$$$$$$$$$$$$$");
                            console.log("%%%%%%%%%%%");
                            items1 = items_mboards.filter(item1 => (item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2] && item1.headerfilterkey3 === ""));
                            console.log("%%%%%%%%%%% **************** EMAC NOT fotaversion--->"+items1);
                            fotaarr_count= Object.keys(items1).length;
                            console.log("%%%%%%%%%%% ****************fotaversion--->"+fotaarr_count)
                            combined_array.push(...items1);
                            arr_fota = items_mboards.filter(elm => !items1.map(elm => JSON.stringify(elm)).includes(JSON.stringify(elm)));
                        }else if(emactv_count >= 1){
                            items2 = items_mboards.filter(item2 => (item2.headerfiltervalue3 === emactv && item2.headerfilterkey3 === uniqval[3] && item2.headerfiltervalue2 === ''));
                            console.log("%%%%%%%%%%%&********************* emac items-->"+items2);
                            console.log("fotatv_count COUNT 0 $$$$$$$$$$$$$$$$$$$$$$");
                            emacarr_count= Object.keys(items2).length;
                            console.log("%%%%%%%%%%% ****************emacarr_count--->"+emacarr_count)
                            combined_array.push(...items2);
                            arr_emac = items_mboards.filter(elm => !items2.map(elm => JSON.stringify(elm)).includes(JSON.stringify(elm)));
                        }
                            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ")
                            const items_mboardslist = items_mboards.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1] && item.headerfiltervalue2 === '' && item.headerfiltervalue3 === ''));
                            combined_array.push(...items_mboardslist);
                      
                        
                            final_ota_data = [...combined_array];
                            console.log("\n\n###############################")
                            
                        //combined_array.push(...litems);
                        //combined_array.push(...items_mboards);

                        //combined_array.push(...items1);
                        //combined_array.push(...items2);

                        console.log("MIXED ARRAY-->"+JSON.stringify(final_ota_data));
                        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                        
                                                
                        /*
                        let result_ota=[];

                        if(items_fota_emac_count > 0)
                        {
                            result_ota=[...items_fota_emac];
                            console.log("\n\n###############################")
                            console.log("items_fota_emac_count ARRAY RESULT*******************"+result_ota)
                            console.log("\n\n###############################")

                        }else if(fotaarr_count > 0){
                            result_ota=[...items1];
                            console.log("\n\n###############################")
                            console.log("fotaarr_count ARRAY RESULT*******************"+result_ota)
                            console.log("\n\n###############################")

                        }else if(emacarr_count > 0){
                            result_ota=[...items2];
                            console.log("\n\n###############################")
                            console.log("E<ACLIST ARRAY RESULT*******************"+result_ota)
                            console.log("\n\n###############################")
                        }
                        else(emacarr_count > 0){
                            result_ota=[...items2];
                            console.log("\n\n###############################")
                            console.log("E<ACLIST ARRAY RESULT*******************"+result_ota)
                            console.log("\n\n###############################")
                        }

                        
                       
                        {    
                            const finalitems_mboards = items_mboards.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1] && item.headerfiltervalue2 === ""  && item.headerfiltervalue3 === "" ));
                            result_ota=[...finalitems_mboards];
                            console.log("\n\n###############################")
                            console.log("MBOARD ARRAY RESULT*******************"+result_ota)
                            console.log("\n\n###############################")
                        } 
                        */

                        
                        //final_ota_data = [...uniqval_otaconfig1,...result_ota];
                        //let uniqval_ota = removeDuplicates(combined_array);
                        
                        /*
                        let uniqval_otaconfig1 = getUniqueheaderfilterkeyRegex(combined_array);
                        let uniqval_otaconfig2 = getUniqueheaderfilterkey1(uniqval_otaconfig1);
                        let uniqval_otaconfig3 = getUniqueheaderfilterkey2(uniqval_otaconfig2);
                        let uniqval_otaconfig4 = getUniqueheaderfilterkey3(uniqval_otaconfig3);


                        //console.log("FINAL ARRAY RESULT*******************"+uniqval_otaconfig1)
                        //console.log("FINAL ARRAY RESULT*******************"+uniqval_otaconfig2)
                        //console.log("FINAL ARRAY RESULT*******************"+uniqval_otaconfig3)

                        final_ota_data = [...uniqval_otaconfig1,...uniqval_otaconfig2, ...uniqval_otaconfig3,...uniqval_otaconfig4];
                        console.log("\n\n###############################")
                        let uniqval_ota = removeDuplicates(combined_array);
                        //console.log("Uniqueval ----------->"+uniqval_ota);
                        */
                        /*
                        let result_ota=[];

                        for (let i = 0; i < uniqval_ota.length; i++) 
                        {
                            var newArrayemac = [];
                            var newArraymboard = [];
                            console.log(`uniqval ${i+1}: ${uniqval[i]}`)
                            if(uniqval[i] == "emac" && uniqval[i] == "fotaversion"){

                            }else{

                            }

                            if(uniqval[i] == "emac"){
                                newArrayemac = uniqval_ota.filter(element => (element.headerfiltervalue3 == emactv && element.headerfilterkey3 == "emac"));
                                result_ota.push(...newArrayemac);
                            }
                            else{
                                if(uniqval[i] == "fotaversion"){
                                    newArraymboard = uniqval_ota.filter(element => (element.headerfiltervalue2 == fotaversiontv && element.headerfilterkey2 == "fotaversion"));                                    
                                    result_ota.push(...newArraymboard);
                                }
                            }
                            
                        }
                        */  let uniqval_ota = removeDuplicates(final_ota_data);
                            console.log("EMAC LIST ----------->"+uniqval_ota);
                            /****OLD CODE****/

                            var isUpdateable = false
                            // find cota entry and check if update is required.
                            if (uniqval_ota && uniqval_ota.length > 0) {                               
                                uniqval_ota.map(data => {
                                    if (data.action == "cota") {
                                        isUpdateable = !(parseInt(req.headers['cotaversion'].replace('_', '')) >= parseInt(data.buildDate.replace('_', '')))
                                    }
                                    else
                                    {
                                         isUpdateable = true
                                    }
                                })
                            }
                            //TODO: Update spacing to 4 before commiting
                            if (isUpdateable) { // for special individual ota update
                                debug("lvtype else part of ota launcher 1", lvType);
                                finalOtaData = JSON.parse(JSON.stringify(uniqval_ota));
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
                                finalOtaData.forEach(function(v){ delete v.headerfilterkeyRegex , delete v.headerfiltervalueRegex ,
                                    delete v.headerfilterkey1,  delete v.headerfiltervalue1 ,delete v.headerfilterkey2,  delete v.headerfiltervalue2, 
                                    delete v.headerfilterkey3,  delete v.headerfiltervalue3  });

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
}


/*
 * PostHog Update
 * 
 */
exports.getPostHogTVUpdate1 = function (req, res, next) {

    key_ota_configlist=req.headers['lversion']+'-'+req.headers['mboard'];//1.4.1-CWTXCEVAL(mboard)
    var emactv = req.headers['emac'];
    var mboardtv = req.headers['mboard'];
    //var lversiontv = req.headers['lversion'];
    var fotaversiontv = req.headers['fotaversion'];
    let otaconfigarray;
    var lversiontv="2.1.2-3-g0381063-cvte-com";
    debug("**** ACCEPT VERSION***" + req.headers['accept-version']);
    let final_ota_data=[];
            {
                console.log('Retrieved value from NEW !!');

                    /*
                    ota_configs.find(
                        {
                            //"headerfiltervalueRegex": {$regex: ".*2.1.2-3-g0381063-cvte-com.", $options:"i"},
                            "headerfiltervalue1": mboardtv,
                            //"headerfilterkey2": fotaversiontv,
                            //"headerfilterkey3": emactv,
                                                 
                        }, '-_id -created_at -updated_at -__v')
                    */    
                    ota_configs.find({'headerfilterkeyRegex' : { '$exists' : true },'headerfilterkey1' : { '$exists' : true }}, '-_id -created_at -updated_at -__v')                    
                    .exec(function (err, _otaconfigs) {
                    if (err) {
                        res.status(500);
                        res.json({ data: "Error occured:" + err })
                        next(false)
                    } else {
                        //lversion,mboard,fotaversion,emac

                        console.log("Display-->",_otaconfigs)

                        let obj1 = _otaconfigs.find(ob => ob.headerfiltervalue2 === fotaversiontv);
                        //let obj = _otaconfigs.find(o => o.headerfiltervalue3 === emactv);

                        
                        
                            console.log("EMAC LIST ----------->"+obj1);
                                res.status(200);
                                res.json(obj1);
                                res.end();
                                req.ota = obj1;
                                next(true);

                       }
                    });   
                
            }
}

exports.getPostHogTVUpdate = function (req, res, next) {

    key_ota_configlist=req.headers['lversion']+'-'+req.headers['mboard'];//1.4.1-CWTXCEVAL(mboard)
    var emactv = req.headers['emac'];
    var mboardtv = req.headers['mboard'];
    var lversiontv = req.headers['lversion'];
    var fotaversiontv = req.headers['fotaversion'];
    let otaconfigarray;
    debug("**** ACCEPT VERSION***" + req.headers['accept-version']);
    let final_ota_data=[];

                {
                ota_configs.find({'headerfilterkeyRegex' : { '$exists' : true },'headerfilterkey1' : { '$exists' : true }}, '-_id -created_at -updated_at -__v')
                    .exec(function (err, _otaconfigs) {
                    if (err) {
                        res.status(500);
                        res.json({ data: "Error occured:" + err })
                        next(false)
                    } else {
                        //lversion,mboard,fotaversion,emac

                        //console.log("Display-->",_otaconfigs)
                        appCache.set(key_ota_configlist, _otaconfigs);
                        otaconfigarray = _otaconfigs;
                        //console.log("TOTAL ARRAYS "+otaconfigarray);   

                        uniqval=["lversion","mboard","fotaversion","emac"];
                        const lversionitems = _otaconfigs.filter(litem =>((lversiontv.toLowerCase().includes(litem.headerfiltervalueRegex)) && litem.headerfilterkeyRegex === uniqval[0]));
                        //console.log("Regex lversion--->"+lversionitems);
                        console.log("***********************************");
                        const mboarditems = lversionitems.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1] ));
                        console.log("MBOARD--->"+mboarditems);                        
                        console.log("***********************************");
                        const fotaversionitems = mboarditems.filter(item1 => (item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2]));
                        console.log("fotaversion--->"+fotaversionitems);
                        console.log("***********************************");
                        const emacitems = mboarditems.filter(item2 => (item2.headerfiltervalue3 === emactv && item2.headerfilterkey3 === uniqval[3]));
                        console.log("emac--->"+emacitems);
                        console.log("***********************************");                                           
                        console.log("***********************************");

                        var fotaversionitems_count= Object.keys(fotaversionitems).length;
                        console.log("fotaversionitems_count  Length %%%%%%%%%%%>"+fotaversionitems_count);
                        var emacitems_count= Object.keys(emacitems).length;
                        console.log("emacitems_count Length %%%%%%%%%%%>"+emacitems_count);

                        let items_fota_emac,items_fota_emac_count,fotaarr_count,emacarr_count,items1,items2;

                        console.log("fotatv_count OBJECT---> "+fotaversionitems_count+" emactv_count OBJECT---> "+emacitems_count);
                        console.log("***********************************");
                        
                        if(fotaversionitems_count >= 1 && emacitems_count >= 1){
                            console.log("fotaversion--->"+items_fota_emac);
                            items_fota_emac = mboarditems.filter(item1 => ((item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2]) && (item1.headerfiltervalue3 === emactv && item1.headerfilterkey3 === uniqval[3])));
                            items_fota_emac_count= Object.keys(items_fota_emac).length;
                            console.log("FOTA & EMAC Length %%%%%%%%%%%>"+ items_fota_emac_count);
                            console.log("fotaversion--->"+items_fota_emac);                            
                        }

                        let combined_array =[];

                        if(items_fota_emac_count > 0)
                        {
                            combined_array.push(...items_fota_emac);
                        }else if(fotaversionitems_count >= 1 && emacitems_count === 0)
                        {
                            items1 = fotaversionitems.filter(item1 => (item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2] && item1.headerfilterkey3 === ""));
                            console.log("%%%%%%%%%%% ****************fotaversion--->"+items1);
                            console.log("%%%%%%%%%%% ****************fotaversion--->"+fotaversionitems);
                            fotaarr_count= Object.keys(items1).length;
                            console.log("%%%%%%%%%%% ****************fotaversion--->"+fotaarr_count)
                            combined_array.push(...items1);
                        }else if(fotaversionitems_count === 0 && emacitems_count >= 1){
                            items2 = emacitems.filter(item2 => (item2.headerfiltervalue3 === emactv && item2.headerfilterkey3 === uniqval[3] && item2.headerfiltervalue2 === ''));
                            console.log("%%%%%%%%%%%&********************* emac items-->"+items2);
                            emacarr_count= Object.keys(items2).length;
                            console.log("%%%%%%%%%%% ****************emacarr_count--->"+emacarr_count)
                            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"+emacitems)
                            combined_array.push(...items2);
                        }else{
                            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ MBOARD")
                            combined_array.push(...mboarditems);
                        }
                        
                        //combined_array.push(...litems);
                        //combined_array.push(...items_mboards);

                        //combined_array.push(...items1);
                        //combined_array.push(...items2);

                        console.log("MIXED ARRAY-->"+JSON.stringify(combined_array));
                        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                        

                        let result_ota=[];

                        if(items_fota_emac_count > 0)
                        {
                            result_ota=[...items_fota_emac];
                            console.log("\n\n###############################")
                            console.log("items_fota_emac_count ARRAY RESULT*******************"+result_ota)
                            console.log("\n\n###############################")

                        }else if(fotaarr_count > 0){
                            result_ota=[...items1];
                            console.log("\n\n###############################")
                            console.log("fotaarr_count ARRAY RESULT*******************"+result_ota)
                            console.log("\n\n###############################")

                        }else if(emacarr_count > 0){
                            result_ota=[...items2];
                            console.log("\n\n###############################")
                            console.log("E<ACLIST ARRAY RESULT*******************"+result_ota)
                            console.log("\n\n###############################")
                        }



                       
                        
                        //final_ota_data = [...uniqval_otaconfig1,...uniqval_otaconfig2, ...uniqval_otaconfig3,...uniqval_otaconfig4];
                        console.log("\n\n###############################")
                        let uniqval_ota = removeDuplicates(combined_array);
                        console.log("Uniqueval ----------->"+uniqval_ota);
                        console.log("\n\n###############################")
                                res.status(200);
                                res.json(uniqval_ota);
                                res.end();
                                req.ota = uniqval_ota;
                                next(true);
                               
                        
                       }
                    });   
                
            }
}



exports.getTVUpdatecache_details = function (req, res, next) {

    key_ota_configlist=req.headers['lversion']+'-'+req.headers['mboard'];//1.4.1-CWTXCEVAL(mboard)
    var emactv = req.headers['emac'];
    var mboardtv = req.headers['mboard'];
    var lversiontv = req.headers['lversion'];
    var fotaversiontv = req.headers['fotaversion'];
    let otaconfigarray=[];
    debug("**** ACCEPT VERSION***" + req.headers['accept-version']);
    let final_ota_data=[];

            //console.log('Retrieved value from cache !!');            
            // Serve response from cache using
            /*
            if(appCache.has(key_ota_configlist))
            {
                console.log('Retrieved value from CACHE !!'); 
                //appCache.get(key_ota_configlist);
                otaconfigarray=appCache.get(key_ota_configlist);
                console.log("ARRAY------------------>"+otaconfigarray)
                console.log("otaconfigarray[i].headerfilterkey1------------------>"+ otaconfigarray['0'].headerfiltervalue1)
                    
                var found = false;
                for(var i = 0; i < otaconfigarray.length; i++) {
                    console.log("otaconfigarray[i].headerfilterkey1------------------>"+ otaconfigarray[i].headerfiltervalue1)
                    if (otaconfigarray[i].headerfiltervalue1 == mboardtv && lversiontv.toLowerCase().includes(otaconfigarray[i].headerfiltervalueRegex)) {
                        found = true;
                        console.log('DONE CACHE PRESNT ***************!!'); 
                        break;
                    }
                }

                console.log('DONE***************!!'); 
                res.status(200);
                res.end();

            }else
            
            */
            {
                console.log('Retrieved value from NEW !!'); 
                ota_configs.find({'headerfilterkeyRegex' : { '$exists' : true },'headerfilterkey1' : { '$exists' : true }}, '-_id -created_at -updated_at -__v')
                    .exec(function (err, _otaconfigs) {
                    if (err) {
                        res.status(500);
                        res.json({ data: "Error occured:" + err })
                        next(false)
                    } else {
                        appCache.set(key_ota_configlist, _otaconfigs);
                        otaconfigarray = _otaconfigs;
                        uniqval=["lversion","mboard","fotaversion","emac"];
                        const litems = _otaconfigs.filter(litem =>((lversiontv.toLowerCase().includes(litem.headerfiltervalueRegex)) && litem.headerfilterkeyRegex === uniqval[0]));
                        var litems_count= Object.keys(litems).length;
                        console.log("Regex lversion Length %%%%%%%%%%%>"+litems_count);
                        console.log("Regex lversion--->"+litems);
                        const items_mboards = litems.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1]));
                        var items_mboards_count= Object.keys(items_mboards).length;
                        console.log("Mboard Length %%%%%%%%%%%>"+items_mboards_count);
                        var fotatv_count=0;
                        var emactv_count=0;
                        console.log("***********************************");
                        for (let key in items_mboards) {
                            console.log(items_mboards[key]);
                            if (uniqval[2] === items_mboards[key]["headerfilterkey2"] && items_mboards[key]["headerfiltervalue2"] === fotaversiontv) {
                                console.log("the key fota exists******* the object");
                                fotatv_count++;
                            }
                            if (uniqval[3] === items_mboards[key]["headerfilterkey3"] && items_mboards[key]["headerfiltervalue3"] === emactv) {
                                console.log("the key EMAC exists&&&&&&&& the object");
                                emactv_count++;
                            }
                        }                       
                        let combined_array =[];
                        let arr_fota=[];
                        let arr_emac=[];
                        let arr_fota_emac=[];
                        let items_fota_emac,items_fota_emac_count,fotaarr_count,emacarr_count,items1,items2;

                        console.log("fotatv_count OBJECT---> "+fotatv_count+" emactv_count OBJECT---> "+emactv_count);
                        console.log("***********************************");
                        
                        if(fotatv_count >= 1 && emactv_count >= 1){
                            items_fota_emac = items_mboards.filter(item1 => ((item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2]) && (item1.headerfiltervalue3 === emactv && item1.headerfilterkey3 === uniqval[3])));
                            items_fota_emac_count= Object.keys(items_fota_emac).length;
                            console.log("fotaversion Length %%%%%%%%%%%>"+ items_fota_emac_count);
                            console.log("fotaversion DDDDDDD--->"+items_fota_emac);                            
                        }

                        if(items_fota_emac_count > 0)
                        {
                            combined_array.push(...items_fota_emac);
                            arr_fota_emac = items_mboards.filter(elm => !items_fota_emac.map(elm => JSON.stringify(elm)).includes(JSON.stringify(elm)));


                        }
                        if(fotatv_count >=1)
                        {
                            items1 = items_mboards.filter(item1 => (item1.headerfiltervalue2 === fotaversiontv && item1.headerfilterkey2 === uniqval[2] && item1.headerfilterkey3 === ""));
                            console.log("%%%%%%%%%%% **************** EMAC NOT fotaversion--->"+items1);
                            fotaarr_count= Object.keys(items1).length;
                            console.log("%%%%%%%%%%% ****************fotaversion--->"+fotaarr_count)
                            combined_array.push(...items1);
                            arr_fota = items_mboards.filter(elm => !items1.map(elm => JSON.stringify(elm)).includes(JSON.stringify(elm)));
                        }else if(emactv_count >= 1){
                            items2 = items_mboards.filter(item2 => (item2.headerfiltervalue3 === emactv && item2.headerfilterkey3 === uniqval[3] && item2.headerfiltervalue2 === ''));
                            console.log("%%%%%%%%%%%&********************* emac items-->"+items2);
                            console.log("fotatv_count COUNT 0 $$$$$$$$$$$$$$$$$$$$$$");
                            emacarr_count= Object.keys(items2).length;
                            console.log("%%%%%%%%%%% ****************emacarr_count--->"+emacarr_count)
                            combined_array.push(...items2);
                            arr_emac = items_mboards.filter(elm => !items2.map(elm => JSON.stringify(elm)).includes(JSON.stringify(elm)));
                        }
                            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ")
                            const items_mboardslist = items_mboards.filter(item =>(item.headerfiltervalue1 === mboardtv && item.headerfilterkey1 === uniqval[1] && item.headerfiltervalue2 === '' && item.headerfiltervalue3 === ''));
                            combined_array.push(...items_mboardslist);
                      
                        
                            final_ota_data = [...combined_array];
                            console.log("\n\n###############################")
                            console.log("MIXED ARRAY-->"+JSON.stringify(final_ota_data));
                            console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
                            let uniqval_ota = removeDuplicates(final_ota_data);
                            console.log("EMAC LIST ----------->"+uniqval_ota);
                            res.status(200);
                            res.json(uniqval_ota);
                            res.end();
                            req.ota = uniqval_ota;
                            next(true);

                       }
                    });   
                
            }
}
