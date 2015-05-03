// set up ======================================================================
// get all the tools we need
var express  	= require('express');
var app      	= express();
var port     	= process.env.PORT || 9090;
var bodyParser = require('body-parser');
//file system
var fs=require('fs');
//right now i made all pages as public page.
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser()); // get information from html forms
app.use(bodyParser.json()); 									// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

// routes ======================================================================
var controller_loc = __dirname + '/app/controllers';
var controller_files = fs.readdirSync(controller_loc);
//load all files inside controllers.
controller_files.forEach(function(file) {
	return (require(controller_loc + '/' + file))(app);
});
// launch ======================================================================
app.listen(port);
console.log('The magic happens on port : ' + port);