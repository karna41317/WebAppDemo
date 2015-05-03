function indexPageController($scope, $http, $rootScope, $location, $cookies, $timeout) {
	$scope.selectedLevelSlot = 2;
	$rootScope.$watch('isTeacher', function() {
		if ($rootScope.isTeacher) {
			//$rootScope.selectedLevel=4;
			$scope.selectedLevelSlot = 4;
		}
	});
	/*if(!$rootScope.selectedLevel)
		$rootScope.selectedLevel=4;
	$scope.selectedLevel=$rootScope.selectedLevel;*/
	$scope.levels = [];
	// List of all books
	$scope.library = [];
	$scope.openSlotOverlay = function() {
		$scope.openOverlay('#overlay-inAbox');
	};
	$scope.goToBack = function() {
		closeOverlay('#overlay-book');
		$timeout(function() {
			$scope.openOverlay('#overlay-inAbox');
		}, 700);

	}
	$scope.level_books = [];
	$scope.level_books_display = [];
	$scope.updateLevel = function(level) {
		$scope.library = [];
		$scope.selectedLevel = level.id;
		$(".level-selected").html(level.id);
		$('.select-level').slideToggle('fast');
		updatePage($scope, $http);
	};
	$scope.slotupdateLevel = function(level) {
		$scope.selectedLevelSlot = level.id;
		$(".level-selected-slot").html(level.id);
		$('.slotselect-level').slideToggle('fast');
	};
	/*$scope.showAllBooksClick=function(){
			$('.all-toogle').slideToggle('fast');
			$(".more-feat").text( $("more-feat").text() == 'VIsa färre' ? "Visa alla böcker" : "VIsa färre");
	}*/
	$scope.openOverlay = function(olEl) {
		$oLay = $(olEl);

		if ($('#overlay-shade').length == 0)
			$('body').prepend('<div id="overlay-shade"></div>');

		$('#overlay-shade').fadeTo(300, 0.8, function() {
			var props = {
				oLayWidth: $oLay.width(),
				scrTop: $(window).scrollTop(),
				viewPortWidth: $(window).width()
			};

			var leftPos = (props.viewPortWidth - props.oLayWidth) / 2;

			$oLay
				.css({
					visibility: 'visible',
					opacity: 0,
					top: '-=300',
					left: leftPos + 'px'
				})
				.animate({
					top: props.scrTop + 60,
					opacity: 1
				}, 600);
		});
	}
	$scope.changeRandomBook = function() {
		changeRandomBook($scope, $http);

	};

	//fill levels
	for (var i = 2; i < 9; i++) {
		$scope.levels.push({
			id: i,
			label: "Nivå " + i
		});
	}
	//fetch books
	$rootScope.$watch('selectedLevel', function() {
		if ($rootScope.selectedLevel) {
			$scope.selectedLevel = $rootScope.selectedLevel;
			$scope.selectedLevelSlot = $rootScope.selectedLevel;
			$http.get("books/books.json").success(function(response) {
				$scope.allBooks = response;
				if (!$rootScope.isTeacher) {
					$scope.recommandBooks = [];
					$scope.allBooks = response;
					teacherRecommandedBooks($scope);
				}
				updatePage($scope, $http);
			});
		}
	});
	$http.get("books/books.json").success(function(response) {
		$scope.allBooks = response;
		if (!$rootScope.isTeacher) {
			$scope.recommandBooks = [];
			$scope.allBooks = response;
			teacherRecommandedBooks($scope);
		}
		updatePage($scope, $http);
	});
}

// sort level order according to algo
function sort(min, max, current) {
	var out = [];
	out.push(current);
	for (var i = 1; i < (max - min); i++) {
		if (current + i <= max) {
			out.push(current + i);
		}
		if (current - i >= min) {
			out.push(current - i);
		}
	}
	return out;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function changeRandomBook($scope) {
	var random_level = $scope.selectedLevelSlot;
	var random_book = getRandomInt(0, $scope.allBooks[random_level].length - 1);
	$scope.random_book_id = $scope.allBooks[random_level][random_book].bid;
	$scope.random_book_cover = $scope.allBooks[random_level][random_book].cover;
}

function updatePage($scope, $rootScope) {
	//get a random book
	var random_level = getRandomInt(2, 8);
	var random_book = getRandomInt(0, $scope.allBooks[random_level].length - 1);
	$scope.random_book_id = $scope.allBooks[random_level][random_book].bid;
	$scope.random_book_cover = $scope.allBooks[random_level][random_book].cover;

	// Fill library books according to levels code starts
	//var books_order = sort(2, 8, $scope.selectedLevel);
	// Each bookshelf can have max 6 books limit
	var bookshelf = [];
	$scope.library = [];
	var levelSelf = [];
	var count = 0;
	for (var i = 2; i <= 8; i++) {
		if ($scope.selectedLevel !== i) {
			for (var j = 0; j < $scope.allBooks[i].length; j++) {
				bookshelf.push($scope.allBooks[i][j]);
				count++;
				if (count >= 6) {
					count = 0;
					levelSelf.push(bookshelf);
					bookshelf = [];
				}
			}
			if (bookshelf.length > 0) {
				count = 0;
				levelSelf.push(bookshelf);
				bookshelf = [];
			}
			$scope.library.push({
				level: i,
				bookSelf: levelSelf
			});
			levelSelf = [];
		}
	}
	/*if (count < 6 && count != 0)
			$scope.library.push(bookshelf);*/
	// Fill library books according to levels code ends
}

function teacherRecommandedBooks($scope) {
	// Fill teacher recommends level books starts
	var bookshelf = [];
	var count = 0;
	$scope.level_books_display = [];
	if ($scope.selectedLevel) {
		$scope.allBooks[$scope.selectedLevel].forEach(function(book) {
			bookshelf.push(book);
			count++;
			if (count >= 6) {
				count = 0;
				$scope.level_books_display.push(bookshelf);
				bookshelf = [];

			}
		});
		if (bookshelf.length > 0) {
			$scope.level_books_display.push(bookshelf);
		}
	}
}

function closeOverlay(clsovly) {
	$(clsovly).animate({
		top: '-=300',
		opacity: 0
	}, 400, function() {
		$('#overlay-shade').fadeOut(300);
		$(this).css('visibility', 'hidden');
	});
}