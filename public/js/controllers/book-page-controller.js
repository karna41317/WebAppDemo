var app = angular.module('bookApp', ['ngCookies']);
var canvases = Array();
var book = null;
var drawed = false;
var player = null;
var userTriggered = false;

function loadFont(fontName, filePath) {
	var openStyleTag = '<style type="text/css" id="font-embed">\n';
	var definedFont = '@font-face {\n' +
		'\tfont-family: "' + fontName + '";\n' +
		'\tsrc: url("' + filePath + '");\n' +
		'}';
	var closeStyleTag = '</style>';
	if ($('#font-embed').length > 0)
		$('#font-embed').append(definedFont);
	else
		$('head').prepend(openStyleTag + definedFont + closeStyleTag);
}

function bookPageController($scope, $http, $location, $cookies, $timeout) {
	$scope.bookid = $cookies.bookid;
	$scope.mode = $cookies.mode;
	$scope.currRating = null;
	if ($location.search().id) {
		$scope.bookid = $location.search().id;
		$cookies.bookid = $location.search().id;
	}
	if ($location.search().mode) {
		$scope.mode = $location.search().mode;
		$cookies.mode = $location.search().mode;
	}
	if (!$location.search().mode && !$location.search().id) {
		var path = $location.path().split("/")[2];
		$scope.currentPage = path;
	}
	$scope.isBookLoaded = false;
	$scope.sendPageEvent = true;
	$http.get("books/books.json").success(function(response) {
		for (var i = 2; i < 9; i++) {
			for (var j = 0; j < response[i].length; j++) {
				if (response[i][j].bid == $scope.bookid) {
					$scope.path = response[i][j].path;
					$scope.bookuuid = response[i][j].uuid;
					getLastPageRead($scope, $cookies, $http);
					loadBook($scope.path, $scope.mode, $scope.bookid, $scope);
				}
			}

		}
	});

	$scope.$watch('isBookLoaded', function() {
		if ($scope.isBookLoaded) {
			getRatingOfBookByUser($scope, $cookies, $http, $timeout);
		}
	});
}

function getLastPageRead($scope, $cookies, $http) {
	$http.get("/api/getCurrentPageOfBookForUser/" + $cookies.userid + "/" + $scope.bookuuid, {}).success(function(data, status, headers, config) {
		if (data.length > 0 && data[0].result.score.raw) {
			$scope.lastReadMax = data[0].result.score.raw;
		} else {
			$scope.lastReadMax = 0;
		}
	});
}

function getRatingOfBookByUser($scope, $cookies, $http, $timeout) {
	$http.get("/api/getBookRatingForUser/" + $cookies.userid + "/" + $scope.bookuuid, {}).success(function(data, status, headers, config) {
		if (data.rating)
			$scope.BookRating = data.rating;
		else
			$scope.BookRating = 0;
		bookLoaded($scope, $cookies, $http, $timeout);
	});
}

function bookLoaded($scope, $cookies, $http, $timeout) {
	$('#book-view').removeClass('loading');
	$('body').removeClass('loading');
	$('#book').wowBook({
		height: 595,
		width: 840,
		flipSound: true,
		flipSoundPath: 'js/wow_book/sound/',
		centeredWhenClosed: true,
		updateBrowserURL: false,
		hardcovers: true,
		turnPageDuration: 1000,
		numberedPages: [1, -2],
		controls: {
			zoomIn: '#zoomin',
			zoomOut: '#zoomout',
			next: '#next',
			back: '#back',
			first: '#first',
			last: '#last',
			slideShow: '#slideshow',
			thumbnails: '#thumbs',
			fullscreen: '#fullscreen'
		},
		zoomMax: 2,
		scaleToFit: "#book-view",
		thumbnailsPosition: 'top',
		/*		thumbnailsContainerHeight: 60,
		 */
		onFullscreenError: function() {
			var msg = "Fullscreen failed.";
			if (self != top)
				msg = "The frame is blocking full screen mode. Click on 'remove frame' button above and try to go full screen again."
			alert(msg);
		},
		onShowPage: function(book, page, pageIndex) {}
	}).css({
		'opacity': '1',
		'display': 'none'
	}).fadeIn(1000);

	book = $.wowBook('#book');

	function rebuildThumbnails() {
		book.destroyThumbnails()
		book.showThumbnails()
		$("#thumbs_holder").css("marginTop", -$("#thumbs_holder").height() / 2)
	}
	$("#thumbs_position button").on("click", function() {
		var position = $(this).text().toLowerCase()
		if ($(this).data("customized")) {
			position = "top"
			book.opts.thumbnailsParent = "#thumbs_holder";
		} else {
			book.opts.thumbnailsParent = "body";
		}
		book.opts.thumbnailsPosition = position
		rebuildThumbnails();
	})
	$("#thumb_automatic").click(function() {
		book.opts.thumbnailsSprite = null
		book.opts.thumbnailWidth = null
		rebuildThumbnails();
	})
	$("#thumb_sprite").click(function() {
		book.opts.thumbnailsSprite = "images/thumbs.jpg"
		book.opts.thumbnailWidth = 136
		rebuildThumbnails();
	})
	$("#thumbs_size button").click(function() {
		var factor = 0.02 * ($(this).index() ? -1 : 1);
		book.opts.thumbnailScale = book.opts.thumbnailScale + factor;
		rebuildThumbnails();
	})

	if ($scope.currentPage) {
		book.showPage(parseInt($scope.currentPage));
	}
	if ($scope.mode === "draw") {
		$('.wowbook-handle', container).css("display", "none");
	}

	player = document.getElementById('audio-player');

	player.ontimeupdate = function() {
		var book = $.wowBook('#book');
		var currentPage = book.pages[book.currentPage].children().first();
		var stopTime = currentPage.attr('clipend');
		stopTime = Math.max(parseInt(stopTime), 1);
		if (player.currentTime >= stopTime || player.currentTime == player.duration) {
			if ($('#play').length && book.currentPage < book.pages.length - 1) {
				userTriggered = false;
				book.showPage(book.currentPage + 1);
				playAudio();
			} else {
				$('.reading').removeClass('reading');
				$('#play, #play_left, #play_right').removeClass('playing pause');
				player.pause();
			}
		}
	}
	//temp heck to avoid sending to events
	book.onShowPage = function() {
		$('.reading').removeClass('reading');
		if (userTriggered) {
			$('#play, #play_left, #play_right').removeClass('playing pause');
			userTriggered = false;
			setTimeout(function() {
				userTriggered = false;
				// alert('user');
				if (book.pageIsOnTheRight(book.currentPage)) {
					book.showPage(book.currentPage - 1);
				}
			}, 100);
		}
		player.pause();
		if ((book.currentPage <= book.pages.length - 3) && $cookies.userid && ($scope.lastReadMax < book.currentPage)) {
			if ($scope.sendPageEvent === true) {
				var dataObject = {
					"student": $cookies.userid,
					"bookid": $scope.bookuuid,
					"score": {
						bid: $cookies.bookid,
						raw: book.currentPage,
						max: book.pages.length - 3
					}
				};
				$scope.sendPageEvent = false;
				var responsePromise = $http.post("/api/setCurrentPageStudent/", dataObject, {});
				responsePromise.success(function(data, status, headers, config) {});
			} else {
				$scope.sendPageEvent = true;
			}
		}

		updatePage();
	}

	function updatePage() {
		var curPage = 0;
		var totalPages = book.pages.length - 2;
		if (book.currentPage > 0) {
			$('body').addClass('book-open');
			$('body').removeClass('book-closed');
		} else {
			$('body').removeClass('book-open');
			$('body').addClass('book-closed');
			/*curPage = book.currentPage - 1;*/
		}
		$('#pager_nav').val(curPage + '/' + totalPages);
	}
	updatePage();
	if (typeof(onBookLoaded) == 'function') onBookLoaded();
	$('#rating').RateBook({
		value: $scope.BookRating,
		OnRating: function(rating) {
			//assign book rating
			$scope.currRating = rating;
		}
	});
	/*	if($scope.BookRating){
		$(".ratingbtn").hide();
	}*/
	$(".ratingbtn").click(function(e) {
		if ($scope.currRating) {
			var dataObject = {
				"uuid": $cookies.userid,
				"bookid": $scope.bookuuid,
				"rating": $scope.currRating,
				"groupId": $cookies.GroupUUID
			};
			$scope.sendPageEvent = false;
			var responsePromise = $http.post("/api/SetBookRatingForUser/", dataObject, {});
			responsePromise.success(function(data, status, headers, config) {
				$scope.BookRating = $scope.currRating;
				/*				$(".ratingbtn").hide();
				 */
			});
		} else {
			$("#rate-error").html("Vänligen sätt betyg!");
		}
	})
	//
	if ($scope.mode === "listen") {
		$timeout(function() {
			angular.element("#play").triggerHandler('click');
		}, 0);
	}
	if ($scope.mode === "type") {
		$('#book textarea').keyup(function() {
			drawed = true;
		});

	}
	$(document).ready(function() {
		var play_click_handler = function(event) {
			if ($(this).hasClass('playing')) {
				document.getElementById('audio-player').pause();
				$('#play').removeClass('playing').addClass('pause');
			} else {
				if ($(this).hasClass('pause')) {
					document.getElementById('audio-player').play();
					$('#play').removeClass('pause').addClass('playing');
				} else {
					$('#play').addClass('playing');
					playAudio();
				}
			}
			event.preventDefault();
		};
		var play_page_click_handler = function(event) {
			if ($(this).hasClass('playing')) {
				document.getElementById('audio-player').pause();
				$('#play_left, #play_right').removeClass('playing');
				$('.reading').removeClass('reading');
			} else {
				$('#play_left, #play_right').addClass('playing');
				if ($(this).attr('id') === 'play_left') {
					playAudioLeft();
				} else if ($(this).attr('id') === 'play_right') {
					playAudioRight();
				}
			}
			event.preventDefault();
		};
		$('#play').addClass('stopped').click(play_click_handler);
		$('#play_left, #play_right').addClass('stopped').click(play_page_click_handler);
		$('#container').click(function() {
			userTriggered = true;
		});
		$('#next').click(function() {
			userTriggered = true;
		});
		$('#back').click(function() {
			userTriggered = true;
		});
	});
}

function playAudio() {
	var book = $.wowBook('#book');
	$('.reading').removeClass('reading');
	var currentPage = book.pages[book.currentPage].children().first();
	var soundPath = currentPage.addClass('reading').attr('sound');
	if (soundPath == null) {
		if ($('#play').length && book.currentPage < book.pages.length - 1) {
			setTimeout(function() {
				userTriggered = false;
				book.showPage(book.currentPage + 1);
				playAudio();
			}, 1000);
		} else {
			$('.reading').removeClass('reading');
			$('#play, #play_left, #play_right').removeClass('playing pause');
			player.pause();
		}
		return;
	}
	var soundInstance = '<source src="' + soundPath + '">';
	$('#audio-player').html(soundInstance);
	player.load();
	player.oncanplaythrough = function() {
		player.currentTime = parseInt(currentPage.attr('clipbegin'));
		player.play();
		player.oncanplaythrough = null;
	}
}

function playAudioLeft() {
	var book = $.wowBook('#book');
	if (book.pageIsOnTheRight(book.currentPage)) {
		book.showPage(book.currentPage - 1);
	}
	playAudio();
}

function playAudioRight() {
	var book = $.wowBook('#book');
	if (book.pageIsOnTheLeft(book.currentPage)) {
		book.showPage(book.currentPage + 1);
	}
	playAudio();
}

/*/Load book change here */

function loadBookPages(bookName, bookPages, mode, id, $scope) {
	var smilPath = 'books/' + bookName + '/OEBPS' + '/' + bookPages.shift();
	$.ajax({
		url: smilPath,
		dataType: 'xml',
		success: function(xml) {
			$.ajax({
				url: smilPath.substr(0, smilPath.lastIndexOf('/') + 1) + $(xml).find('text').attr('src'),
				dataType: 'xml',
				success: function(pageXML) {
					// Append page to book-view
					var pageContent = $(pageXML).find('body').html();
					pageContent = $('<div />').append(pageContent).appendTo('#book');

					$(pageContent).find("div:first").css({
						width: '420px',
						height: '595px'
					});
					$(pageContent).find("img").css({
						width: '420px',
						height: '595px'
					});
					$(pageContent).find('p').closest('div').css({
						height: 'auto'
					});
					//load mode specifc data

					if (mode === "draw") {
						draw(pageContent);
					}
					if (mode == "type") {
						write(pageContent);
					}
					$(pageContent).find('[src]').each(function() {
						$(this).attr('src', 'books/' + bookName + '/OEBPS/' + $(this).attr('src'));
					});
					$(pageContent).find('[href]').each(function() {
						$(this).attr('href', 'books/' + bookName + '/OEBPS' + '/' + $(this).attr('href'));
					});

					var audiosrc = $(xml).find('audio').attr('src');
					if (audiosrc.length > 0) {
						$(pageContent).attr('sound', smilPath.substr(0, smilPath.lastIndexOf('/') + 1) + $(xml).find('audio').attr('src'));
					}
					$(pageContent).attr('clipBegin', $(xml).find('audio').attr('clipBegin'));
					$(pageContent).attr('clipEnd', $(xml).find('audio').attr('clipEnd'));

					if (bookPages.length > 0)
						loadBookPages(bookName, bookPages, mode, id, $scope);
					else {

						$('body').addClass('book-closed');
						var rating = '<div class="rating-bg"><div><div class="dotted-teacher"><span>Vad tyckte du om boken? Ge ditt betyg!</span></div><div id="rating" name="rating-container"><span class="rating-star" data-value="5"></span><span class="rating-star" data-value="4"></span><span class="rating-star" data-value="3"></span><span class="rating-star" data-value="2"></span><span class="rating-star" data-value="1"></span></div><label id="demo-res" style="display:block; margin:20px 0"><div style="color: red" id="rate-error"></div> </label><a href="javascript:history.back()" class ="ratingbtn">Klar</a></div></div>';
						$('#book').append(rating);
						$scope.$apply(function() {
							$scope.isBookLoaded = true;
						});
					}

				}
			});

		}
	})
		.fail(function() {
			alert('Could not load one of the pages');
		});
}

function parseBookContent(bookName, xml, mode, id, $scope) {
	$('#cover').html('<img style ="width : 420px; max-height :595px;" src="books/' + bookName + '/OEBPS' + '/' + $(xml).find('[properties="cover-image"]').attr('href') + '" />');
	$(xml).find('item[media-type="text/css"]').each(function() {
		loadCss(bookName, $(this).attr('href'));
	});
	var bookPages = Array();
	$(xml).find('item[media-type="application/smil+xml"]').each(function() {
		bookPages.push(String($(this).attr('href')));
	});
	loadBookPages(bookName, bookPages, mode, id, $scope);
}

function loadBook(bookName, mode, id, $scope) {
	$.ajax({
		url: 'books/' + bookName + '/OEBPS' + '/content.opf',
		dataType: 'xml',
		success: function(xml) {
			// Clear and hide book element
			$('#book').css({
				'opacity': '0',
				'margin': 'auto'
			}).html('<div id="cover"/>');
			$('#book-view').addClass('loading');
			$('body').addClass('loading');
			parseBookContent(bookName, xml, mode, id, $scope);
		}
	})
		.fail(function() {
			alert('Error occured trying to open book\'s content. Check the filepath.')
		});
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}



function loadCss(bookName, filePath) {
	$('head').append('<link rel="stylesheet" href="books/' + bookName + '/OEBPS' + '/' + filePath + '">');
}

function draw(pageContent) {
	$(pageContent).append('<canvas class="simple_sketch" style="background: url(images/white.jpg);" width="420" height="595"></canvas><a class="clear_canvas" href="simple_sketch"></a>');
	$(function() {
		$('.simple_sketch').each(function() {
			canvases.push($(this).sketch());
		});
		$('.simple_sketch').each(function(index) {
			$(this).bind('touchstart click', function(e) {
				e.preventDefault();
				drawed = true;
			});
		});
	});


	$('#clear_canvas').click(function(event) {
		$('.simple_sketch').each(function(index) {
			if (canvases[index].sketch) {
				canvases[index].sketch().actions = [];
			}
			var ctxt = $(this)[0].getContext('2d');
			ctxt.clearRect(0, 0, $(this).width(), $(this).height());
		});
		event.preventDefault();
	});
	$(function() {
		$('.paint_tools a').on('click', function(e) {
			var a = $(this).data('size');
			$('.simple_sketch').each(function() {
				$(this).sketch().set('size', a);
			});
			e.preventDefault();
		});
		$('.paint_tools a').on('click', function(e) {
			$('.selected_tool').removeClass('selected_tool');
			$(this).children('img').addClass('selected_tool');
			e.preventDefault();
		});

	});
	$(function() {
		$('.eraser a').on('click', function(e) {
			var a = $(this).data('color');
			$('.simple_sketch').each(function() {
				$(this).sketch().set('color', a);
			});
			var b = $(this).data('size');
			$('.simple_sketch').each(function() {
				$(this).sketch().set('size', b);
			});
			e.preventDefault();
		});
		$('.eraser a').on('click', function(e) {
			$('.selected_tool').removeClass('selected_tool');
			$(this).children('img').addClass('selected_tool');
			e.preventDefault();
		});

	});
	$(function() {
		$('.color_tools a').on('click', function(e) {
			var a = $(this).data('color');
			$('.simple_sketch').each(function() {
				$(this).sketch().set('color', a);
			});
			e.preventDefault();
		});
		$('.color_tools a').on('click', function(e) {
			$('.select_color').removeClass('select_color');
			$(this).addClass('select_color');
			e.preventDefault();
		});
	});
}

function write(pageContent) {
	var newid = $(pageContent).find('p').closest('div').attr('id');
	$(pageContent).find('p').closest('div').replaceWith('<textarea class = "fontclass" id = "' + newid + '"  style ="background:#f0f2f2" type ="text"></textarea>');
	$(document).ready(function() {
		$('#clear_canvas').on('click', function(e) {
			e.preventDefault();
			$('.fontclass').val("");
			e.preventDefault();
		})
	});

	$(function() {
		$('.type_tools a').on('click', function(e) {
			var a = $(this).data('font');
			$('.fontclass').each(function() {
				$(this).css('font-family', a);
			});
			e.preventDefault();
		});
		$('.type_tools a').on('click', function(e) {
			$('.selected_tool').removeClass('selected_tool');
			$(this).children('img').addClass('selected_tool');
			e.preventDefault();
		});
	});
	$(function() {
		$('.color_tools a').on('click', function(e) {
			var a = $(this).data('color');
			$('.fontclass').each(function() {
				$(this).css('color', a);
			});
			e.preventDefault();
		});
		$('.color_tools a').on('click', function(e) {
			$('.select_color').removeClass('select_color');
			$(this).addClass('select_color');
			e.preventDefault();
		});
	});
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

function proceed(e) {
	if (typeof(e) === "number") {
		book.gotoPage(e);
	} else if (typeof(e) === "object") {
		var clickEvent = e.target.id;
		if (clickEvent === "next") {
			book.advance();
		} else if (clickEvent === "back") {
			book.back();
		}
	}
}

function msgBox(e) {

	var book = $.wowBook('#book'),
		/*clickEvent = e.target.id,*/
		mode_value = readCookie('mode');
	$('#msgBox').remove();
	$('body').append('<div id="msgBox"><div class="msgBox_class"><a href="#" class="alert-close-icon"><img src="images/close_icon.png" width="40" alt="log-out"></a><label></label><div class="printout"><a href="#"><img src="images/skriv-ut.png" width="31" alt="log-out"><span>Skriv ut</span></a></div><div class="clearCanvas"><a href="#"><img src="images/delete.png" width="31" alt="log-out"> <span>Gå vidare</span></a></div></div></div>');

	$('#msgBox label').append('<p class="alert-head">Din bild sparas inte</p><br><p class="alert-text">Din bild kommer inte att sparas när du lämnar sidan.Skriv ut bilden om du vill!</p> ');
	$('#msgBox .printout').click(function() {
		if (window.print) window.print();
		$('#msgBox').remove();
		drawed = false;
	}); // Print
	if (mode_value === "draw") {
		$('#msgBox .clearCanvas').click(function(event) {
			$('.simple_sketch').each(function(index) {
				if (canvases[index].sketch) {
					canvases[index].sketch().actions = [];
				}
				var ctxt = $(this)[0].getContext('2d');
				ctxt.clearRect(0, 0, $(this).width(), $(this).height());
			});
			event.preventDefault();
			$('#msgBox').remove();
			drawed = false;
			proceed(e);
		}); // Cancel
	}
	if (mode_value === "type") {
		$('#msgBox .clearCanvas').click(function(event) {
			$('.fontclass').val("");
			event.preventDefault();
			$('#msgBox').remove();
			drawed = false;
			proceed(e);
		});
	}
	$(function() {
		$('a.alert-close-icon').click(function(e) {
			$('#msgBox').remove();
			e.preventDefault();
		});

		$('div#msgBox').on('click', function(e) {
			if (e.target !== this) return;
			$('#msgBox').remove();
		});

	});
}