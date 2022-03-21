//-- COUCH-PROXY.JS - production app server
//			serve angular app at https://server_url:secure_server_port/ to public folder
//			proxy https://server_url:secure_server_port/couch/whatever to couchdb_url:couchdb_port/whatever
//			comment 'consoleLogger' lines when running as a service...
//
const fs 					= require('fs');
const path				= require('path');
const express 		= require('express');
const serveStatic	= require('serve-static');
const https 			= require('https');
const proxy 			= require('express-http-proxy');

const appConf = require('./conf/app-conf');
const loggers = require('./util/appLoggers');

//-- server & https props...
//
const URL = appConf.network.server_url;
const SECURE_PORT = appConf.network.secure_server_port;
const COUCH_URL = appConf.network.couchdb_url;
const COUCH_PORT = appConf.network.couchdb_port;
const runAsService = appConf.run_as_service;

const privkey = fs.readFileSync(appConf.network.server_key_file);
const cert = fs.readFileSync(appConf.network.server_cert_file);

//-- loggers...
//
const appLogger = loggers.appFileLogger;
const couchLogger = loggers.couchFileLogger;
const consoleLogger = loggers.appConsoleLogger;
const mailLogger = loggers.mailLogger;

//-- global placeholders for building log message...
//
let logData, reqMethod, reqPath, reqQuery, reqData;

//-- create the app & server...
//
const app = express();
const secureServer = https.createServer({key: privkey, cert: cert}, app);

//-- host angular apps...
//
app.use(express.static('public'));
// app.use('/meters', serveStatic(path.join(__dirname, 'meters')));
app.use('/meters', serveStatic('meters'));
app.use('/meter-billing', serveStatic('meter-billing'));
app.use('/meter-tools', serveStatic('meter-tools'));
app.use('/couch-users', serveStatic('couch-users'));
app.use('/test', serveStatic('test'));

//-- proxy /couch to couchdb server...
//
app.use('/meters/couch', proxy(COUCH_URL + ':' + COUCH_PORT))
app.use('/couch', proxy(COUCH_URL + ':' + COUCH_PORT, {

	//-- log request, query, data...
	//
	proxyReqBodyDecorator: function(bodyContent, srcReq) {
		reqMethod = srcReq.method;
		reqPath = srcReq.url.split('?')[0];
		reqQuery = srcReq.url.split('?')[1] ? srcReq.url.split('?')[1] : 'none...';
		reqData = Object.keys(bodyContent).length != 0 ? bodyContent : 'none...';
		logData = `${(new Date()).toLocaleString()} - COUCHDB\n${reqMethod} ${reqPath}\n`;
    return bodyContent;
  },

	//-- log response...
	//
	userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
		if (proxyResData != '') {
			const data = JSON.parse(proxyResData);
			if (data.error) {
				logData += `ERROR: ${data.error}, ${data.reason}\n`;
				if (  !runAsService) {
					consoleLogger.error(logData);
				}
				appLogger.error(logData);
				couchLogger.error(logData);
				mailLogger.error(logData);
			} else {
				if (  !runAsService) {
					consoleLogger.info(logData);
				}
				appLogger.info(logData);
				logData += `request data: ${reqData}\nrequest query: ${reqQuery}\n`;
				if (data.total_rows) {
					logData += `fetched ${data.rows.length} records...\n`;
				} else {
					logData += `response data: ${JSON.stringify(data, null, 2)}\n`;
				}
				couchLogger.info(logData);
			}
		}
		return proxyResData;
	}
}));

//-- test endpoint...
//
app.get("/status", (req, res) => {
	const logData = `${(new Date()).toLocaleString()} - APP\nSERVER STATUS\naddress is: https://${URL}:${SECURE_PORT}/status\nserver time is: ${(new Date()).toLocaleTimeString()}\nsecure: ${JSON.stringify(req.secure)}\n`;

  appLogger.info(logData);
	if (  !runAsService) {
		consoleLogger.info(logData);
	}
	// consoleLogger.info(data);

	res
		.status(200)
		.send(logData);
});

//-- generic 404 - use this if app does not use routing...
//
app.get("*", (req, res) => {
	const logData = `${(new Date()).toLocaleString()} - APP\n404 - ${req.path}: page not found...\n`;
	if (  !runAsService) {
		consoleLogger.error(logData);
	}
  appLogger.error(logData);
	mailLogger.error(logData);

	res
		.status(404)
		.send(logData);
});

secureServer.listen(SECURE_PORT, URL, () => {
  const logData = `${(new Date()).toLocaleString()} - APP\nHTTPS Server is running at ${URL}:${SECURE_PORT}...\n`;

	appLogger.info(logData);
	if (  !runAsService) {
		consoleLogger.info(logData);
	}
	mailLogger.info(logData);
});
