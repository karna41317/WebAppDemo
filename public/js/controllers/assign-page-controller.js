function assignPageController($scope, $rootScope, $http, $timeout) {
	$scope.showAssignLevelTab = false;
	$rootScope.$watch('isLoading', function() {
		if (!$rootScope.isLoading) {
			$scope.user = $rootScope.user;
			if ($scope.user) {
				$scope.classes = $scope.user.Subscriptions;
				if ($scope.classes.length === 1)
					$scope.selectedClass = $scope.classes[0];
				updateClass();

			}
		}
	});
	/*	$scope.bookSelected = [];
	$scope.isAllSelectedBooks = false;*/
	/*	$scope.updateSelectedBooks = function(book) {
		if ($("#book-" + book.bid).hasClass("selected")) {
			var index = $scope.bookSelected.indexOf(book);
			$scope.bookSelected.splice(index, 1);
			$("#book-" + book.bid).removeClass("selected");
		} else {
			$scope.bookSelected.push(book);
			$("#book-" + book.bid).addClass("selected");
		}

	}*/
	/*	$scope.checkAllBooks = function() {
		$scope.isAllSelectedBooks = !$scope.isAllSelectedBooks;
		if ($scope.isAllSelectedBooks) {
			$scope.books.forEach(function(book) {
				$("#book-" + book.bid).addClass("selected");
			});
			$scope.bookSelected = angular.copy($scope.books);
		} else {
			$scope.books.forEach(function(book) {
				$("#book-" + book.bid).removeClass("selected");
			})
			$scope.bookSelected = [];
		}
	};*/
	/*
	$scope.assignBooks = function() {
		if ($scope.bookSelected.length) {
			//finding  selected students
			var groupStudents = [];
			angular.forEach($scope.groupStudents, function(groupStudent) {
				if (groupStudent.Selected) {
					groupStudents.push(groupStudent);
				}
			});
			if (groupStudents.length > 0) {
				groupStudents.forEach(function(student) {
					var dataObject = {
						"student": student,
						"books": $scope.bookSelected
					}
					var responsePromise = $http.post("/api/recommendBooksToUser/", dataObject, {});
					responsePromise.success(function(data, status, headers, config) {
						$scope.assignBooksError = "";
						$scope.assignBooksSuccess = "avsatta";
					});
				})

			} else {
				$scope.assignBooksError = "Välj studenter";
				$scope.assignBooksSuccess = "";
			}
		} else {
			$scope.assignBooksError = "Välj Böcker";
			$scope.assignBooksSuccess = "";
		}

	}*/
	$scope.selectedLevelLabel = "Välj nivå";
	$scope.books = [];
	$scope.checkAll = function() {
		if ($scope.selectedAll) {
			$scope.selectedAll = false;
		} else {
			$scope.selectedAll = true;
		}
		$scope.showAssignLevelTab = $scope.selectedAll;
		angular.forEach($scope.groupStudents, function(groupStudent) {
			groupStudent.Selected = $scope.selectedAll;
		});
	};
	$scope.checkSelectedTab = function(groupStudent) {
		groupStudent.Selected = (!groupStudent.Selected) ? true : false;
		var isSelected = false;
		angular.forEach($scope.groupStudents, function(groupStudent) {
			if (groupStudent.Selected) {
				isSelected = true;
			}
		});
		$scope.showAssignLevelTab = isSelected;
	};
	$scope.levels = [];
	$scope.updateLevel = function(level) {
		$scope.selectedLevelLabel = "Böcker i" + level.label;
		$http.get("books/books.json").then(function(response) {
			$scope.books = response.data[level.id];
		});
	};
	$scope.selecteAssignLevel = function(level) {
		$scope.assignSlectedLevel = level;
		assignLevels();
	};

	function assignLevels() {
		//finding  selected students
		var groupStudents = [];
		angular.forEach($scope.groupStudents, function(groupStudent) {
			if (groupStudent.Selected) {
				groupStudents.push(groupStudent);
			}
		});
		if (groupStudents.length > 0) {
			if ($scope.assignSlectedLevel) {

				groupStudents.forEach(function(student) {
					var dataObject = {
						"student": student,
						"level": $scope.assignSlectedLevel.id
					}
					var responsePromise = $http.post("/api/setStudentLevel/", dataObject, {});
					responsePromise.success(function(data, status, headers, config) {
						$scope.startFade = false;
						$scope.assignLevelError = "";
						$scope.assignLevelSuccess = "Nivå vald";
						$timeout(function() {
							$scope.startFade = true;
						}, 1000)
					});
					responsePromise.error(function(data, status, headers, config) {});
				})
			} else {
				$scope.assignLevelError = "välj nivå";
				$scope.assignLevelSuccess = "";
			}
		} else {
			$scope.assignLevelError = "väljer studenten";
			$scope.assignLevelSuccess = "";
		}


		//if($scope.groupStudents)

	}
	$scope.updateClass = function() {
		updateClass();
	}

	function updateClass() {
		$scope.selectedAll = false;
		$scope.groupStudents = [];
		if ($scope.selectedClass) {
			$http.get("/api/getGroupMembers/" + $scope.selectedClass.GroupUUID + "/ST-mdZhFjBGvK98yN2UDcr3RfuLxE6WJ1gPn4kHtCS7").
			success(function(data, status, headers, config) {
				data.Members.forEach(function(member) {
					if (member.RoleId == 2) {
						$scope.groupStudents.push({
							UserUUID: member.UserUUID,
							name: member.FirstName + " " + member.LastName
						});
					}
				})
			});
		}
	};

	for (var i = 2; i < 9; i++) {
		$scope.levels.push({
			id: i,
			label: "Nivå " + i
		});
	}
}