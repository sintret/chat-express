var hideAllPopovers = function() {
    $('.popover').each(function() {
        $(this).popover('hide');
    });
};

$(document).on("click","#menu-profile", function () {
    $(".side-two").show();
    $(".side-two").css({
        "left": "0"
    });
    hideAllPopovers();
});

$(document).on("click",".newMessage-back", function () {
    $(".side-two").hide();
    $(".side-two").css({
        "left": "0"
    });
});

$('.heading-dot').popover({
    container: 'body'
});

$(function() {
    $('[data-toggle="popover"]').popover();
});