function loginPageController($scope, $rootScope, $http, $location, $cookies) {
	$scope.submitLogin = function() {
		var responsePromise = $http.get("/api/getUser/" + $scope.userid + "/" + $scope.ticket, {});
		responsePromise.success(function(dataFromServer, status, headers, config) {
			if (dataFromServer.User && dataFromServer.User.Subscriptions[0]) {
				if (dataFromServer.User.Subscriptions[0].RoleId) {
					$cookies.userid = $scope.userid;
					$cookies.userTicket = $scope.ticket;
					$cookies.GroupUUID = dataFromServer.User.Subscriptions[0].GroupUUID;
					$rootScope.user = dataFromServer.User;
					$rootScope.isLoggedin = true;
					if (dataFromServer.User.Subscriptions[0].RoleId == 1) {
						//teacher
						$rootScope.isTeacher = true;
						$location.url('/home');
					} else if (dataFromServer.User.Subscriptions[0].RoleId == 2) {
						//student
						$http.get("/api/getStudentLevel/" + $scope.userid, {}).success(function(data, status, headers, config) {
							if (data.length > 0) {
								$rootScope.selectedLevel = data[0].result.score.raw;
							} else {
								//$rootScope.selectedLevel = 2;
							}
							$rootScope.isTeacher = false;
							$location.url('/home');
						});
					} else
						$scope.loginError = "Wrong user id, token";
				} else
					$scope.loginError = "Wrong user id, token";
			} else
				$scope.loginError = "Wrong user id, token";
		});
		responsePromise.error(function(data, status, headers, config) {
			$scope.error = data.error;
		});
	}

	$scope.loginwithuser = function(userid, ticket) {

		$rootScope.isLoading = true;
		var responsePromise = $http.get("/api/getUser/" + userid + "/" + ticket, {});
		responsePromise.success(function(dataFromServer, status, headers, config) {
			if (dataFromServer.User && dataFromServer.User.Subscriptions[0]) {
				if (dataFromServer.User.Subscriptions[0].RoleId) {

					$cookies.userid = userid;
					$cookies.userTicket = ticket;
					$cookies.GroupUUID = dataFromServer.User.Subscriptions[0].GroupUUID;
					$rootScope.user = dataFromServer.User;
					$rootScope.isLoggedin = true;
					if (dataFromServer.User.Subscriptions[0].RoleId == 1) {
						//teacher
						$rootScope.isLoading = false;
						$rootScope.isTeacher = true;
						//$location.url('/home');
					} else if (dataFromServer.User.Subscriptions[0].RoleId == 2) {
						//student
						$http.get("/api/getStudentLevel/" + dataFromServer.User.UserUUID, {}).success(function(data, status, headers, config) {
							if (data.length > 0) {
								$rootScope.selectedLevel = data[0].result.score.raw;
							} else {
								//$rootScope.selectedLevel = 2;
							}
							$rootScope.isTeacher = false;
							$rootScope.isLoading = false;
							//$location.url('/home');
						});
					} else
						$scope.loginError = "Wrong user id, token";
				} else
					$scope.loginError = "Wrong user id, token";
			} else
				$scope.loginError = "Wrong user id, token";
		});
		responsePromise.error(function(data, status, headers, config) {
			$scope.error = data.error;
		});


	}

};