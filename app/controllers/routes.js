// we will define all routes here if required.
module.exports = function(app) {
	app.get('/', function (req, res) {
		res.render('index.html');
	});
	app.get('/partials/:name', function (req, res) {
		res.render('partials/' + req.params.name + '.html');
	});
}