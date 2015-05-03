var request = require("request");
var tincanServer = "https://loutv.liber.se";
module.exports = function(app) {
	app.post('/api/setStudentLevel/', function(req, res) {
		var level = req.body.level;
		var student = req.body.student;
		var statementData = {
			"version": "1.0.0",
			"actor": {
				"objectType": "Agent",
				"account": {
					"homePage": "http://liberonline.se/LiberOnline",
					"name": student.UserUUID,
					"user name": student.name
				}
			},
			"verb": {
				"id": "http://liberonline.se/verbs/mastered"
			},
			"object": {
				"objectType": "Activity",
				"id": "http://liberonline.se/activities/StjarnsvenskaLevel"
			},
			"result": {
				"score": {
					"raw": level
				}
			},
			"timestamp": new Date().getTime(),
			"stored": new Date().getTime(),
			"authority": {
				"objectType": "Agent",
				"account": {
					"homePage": "http://liberonline.se/LiberOnline",
					"name": "unknown"
				}
			}
		};
		request.post({
			url: tincanServer + "/TincanAPI/api/Statement",
			form: statementData
		}, function(error, response, body, one) {
			res.send(200, {
				"success": "statement posted"
			});
		});
	});
	app.get('/api/getStudentLevel/:userid', function(req, res) {
		var url = tincanServer + '/TincanAPI/api/StatementQuery/' + "?agent=" + JSON.stringify({
			"objectType": "Agent",
			"account": {
				homePage: "http://liberonline.se/LiberOnline",
				"name": req.params.userid
			}
		}) + "&verb=http://liberonline.se/verbs/mastered&object=http://liberonline.se/activities/StjarnsvenskaLevel&limit=1";
		request.get(url, {
			headers: {}
		}, function(error, response, body, one) {
			res.send(body);
		});
	});

	//recommannd books

	app.post('/api/recommendBooksToUser/', function(req, res) {
		var books = req.body.books;
		var student = req.body.student;
		books.forEach(function(book) {

			var statementData = {
				"version": "1.0.0",
				"actor": {
					"objectType": "Agent",
					"account": {
						"homePage": "http://liberonline.se/LiberOnline",
						"name": student.UserUUID,
						"user name": student.name
					}
				},
				"verb": {
					"id": "http://liberonline.se/verbs/received"
				},
				"object": {
					"id": "http://liberonline.se/activities/StjarnsvenskaBook/[ISBN+ID]",
					"account": {
						"homePage": "http://liberonline.se/LiberOnline",
						"name": "978-91-47-10199-3b1",
						"bookid": "18"
					}
				},
				"result": {
					"score": {
						"raw": book.bid
					}
				},
				"timestamp": new Date().getTime(),
				"stored": new Date().getTime()
			};
			request.post({
				url: tincanServer + "/TincanAPI/api/Statement",
				form: statementData
			}, function(error, response, body, one) {
				res.send(200, {
					"success": "statement posted"
				});
			});
		})
	});
	app.get('/api/getRecommendBooks/:userid', function(req, res) {
		var url = tincanServer + '/TincanAPI/api/StatementQuery/' + "?agent=" + JSON.stringify({
			"objectType": "Agent",
			"name": req.params.userid
		}) + "&verb=http://liberonline.se/verbs/received";
		request.get(url, {
			headers: {}
		}, function(error, response, body, one) {
			res.send(body);
		});
	});



	app.post('/api/setCurrentPageStudent/', function(req, res) {
		var score = req.body.score;
		var UserUUID = req.body.student;
		var bookid = req.body.bookid;
		var statementData = {
			"version": "1.0.0",
			"actor": {
				"objectType": "Agent",
				"account": {
					"homePage": "http://liberonline.se/LiberOnline",
					"name": UserUUID
				}
			},
			"verb": {
				"id": "http://liberonline.se/verbs/opened"
			},

			"object": {
				"objectType": "Activity",
				"id": "http://liberonline.se/activities/StjarnsvenskaBook/" + bookid
			},
			"result": {
				"score": score
			},
			"timestamp": new Date().getTime(),
			"stored": new Date().getTime()
		};
		request.post({
			url: tincanServer + "/TincanAPI/api/Statement",
			form: statementData
		}, function(error, response, body, one) {
			res.send(200, {
				"success": "statement posted"
			});
		});
	});
	app.get('/api/getCurrentPageOfBooksUsers/:userid', function(req, res) {
		var url = tincanServer + '/TincanAPI/api/StatementQuery/' + "?agent=" + JSON.stringify({
			"objectType": "Agent",
			"account": {
				homePage: "http://liberonline.se/LiberOnline",
				"name": req.params.userid
			}
		}) + "&verb=http://liberonline.se/verbs/opened";
		request.get(url, {
			headers: {}
		}, function(error, response, body, one) {
			var result = [];
			ret = JSON.parse(body);
			ret.forEach(function(node) {
				var page = {};
				page.object = node.object;
				page.result = node.result;
				result.push(page);
			});
			res.send(result);
		});
	});
	app.get('/api/getCurrentPageOfBookForUser/:userid/:bookid', function(req, res) {
		if (!req.params.bookid)
			res.send(200, []);
		var url = tincanServer + '/TincanAPI/api/StatementQuery/' + "?agent=" + JSON.stringify({
			"objectType": "Agent",
			"account": {
				homePage: "http://liberonline.se/LiberOnline",
				"name": req.params.userid
			}
		}) + "&verb=http://liberonline.se/verbs/opened&activity=http://liberonline.se/activities/StjarnsvenskaBook/" + req.params.bookid + "&limit=1";
		request.get(url, {
			headers: {}
		}, function(error, response, body, one) {
			res.send(body);
		});
	});
	//get last book read for user
	app.get('/api/getLastBookRead/:userid', function(req, res) {
		if (!req.params.userid)
			res.send(200, []);
		var url = tincanServer + '/TincanAPI/api/StatementQuery/' + "?agent=" + JSON.stringify({
			"objectType": "Agent",
			"account": {
				homePage: "http://liberonline.se/LiberOnline",
				"name": req.params.userid
			}
		}) + "&verb=http://liberonline.se/verbs/opened&limit=1";
		request.get(url, {
			headers: {}
		}, function(error, response, body, one) {
			res.send(body);
		});
	});
	app.post('/api/SetBookRatingForUser/', function(req, res) {
		var uuid = req.body.uuid;
		var bookid = req.body.bookid;
		var rating = req.body.rating;
		var groupId = req.body.groupId;
		if (!uuid || !bookid || !rating || !groupId) {
			res.send(200, {
				"error": "Send all parameters."
			});
		}
		var statement = {
			"actor": {
				"objectType": "Agent",
				"account": {
					"homePage": "http://liberonline.se/LiberOnline",
					"name": uuid
				}
			},
			"verb": {
				"id": "http://liberonline.se/verbs/completed"
			},
			"object": {
				"objectType": "Activity",
				"id": "http://liberonline.se/activities/StjarnsvenskaBook/" + bookid
			},
			"result": {
				"score": {
					"raw": rating,
					"max": 5
				}
			},
			"context": {
				"team": {
					"objectType": "Group",
					"account": {
						"name": groupId
					}
				}
			}
		};
		request.post({
			url: tincanServer + "/TincanAPI/api/Statement",
			form: statement
		}, function(error, response, body) {
			if (error) {
				res.send(200, {
					"error": "statement Error"
				});
			} else {
				res.send(200, {
					"success": "statement posted"
				});
			}
		});
	});
	app.get('/api/getBookRatingForUser/:uuid/:bookid', function(req, res) {
		var uuid = req.params.uuid;
		var bookid = req.params.bookid;
		if (!uuid || !bookid) {
			res.send(200, {});
		}
		var statement = {
			"actor": {
				"objectType": "Agent",
				"account": {
					"homePage": "http://liberonline.se/LiberOnline",
					"name": uuid
				}
			},
			"verb": "http://liberonline.se/verbs/completed",
			"activity": "http://liberonline.se/activities/StjarnsvenskaBook/" + bookid,
			"limit": 1
		};
		request.post({
			url: tincanServer + "/TincanAPI/api/StatementQuery",
			form: statement
		}, function(error, response, body) {
			if (error) {
				res.send(200, {});
			} else {
				ret = JSON.parse(body);
				try {
					res.send(200, {
						"rating": ret[0].result.score.raw.toString()
					});
				} catch (err) {
					res.send(200, {});
				}
			}
		});
	});
	app.get('/api/GetLatestRatedBooksForUser/:uuid', function(req, res) {
		var uuid = req.params.uuid;
		var limit = req.params.limit;
		if (!uuid) {
			res.send(200, {});
		}
		var statement = {
			"actor": {
				"objectType": "Agent",
				"account": {
					"homePage": "http://liberonline.se/LiberOnline",
					"name": uuid
				}
			},
			"verb": "http://liberonline.se/verbs/completed",
			"limit": 9999
		};
		request.post({
			url: tincanServer + "/TincanAPI/api/StatementQuery",
			form: statement
		}, function(error, response, body) {
			if (error) {
				res.send(200, {});
			} else {
				ret = JSON.parse(body);
				var list = [];
				var result = [];
				var book_object;
				var rating;
				if (ret.length > 0) {
					for (i = 0; i < ret.length; i++) {
						try {
							book_object = ret[i].object.id;
							rating = ret[i].result.score.raw.toString();
						} catch (e) {
							book_object = null;
							rating = 0;
						}
						if (book_object && rating) {
							var book_id = book_object.substring("http://liberonline.se/activities/StjarnsvenskaBook/".length);
							if (list.indexOf(book_id) < 0) {
								list.push(book_id);
								result.push({
									book_id: book_id,
									rating: rating
								});
							}
						}
					}
					//we use do sorting on client end based on the logic we need
					//result.sort(function(a, b) {return b[1] - a[1]});
				}
				res.send(200, {
					result: result
				});
			}
		});
	});
	app.get('/api/getTotalTopBookList/', function(req, res) {
		var statement = {
			"verb": "http://liberonline.se/verbs/completed",
			"limit": 9999
		};
		request.post({
			url: tincanServer + "/TincanAPI/api/StatementQuery",
			form: statement
		}, function(error, response, body) {
			if (error) {
				res.send(error, {
					result: []
				});
			} else {
				var ret = JSON.parse(body);
				var list = [];
				var result = {};
				var book_object;
				var rating;
				if (ret.length > 0) {
					for (i = 0; i < ret.length; i++) {
						try {
							book_object = ret[i].object.id;
							rating = ret[i].result.score.raw.toString();
						} catch (e) {
							book_object = null;
							rating = 0;
						}
						if (book_object && rating) {
							var book_id = book_object.substring("http://liberonline.se/activities/StjarnsvenskaBook/".length);
							if (list.indexOf(book_id) < 0) {
								list.push(book_id);
								var rat = [];
								rat.push(rating);
								result[book_id] = rat;
							} else {
								//
								var oldRat = result[book_id];
								oldRat.push(rating);
								result[book_id] = oldRat;
							}
						}
					}
					var topBooks = [];
					for (var key in result) {
						var attrName = key;
						var attrValue = result[key];
						var count = 0;
						var total = 0;
						attrValue.forEach(function(attr) {
							count++;
							total = total + parseInt(attr);
						});
						topBooks.push({
							book_id: key,
							rating: parseInt(total / count)
						});
					}
					//result.sort(function(a, b) {return b[1] - a[1]});
				}
				res.send(200, {
					result: topBooks
				});
			}
		});
	});
	app.get('/api/getTotalClassTopBookList/:groupId', function(req, res) {
		var groupId = req.params.groupId;
		if (!groupId) {
			res.json([]);
		} else {
			var statement = {
				"team": groupId,
				"verb": "http://liberonline.se/verbs/completed",
				"limit": 9999
			};
			request.post({
				url: tincanServer + "/TincanAPI/api/StatementTeamQuery",
				form: statement
			}, function(error, response, body) {
				if (error) {
					res.send(error, {
						result: []
					});
				} else {
					var ret = JSON.parse(body);
					var list = [];
					var result = {};
					var book_object;
					var rating;
					if (ret.length > 0) {
						for (i = 0; i < ret.length; i++) {
							try {
								book_object = ret[i].object.id;
								rating = ret[i].result.score.raw.toString();
							} catch (e) {
								book_object = null;
								rating = 0;
							}
							if (book_object && rating) {
								var book_id = book_object.substring("http://liberonline.se/activities/StjarnsvenskaBook/".length);
								if (list.indexOf(book_id) < 0) {
									list.push(book_id);
									var rat = [];
									rat.push(rating);
									result[book_id] = rat;
								} else {
									//
									var oldRat = result[book_id];
									oldRat.push(rating);
									result[book_id] = oldRat;
								}
							}
						}
						var topBooks = [];
						for (var key in result) {
							var attrName = key;
							var attrValue = result[key];
							var count = 0;
							var total = 0;
							attrValue.forEach(function(attr) {
								count++;
								total = total + parseInt(attr);
							});
							topBooks.push({
								book_id: key,
								rating: parseInt(total / count)
							});
						}
						//result.sort(function(a, b) {return b[1] - a[1]});
					}
					res.send(200, {
						result: topBooks
					});
				}
			});
		}

	});
}