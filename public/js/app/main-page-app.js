var app = angular.module('bookSelfApp', ['ngRoute', 'ngCookies', 'angulartics', 'angulartics.google.tagmanager']);
//This configures the routes and associates each route with a view and a controller
app.config(function($routeProvider, $analyticsProvider) {
	$routeProvider
		.when('/home', {
			controller: 'indexPageController',
			templateUrl: '/partials/home'
		})
		.when('/', {
			controller: 'loginPageController',
			templateUrl: '/partials/login'
		})
		.when('/mypages', {
			controller: 'myPageController',
			templateUrl: '/partials/mypages'
		})
		.when('/book-nav', {
			controller: 'bookNavPageController',
			templateUrl: '/partials/book-nav'
		})
		.when('/book', {
			controller: 'bookPageController',
			templateUrl: '/partials/book'
		})
		.when('/assign', {
			controller: 'assignPageController',
			templateUrl: '/partials/assign'
		})
		.when('/follow', {
			controller: 'followPageController',
			templateUrl: '/partials/follow'
		})
		.when('/about', {
			controller: 'aboutPageController',
			templateUrl: '/partials/about'
		})
		.when('/kontakt', {
			controller: 'aboutPageController',
			templateUrl: '/partials/kontakt'
		})
		.when('/copyrights', {
			controller: 'aboutPageController',
			templateUrl: '/partials/copyrights'
		})
		.when('/teacher', {
			controller: 'aboutPageController',
			templateUrl: '/partials/teacher'
		})
		.otherwise({
			redirectTo: '/'
		});

}).
run(function($rootScope, $location, $http, $cookies) {
	$rootScope.isActive = function(viewLocation) {
		return $location.path().indexOf(viewLocation) == 0;
	};
	$rootScope.isLoading = true;
	var userid = $cookies.userid;
	var userTicket = $cookies.userTicket;
	//check if user logged in
	if (userid && userTicket) {
		//we have user id and token. get user
		var responsePromise = $http.get("/api/getUser/" + userid + "/" + userTicket, {}).success(function(dataFromServer, status, headers, config) {
			if (dataFromServer.User && dataFromServer.User.Subscriptions[0]) {
				if (dataFromServer.User.Subscriptions[0].RoleId) {
					$rootScope.user = dataFromServer.User;
					$cookies.GroupUUID = dataFromServer.User.Subscriptions[0].GroupUUID;
					if (dataFromServer.User.Subscriptions[0].RoleId == 2) {
						//user found load level
						$http.get("/api/getStudentLevel/" + userid, {}).success(function(data, status, headers, config) {
							if (data.length > 0) {
								$rootScope.selectedLevel = data[0].result.score.raw;
							}
							/* else {
										$rootScope.selectedLevel = 2;
									}*/
							$rootScope.isLoggedin = true;
							$rootScope.isTeacher = false;
							$rootScope.isLoading = false;
						});
					} else if (dataFromServer.User.Subscriptions[0].RoleId == 1) {
						$rootScope.classes = $rootScope.user.Subscriptions;
						$rootScope.isLoggedin = true;
						$rootScope.isTeacher = true;
						$rootScope.isLoading = false;
					}
				}
			}
		}).error(function(data, status, headers, config) {
			$rootScope.isLoading = false;
		});
	} else {
		$rootScope.isLoading = false;
		$rootScope.isLoggedin = false;
	}
	$rootScope.loadCorrectUrl = function() {
		if (!$rootScope.isLoading) {
			//page loaded
			if ($rootScope.isLoggedin && $rootScope.user) {
				if ($rootScope.isTeacher) {
					if ($location.path() === '/mypages' || $location.path() === '/')
						$location.url('/home');
				} else {
					if ($location.path() !== '/mypages' && $location.path() !== '/book-nav' && $location.path() !== '/kontakt' && $location.path() !== '/copyrights')
						$location.url('/home');
				}
			} else {
				if ($location.path() !== '/about') {
					$location.url('/');
				}
			}
		}
	}
	$rootScope.$watch('isLoading', function() {
		$rootScope.loadCorrectUrl();
	});

	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		$rootScope.loadCorrectUrl();
	});

	$rootScope.logout = function() {
		//logout
		delete $cookies.userid;
		delete $cookies.userTicket;
		$rootScope.user = "";
		$rootScope.isLoggedin = false;
		$location.url('/');
	}
});
app.directive('jslot',
	function() {
		return {
			link: function(scope, element, attrs) {
				element.jSlots({
					number: 3,
					winnerNumber: 3,
					spinner: '#playFancy',
					easing: 'easeOutSine',
					time: 7000,
					loops: 6,
					onStart: function() {
						$('.slot').removeClass('winner');
					},
					onEnd: function(finalNumbers) {
						scope.openOverlay('#overlay-book');
						$('#overlay-inAbox').animate({
							top: '-=300',
							opacity: 0
						}, 400, function() {
							$('#overlay-shade').fadeOut(300);
							$(this).css('visibility', 'hidden');
						});
					}
				});
			}
		};
	});

app.filter('range', function() {
	return function(input, total) {
		total = parseInt(total);
		for (var i = 0; i < total; i++)
			input.push(i);
		return input;
	};
});