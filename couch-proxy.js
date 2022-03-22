//-- COUCH-PROXY.JS - production app server
//			serve angular app at https://server_url:secure_server_port/ to public folder
//			proxy https://server_url:secure_server_port/ng-app/couch/whatever to couchdb_url:couchdb_port/whatever
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

//-- util funcs to build log data & write logs...
//
const buildReqInfo = (caller, data, req) => {
	reqMethod = req.method;
	reqPath = req.url.split('?')[0];
	reqQuery = req.url.split('?')[1] ? req.url.split('?')[1] : 'none...';
	reqData = Object.keys(data).length != 0 ? data : 'none...';
	logData = `${(new Date()).toLocaleString()} - ${URL}/${caller.toUpperCase()}/COUCH\n${reqMethod} ${reqPath}\n`;
}

const buildLogData = (resdata) => {
	if (resdata != '') {
		const data = JSON.parse(resdata);
		if (data.error) {
			logData += `ERROR: ${data.error}, ${data.reason}\n`;
			if ( !runAsService) {
				consoleLogger.error(logData);
			}
			appLogger.error(logData);
			couchLogger.error(logData);
			mailLogger.error(logData);
		} else {
			if ( !runAsService) {
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
}

//-- create the app & server...
//
const app = express();
const secureServer = https.createServer({key: privkey, cert: cert}, app);

//-- host angular apps...
//
app.use(express.static('public'));		// serve ng-root-app https://URL/
app.use('/ng-app1', serveStatic('ng-app1'));	// serve app1 at https://URL/ng-app1/
app.use('/ng-app2', serveStatic('ng-app2'));	// serve app2 at https://URL/ng-app2/
app.use('/test', serveStatic('test'));		// testing playground at https://URL/test/

//-- proxy /couch to couchdb server for all apps...
//
app.use('/couch', proxy(COUCH_URL + ':' + COUCH_PORT, {

	//-- log request, query, data...
	//
	proxyReqBodyDecorator: function(bodyContent, srcReq) {
		buildReqInfo('ng-root-app', bodyContent, srcReq);
		return bodyContent;
	},

	//-- log response...
	//
	userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
		buildLogData(proxyResData);
		return proxyResData;
	}
}));

app.use('/ng-app1/couch', proxy(COUCH_URL + ':' + COUCH_PORT, {
	proxyReqBodyDecorator: function(bodyContent, srcReq) {
		buildReqInfo('ng-app1', bodyContent, srcReq);
    return bodyContent;
  },
	userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
		buildLogData(proxyResData);
		return proxyResData;
	}
}));

app.use('/ng-app2/couch', proxy(COUCH_URL + ':' + COUCH_PORT, {
	proxyReqBodyDecorator: function(bodyContent, srcReq) {
		buildReqInfo('ng-app2', bodyContent, srcReq);
    return bodyContent;
  },
	userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
		buildLogData(proxyResData);
		return proxyResData;
	}
}));

app.use('/test/couch', proxy(COUCH_URL + ':' + COUCH_PORT, {
	proxyReqBodyDecorator: function(bodyContent, srcReq) {
		buildReqInfo('test', bodyContent, srcReq);
    return bodyContent;
  },
	userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
		buildLogData(proxyResData);
		return proxyResData;
	}
}));

//-- quick test endpoint...
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
