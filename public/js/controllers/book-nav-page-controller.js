function bookNavPageController($scope, $http, $location, $templateCache) {
	if ($location.search().id == "undefined" || $location.search().id == null) {
		$location.url("/");
	}
	$scope.bookid = $location.search().id;
	$http.get("books/books.json").success(function(response) {
		for (var i = 2; i < 9; i++) {
			for (var j = 0; j < response[i].length; j++) {
				if (response[i][j].bid == $scope.bookid) {
					$scope.cover = response[i][j].cover;
				}
			}

		}
	});
	$scope.goToHome = function() {
		$templateCache.removeAll();
		$location.url("/");
	}
}