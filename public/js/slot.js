$(document).ready(function(e) {
    // level sorting
    $('.sort-btn').click(function(e) {
        $('.select-level').slideToggle('fast');
/*        $('.level-selected').slideToggle('fast');
*/    });
    $('.slotsort-btn').click(function(e) {
        e.preventDefault();
        $('.slotselect-level').slideToggle('fast'); e.preventDefault();
    });
    // more library shelf
    $('#overlay-shade, .overlay a').click(function(e) {
        closeOverlay('#overlay-inAbox');
        if ($(this).attr('href') == '#') e.preventDefault();
    });
    $('#overlay-shade, .overlay a').click(function(e) {
        closeOverlay('#overlay-book');
        if ($(this).attr('href') == '#') e.preventDefault();
    });

});