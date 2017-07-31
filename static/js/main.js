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

$( window ).load(function() {
    // Run code
    var notification = $(".notification-growl").html();
    if(notification.length > 1){
        var sessionFlash = JSON.parse(notification);
        var type = sessionFlash.type;
        if (type == 'success') {
            toastr.success(sessionFlash.message, sessionFlash.title, {timeOut: 5000});
        } else if (type == 'error' || type == 'warning') {
            toastr.error(sessionFlash.message, sessionFlash.title, {timeOut: 5000});
        }else{
            toastr.info(sessionFlash.message, sessionFlash.title, {timeOut: 5000});
        }
    }
});

$(".profile-modal").on("click", function () {
    $('#modal-profile').modal('show');
});