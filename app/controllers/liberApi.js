// we will define all routes here if required.
var request = require("request");
var externalServer="https://loutv.liber.se";

// PWA: 2015-03-10: Changed to GetUserV2 during test
module.exports = function (app) {
	app.get('/api/getUser/:userid/:ticket', function (req, res) {
		request.get(externalServer+'/LiberOnlineAPI/Api/GetUserV2/'+req.params.userid+'/?ticket='+req.params.ticket, {
			headers: { }
		}, function (error, response, body, one) {
			var contents = (JSON.parse(body));
			res.send(contents);
		});
	});
	app.get('/api/getGroupMembers/:groupid/:ticket', function (req, res) {
		request.get(externalServer+'/LiberOnlineAPI/Api/GetGroupMembers/'+req.params.groupid+'/?ticket='+req.params.ticket, {
			headers: { }
		}, function (error, response, body, one) {
			var contents = (JSON.parse(body));
			res.send(contents);
		});
	});
}