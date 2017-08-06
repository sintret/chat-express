var l = 'http://localhost:3001';
var s = 'https://chat.sintret.com';

var toId = [];

var socket = io(s);
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

//receive message
socket.on("receive", function (data) {
    var d = new Date();

    var to = data.to;
    var from = data.from;
    var message = data.message;
    var conversation = $("#conversation").data("id");
    for (i = 0; i < to.length; i++) {
        var obj = {
            id: null,
            message: message,
            to: to[i],
            from: from,
            updatedAt: d
        }
        chatsStore.push(obj);

        if (to[i] == $("#activeId").val() || from == $("#activeId").val()) {
            $("#conversation").append(buildMessage(message, from, to[i]));
            $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
        }
    }
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
        $(".profile-modal").attr('src', photo);
    }, 2000);

    console.log('Upload Complete', fileInfo);
});
uploader.on('error', function (err) {
    console.log('Error!', err);
    //toastr.warning(err, err, {timeOut: 5000});
    alert(err);
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
    socket.emit("sent", {to: cookieArray(), message: comment});
    $("#comment").val("");
})

var n = 0;
$(".sideBar-body").each(function () {
    if (n == 0) {
        $(this).addClass('grey');
        var h = '<div class="col-sm-2 col-md-1 col-xs-3 heading-avatar"><div class="heading-avatar-icon"><img src="/static/images/thumb/' + $(this).data('photo') + '" title="' + $(this).data('username') + '"><a class="heading-name-meta">' + $(this).data("username") + '</a></div></div>';
        $(".avatar-place").html(h);
        cookieSet([], $(this).data("id"));
        $("#conversation").data("id", $("#activeId").val());
        searchUser($(this).data("id"));
        $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
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
    searchUser($this.data("id"));
    cookieSet([], $this.data("id"));
    $("#conversation").attr("data-id", $this.data("id"));
    $("#activeId").val($this.data("id"));
    $("#activeUser").val($this.data("username"));
    document.getElementById('conversation').scrollIntoView();
    $('#conversation').scrollTop($('#conversation')[0].scrollHeight);

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
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
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

function buildMessage(message, from, to, t) {
    var d = new Date();
    t = t || d.getHours() + '.' + d.getMinutes();
    var u = $("#input" + from).val();

    var html = '';
    if (from == $("#meId").val()) {
        html += '<div class="row message-body"><div class="col-sm-12 message-main-sender"><div class="sender"><div class="message-text">' + message + '</div><span class="message-time pull-right">' + t + '</span></div></div></div>';
    } else {
        html += '<div class="row message-body"><div class="col-sm-12 message-main-receiver"><div class="receiver"><div class="reply-emojis">' + u + ':</div><div class="message-text">' + message + '</div><span class="message-time pull-right">' + t + '</span></div></div></div>';
    }

    return html;
}

function searchUser(id) {
    $("#conversation").html("");
    var arr = [];
    for (i = 0; i < chatsStore.length; i++) {
        if (chatsStore[i].to == id || chatsStore[i].from == id) {
            arr.push(chatsStore[i]);
            var d = new Date(chatsStore[i].updatedAt);
            var t = d.getHours() + '.' + d.getMinutes();
            $("#conversation").append(buildMessage(chatsStore[i].message, chatsStore[i].from, chatsStore[i].to, t));
        }
    }
    return arr;
}