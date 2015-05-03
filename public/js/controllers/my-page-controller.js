function myPageController($scope,$http,$window,$cookies,$q) {
	$scope.pageLoading=true;
	$scope.lastBookRead={};
	$scope.getNumber = function(num) {
		return new Array(num);
	}
  $scope.readBook=function(lastBookRead,resumePageNumber){
    $cookies.bookid =lastBookRead.bid;
    $window.location.href = '/book.html#/book/'+resumePageNumber;
  }
	if($cookies.userid){var deferred = $q.defer();
		var urlCalls = [];
		urlCalls.push($http.get("books/books.json"));
		urlCalls.push($http.get("/api/getLastBookRead/" +$cookies.userid));
		urlCalls.push($http.get("/api/GetLatestRatedBooksForUser/" +$cookies.userid));
		urlCalls.push($http.get("/api/getTotalTopBookList/", {}));
    urlCalls.push($http.get("/api/getTotalClassTopBookList/" +$cookies.GroupUUID));
		var deferred = $q.defer();
		$q.all(urlCalls).then(
				function(results) {
					deferred.resolve(JSON.stringify(results));
					//books array in first object
					var booksArray=results[0].data;
					var books=[];
					for(var i=2;i<9;i++){
						for (var j = 0; j < booksArray[i].length; j++) {
							books.push(booksArray[i][j]);
						}
					}
					//second containts last book read
					var data=results[1].data;
					if(data.length>0){
						var tempId=data[0].object.id;
						var index=(tempId+"").lastIndexOf('/');
						if(index!=-1){
							var bookId=tempId.substring(index+1);
							books.forEach(function(book){
								if(bookId==book.uuid){
									$scope.lastBookRead=book;
									var score=data[0].result.score;
									$scope.resumepagenumber = score.raw;
									if(score){
										$scope.lastBookRead.score=parseInt(score.raw*100/score.max);
									}
								}
							});
						}
					}

					//third contains last reads of users
					var latestBookData=results[2].data;
					var latestBooks=[];
					latestBookData.result.forEach(function(bookread){
						books.forEach(function(book){
							if(book.uuid==bookread.book_id){
								var latestBook=book;
								latestBook.rating=bookread.rating;
								latestBooks.push(latestBook);
							}
						});
					});
					$scope.latestBooks=latestBooks.slice(0,6);
					////prepare data for latest book reads sorted
					// sort the list
					var sortedResults=latestBooks.sort(function(a, b) {
						return b.rating - a.rating;
					});
					$scope.sortedBooks=sortedResults.slice(0,8);

					//Fourth contains top books
					var TopBooks=[];
					var topBooksData=results[3].data;
					topBooksData.result.forEach(function(bookread){
						books.forEach(function(book){
							if(book.uuid==bookread.book_id){
								var topBook=book;
								topBook.rating=bookread.rating;
								TopBooks.push(topBook);
							}
						});
					});
					//sort top books
					var TopBooks=TopBooks.sort(function(a, b) {
						return b.rating - a.rating;
					});
					$scope.TopBooks=TopBooks.slice(0,8);
          //
          //Class top list
          var topClassBooksData=results[4].data;
          var topBookClass=[]
          topClassBooksData.result.forEach(function(bookread){
            books.forEach(function(book){
              if(book.uuid==bookread.book_id){
                var topBook=book;
                topBook.rating=bookread.rating;
                topBookClass.push(topBook);
              }
            });
          });
          //sort top books
          var topBookClass=topBookClass.sort(function(a, b) {
            return b.rating - a.rating;
          });
          $scope.TopBooksClass=topBookClass.slice(0,8);
					//show page
					$scope.pageLoading=false;
				},
				function(errors) {
					deferred.reject(errors);
				});
	}
};
