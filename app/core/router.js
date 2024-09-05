/**
 * Created by vaibhavingale on 16/11/16.
 * Set the port number from export if present else use the hardcoded port number
 References: http://nategood.com/nodejs-ssl-client-cert-auth-api-rest
 https://devcenter.heroku.com/articles/ssl-certificate-self
 https://www.reddit.com/r/node/comments/2arvwu/ssltls_with_a_self_signed_cert_for_a_node_restify/
 https://matoski.com/article/node-express-generate-ssl/
 https://github.com/Daplie/nodejs-self-signed-certificate-example
 https://gist.github.com/LeCoupa/0664e885fd74152d1f90
 */

var restify = require('restify')
var fs = require('fs')
var morgan = require('morgan')
// var path = require('path')
// var rfs = require('rotating-file-stream')
var paginate = require('restify-paginate');
var config = require(process.cwd() + '/config/global.js');
var controllers = {}
var controllers_path = process.cwd() + '/app/controllers'
const moment = require('moment-timezone');

// console.log(moment().tz('Asia/Calcutta').format());

fs.readdirSync(controllers_path).forEach(function (file) {
    if (file.indexOf('.js') != -1) {
        controllers[file.split('.')[0]] = require(controllers_path + '/' + file)
    }
})
var xmlFormatter = {
    'application/xml': function (req, res, body, cb) {
        if (body instanceof Error)
            return body.stack;
        if (Buffer.isBuffer(body))
            return cb(null, body.toString('base64'));
        return cb(null, body);
    }
}

var options = {
    paramsNames: { page: 'page', per_page: 'size' },
    defaults: { page: 0, per_page: 50 },
    numbersOnly: false,         // Generates the full links or not
    hostname: true              // Adds the hostname in the links or not
}

// create a rotating write stream
// var accessLogStream = rfs('access.log', {
//     interval: '1d', // rotate daily
//     compress: true,
//     path: path.join(process.cwd() + '/logs')

// })

morgan.token('reqHeader', function (req, res) { return JSON.stringify(req.headers) })
morgan.token('reqBody', function (req, res) { return JSON.stringify(req.body) })
morgan.token('reqIp', function (req, res) { return (req.headers['x-forwarded-for'] || req.connection.remoteAddress).replace(/^.*:/, '') })
morgan.token('resBody', function (req, res) { return JSON.stringify(res.type) })
morgan.token('date', (req, res) => { return moment().tz('Asia/Calcutta').format() })

// A restify server has the following properties on it: name, version, log, acceptable, url.
// And the following methods: address(), listen(port, [host], [callback]), close(), pre(), use().
var server = restify.createServer({
    name: 'TV_LA_UPDATE',                                   // By default, this will be set in the Server response header, default is restify
    version: '1.0.0',                                       // A default version to set for all routes
    spdy: null,                                             // Any options accepted by node-spdy
    handleUpgrades: false,                                   // Hook the upgrade event from the node HTTP server, pushing Connection: Upgrade requests through the regular request handling chain; defaults to false
    formatters: xmlFormatter,
});

//define the server port
var http_port = config.CW_CONFIG.HTTP_PORT || 3000;

// console.log("Server Path: " + process.cwd())
// console.log("Local Images Path: " + ".." + process.cwd() + "/image_server/assets/images")

var setup_server = function (app) {
    app.use(morgan((tokens, request, response) => {
        return [
            tokens.date(request, response),
            tokens.reqIp(request, response),
            tokens.method(request, response),
            tokens.url(request, response),
            tokens.reqHeader(request, response),
            tokens.reqBody(request, response),
            tokens.resBody(request, response),
            tokens.status(request, response),
            tokens.res(request, response, 'content-length'), '-',
            tokens['response-time'](request, response), 'ms'
        ].join(' ')
    }));
    //    }, { stream: accessLogStream }));

    app.use(restify.acceptParser(server.acceptable))
    app.use(restify.CORS())
    app.use(restify.fullResponse())
    app.use(restify.bodyParser())
    app.use(restify.queryParser())
    app.pre(restify.pre.sanitizePath())
    // inside app.get provide the folder from you want to start access the static files
    // directory will tell you where the above folder will be found.
    app.use(paginate(server, options));

    //########## AUTH WALL ## DO NOT REMOVE THIS LINE #########
    // app.use(controllers.middleware.checkAgainstAuthWall);  // # 
    //#########################################################


    ////////////////////////// TV LA UPDATE API  start/////////////////////////
    //// update launcher and update OTA microservices
    app.get({ path: "/tv-la-update", version: ['0.0.7', '0.0.8', '1.0.0', '1.4.0', '1.4.1'] },
//        controllers.middleware.rateLimiter,
//        controllers.middleware.deliveryTarget,
//        controllers.otaupdate.getCloudTVUpdate,
        controllers.otaupdate.getCloudTVMarketUpdate,
        //controllers.otaupdate.getPostHogTVUpdate2,
        //controllers.otaupdate.getTVUpdatecache_details,
        controllers.middleware.ota_delivery_logger
        )

    // skin launcher sending
    app.get({ path: "/tv-la-update", version: ['2.0.0'] },
        controllers.skin.getSkinTV,
        controllers.middleware.ota_delivery_logger)
        
    app.post({ path: "/update", version: ['1.0.0'] }, controllers.otaupdate.globalOTA)
}

// Now, setup both servers in one step
setup_server(server);


//start lisening on the specified https port
server.listen(http_port, function (err) {
    if (err)
        console.error(err)
    else
        console.log('HTTP Server is ready at : ' + http_port)
})

restify.defaultResponseHeaders = function (data) {
    this.header('Server', "TV_LA_UPDATE Server");
};

restify.defaultResponseHeaders = false; // disable altogether

//process.on('SIGINT', function () {
//    db.stop(function (err) {
//        process.exit(err ? 1 : 0);
//    });
//});

if (process.env.enviornment == 'production') {
    process.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    })
}
