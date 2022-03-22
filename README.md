# couch-proxy
## express server daemon to host angular apps & proxy couchdb calls locally

This project arose as a way to run a collection of angular apps using CouchDB as a backend. We did not want the data server exposed to the network. The daemon needed to report calls to CouchDB and related errors, both to file logs and email. The project inculdes a couch-proxy.service file for running with systemd.

USAGE:

	clone the repo, then npm init
	
	add static apps by adding:
	
		app.use('/myapp', serveStatic('myapp'));
	
	to the hosted apps section and:
	
		app.use('/myapp/couch', proxy(COUCH_URL + ':' + COUCH_PORT, {
			proxyReqBodyDecorator: function(bodyContent, srcReq) {
				buildReqInfo('myapp', bodyContent, srcReq);
				return bodyContent;
			},
			userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
				buildLogData(proxyResData);
				return proxyResData;
			}
		}));
	
	to the couch proxy section.

This daemon is meant for angular apps, but any app wanting to access CouchDB would work. All calls to CouchDB will need 'couch/ pre-pended:

	host = 'https://myserver/myapp/couch/';

in Angular (where http = HttpClient):
	
	http.get(host + dbname + '/_all_docs?incluce_docs=true&limit=20'); //-- or whatever...

and within index.html, set:

	<base href="/myapp/">
	
in Angular:

	ng build myapp --base-href /myapp/
	
or within the myapp section of angular.json:
		
	"architect": {
		"build": {
			"builder": "@angular-devkit/build-angular:browser",
			"options": {
				"baseHref": "/myapp/",

### Please feel free to use this daemon and modify it any way for your own apps...	
