var l = 'http://localhost:3001';
var s = 'http://sintret.com:3001';

var toId = [];

var socket = io(l);
socket.on('onlines', function (datas) {
    var data = datas.data;

    console.log("onlines : " + JSON.stringify(data));

    $(".sideBar-body").each(function () {
        var $this = $(this);
        var id = $this.data("id");
        var u = $this.data("u");

        var a = data.indexOf(u);
        if (a >= 0) {
            $("#online" + id).removeClass("offline-meta");
            $("#online" + id).html("online");
            if ($("#online" + id).hasClass("online-meta")) {

            } else {
                $("#online" + id).addClass('online-meta');
            }
        } else {
            $("#online" + id).html("offline");
            $("#online" + id).removeClass("online-meta");
            if ($("#online" + id).hasClass("offline-meta")) {

            } else {
                $("#online" + id).addClass('offline-meta');
            }
        }
    });
});


//upload photo in modal
var uploader = new SocketIOFileClient(socket);
var form = document.getElementById('modal-form');

uploader.on('start', function (fileInfo) {
    console.log('Start uploading', fileInfo);
});
uploader.on('stream', function (fileInfo) {
    var t = (fileInfo.sent / fileInfo.size) * 100 + '%';
    $(".progress-bar").css("width", t);
    $(".progress-bar").html(t);
});
uploader.on('complete', function (fileInfo) {
    $(".progress-bar").css("width", '100%');
    $(".progress-bar").html('100%');
    var photo = '/static/images/thumb/' + fileInfo.name;

    setTimeout(function () {
        $("#modal-image").attr('src', photo);
    }, 2000);

    console.log('Upload Complete', fileInfo);
});
uploader.on('error', function (err) {
    console.log('Error!', err);
});
uploader.on('abort', function (fileInfo) {
    console.log('Aborted: ', fileInfo);
});

form.onsubmit = function (ev) {
    ev.preventDefault();

    var fileEl = document.getElementById('modal-file');
    var uploadIds = uploader.upload(fileEl);
};

//sent message
$("#send-comment").on("click", function () {
    var comment = $("#comment").val();
    comment = $.trim(comment);
    if (comment == '') {
        alert("can not blank!");
        return;
    }

    var arr = cookieArray();
    for (i = 0; i < arr.length; i++) {
        socket.emit(arr[i], comment);
    }
    $("#comment").val("");
})

var n = 0;
$(".sideBar-body").each(function () {
    if (n == 0) {
        $(this).addClass('grey');
        var h = '<div class="col-sm-2 col-md-1 col-xs-3 heading-avatar"><div class="heading-avatar-icon"><img src="/static/images/thumb/' + $(this).data('photo') + '" title="' + $(this).data('username') + '"><a class="heading-name-meta">' + $(this).data("username") + '</a></div></div>';
        $(".avatar-place").html(h);
        cookieSet([], $(this).data("u"));
    }
    n++;
});

$(".sideBar-body").on("click", function () {
    var $this = $(this);
    $(".sideBar-body").each(function () {
        $(this).removeClass('grey');
    });

    $this.addClass('grey');
    var h = '<div class="col-sm-2 col-md-1 col-xs-3 heading-avatar"><div class="heading-avatar-icon"><img src="/static/images/thumb/' + $(this).data('photo') + '" title="' + $(this).data('username') + '"><a class="heading-name-meta">' + $(this).data("username") + '</a></div></div>';
    $(".avatar-place").html(h);
    cookieSet([], $this.data("u"));

});

function cookieSet(arr, v) {
    arr.push(v);
    var s = JSON.stringify(arr);
    setCookie("user", s);
}

function cookieClear() {
    setCookie("user", "");
}

function cookieArray() {
    var u = getCookie("user");

    if (u == "") {
        return [];
    } else {
        return JSON.parse(u);
    }
}

function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}