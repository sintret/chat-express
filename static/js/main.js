var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

$(window).load(function () {
    // Run code
    var notification = $(".notification-growl").html();
    if (notification.length > 1) {
        var sessionFlash = JSON.parse(notification);
        var type = sessionFlash.type;
        if (type == 'success') {
            toastr.success(sessionFlash.message, sessionFlash.title, {timeOut: 5000});
        } else if (type == 'error' || type == 'warning') {
            toastr.error(sessionFlash.message, sessionFlash.title, {timeOut: 5000});
        } else {
            toastr.info(sessionFlash.message, sessionFlash.title, {timeOut: 5000});
        }
    }
});

$(".profile-modal").on("click", function () {
    $('#modal-profile').modal('show');
});

$.fn.editable.defaults.mode = 'inline';

$(document).ready(function () {
    $('#modal-fullname').editable();
});