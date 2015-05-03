function followPageController($scope, $http, $rootScope) {
	$scope.user = $rootScope.user;
	/*	if($scope.user){
		$scope.classes = $scope.user.Subscriptions;
	}*/
	if ($scope.user) {
		$scope.classes = $scope.user.Subscriptions;
		if ($scope.classes.length === 1)
			$scope.selectedClass = $scope.classes[0];
		updateClass();

	}
	$scope.BooksToShow = [];
	$scope.checkAll = function() {
		if ($scope.selectedAll) {
			$scope.selectedAll = false;
		} else {
			$scope.selectedAll = true;
		}
		angular.forEach($scope.groupStudents, function(groupStudent) {
			groupStudent.Selected = $scope.selectedAll;
		});
	};
	$scope.selectedStudentClick = function(student) {
		$scope.BooksToShow = []
		$scope.isStudentSelected = false;
		if ($scope.selectedStudent == student) {
			student.selected = true;
			$scope.isStudentSelected = false;
			delete $scope.selectedStudent;
		} else {
			angular.forEach($scope.groupStudents, function(groupStudent) {
				if (groupStudent.Selected && (student != groupStudent))
					groupStudent.Selected = false;
			});
			student.selected = true;
			$scope.isStudentSelected = true;
			$("#loader-div").show();
			$("#loaded-div").hide();
			$http.get("/api/getStudentLevel/" + student.UserUUID, {}).success(function(data, status, headers, config) {
				var selectedLevel;
				if (data.length > 0) {
					selectedLevel = data[0].result.score.raw;
				} else {
					selectedLevel = 2;
				}
				$scope.selectedStudent = student;
				$scope.selectedStudent.level = selectedLevel;
			});
			$http.get("/api/getCurrentPageOfBooksUsers/" + student.UserUUID, {}).success(function(data, status, headers, config) {
				loadBooksReadByUser($scope, $rootScope, $http, data);
			});
		}
	}
	/*	$scope.updateClass = function () {
		$scope.selectedAll = false;
		$scope.groupStudents = [];
		if ($scope.selectedClass) {
			$http.get("/api/getGroupMembers/"+$scope.selectedClass.GroupUUID+"/ST-mdZhFjBGvK98yN2UDcr3RfuLxE6WJ1gPn4kHtCS7").
				success(function(data, status, headers, config) {
					data.Members.forEach(function(member){
						if(member.RoleId==2){
							$scope.groupStudents.push({
								UserUUID:member.UserUUID,
								name:member.FirstName+" "+member.LastName
							});
						}
					})
				});
		}
	};*/


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


}

function loadBooksReadByUser($scope, $rootScope, $http, data) {
	$scope.readBooks = [];
	$http.get("books/books.json").success(function(booksArray) {
		var books = [];
		for (var i = 2; i < 9; i++) {
			for (var j = 0; j < booksArray[i].length; j++) {
				books.push(booksArray[i][j]);
			}
		}
		var BooksRead = {};
		data.forEach(function(node) {
			var tempId = node.object.id;
			if (tempId) {
				var index = (tempId + "").lastIndexOf('/');
				if (index != -1) {
					var bookId = tempId.substring(index + 1);
					if (BooksRead[bookId]) {
						if (BooksRead[bookId].raw < node.result.score.raw)
							BooksRead[bookId] = node.result.score;
					} else
						BooksRead[bookId] = node.result.score;
				}
			}
		});
		//prepare books to display
		var BooksToShow = [];
		books.forEach(function(book) {
			var score = BooksRead[book.uuid];
			if (score) {
				book.score = parseInt(score.raw * 100 / score.max);
				BooksToShow.push(book);
			}
		});
		$scope.BooksToShow = BooksToShow;
		$("#loader-div").hide();
		$("#loaded-div").show();
		$scope.totalBooksRead = BooksToShow.length;
		var completedBooks = 0;
		BooksToShow.forEach(function(book) {
			if (book.score == 100)
				completedBooks++;
		});
		$scope.completedBooks = completedBooks;
	});
}