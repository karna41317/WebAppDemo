/* 
Author: KARAN
Date  :
 */

(function($) {

})(this.jQuery);

window.log = function() {
	log.history = log.history || []; // store logs to an array for reference
	log.history.push(arguments);
	if (this.console) {}
};
// catch all document.write() calls
(function(doc) {
	var write = doc.write;
	doc.write = function(q) {
		log('document.write(): ', arguments);
		if (/docwriteregexwhitelist/.test(q)) write.apply(doc, arguments);
	};
})(document);


/*=================================================
                                    Rating Book Script
                    =================================================*/


(function($) {
	$.fn.RateBook = function(options) {
		var eContainer = this;
		var eStar = eContainer.find('.rating-star');
		var defVal = options.value || 0;
		if (defVal < 1) {
			var isEditable = true;
			eStar.on('click', function(e) {
				var amount = samElement(e.target) ? removeAll(e.target) : rate(e.target);
				if (isEditable) {
					var amount = rate(e.target);
					options.OnRating(amount);
					printAmount(amount);
				}
			});
		} else if (defVal >= 1) {
			//handle case where values already selected
			var ele = eContainer.find("[data-value='" + defVal + "']");
			ele.addClass('rating-star-clicked').siblings('.rating-star').removeClass('rating-star-clicked');
			$('#demo-res').html(defVal + " stjärnor");
		}
		var samElement = function(ele) {
			if ($(ele).hasClass('rating-star-clicked')) {
				return true;
			} else {
				return false;
			}
		}
		/*
    var removeAll = function(ele) {
      $(ele).removeClass('rating-star-clicked');
      return '';
    }*/
		var rate = function(ele) {
			$(ele).addClass('rating-star-clicked').siblings('.rating-star').removeClass('rating-star-clicked');
			return $(ele).attr('data-value');
		}
		var printAmount = function(what) {
			$('#demo-res').html(what + " stjärnor");
		}

		return this;
	};

}(jQuery));

/*$('#thumbs').click(function(e) {
	$(document).ready(function() {
		var x = $('div.wowbook-thumbnails.wowbook-horizontal');
		x.attr("style", "");
		x.addClass()

	});
})*/