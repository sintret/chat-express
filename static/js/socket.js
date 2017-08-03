var l = 'http://localhost:3001';
var s = 'http://sintret.com:3001';

var socket = io(l);
socket.on('onlines', function (datas) {
    var data = datas.data;

    $(".sideBar-body").each(function () {
        var id = $(this).data("id");
        var a = data.indexOf(id);
        if (a >= 0) {
            $("#online"+id).removeClass( "offline-meta" );
            $("#online"+id).html("online");
            if($("#online"+id).hasClass( "online-meta" )){

            }else{
                $("#online"+id).addClass('online-meta');
            }
        } else {
            $("#online"+id).html("offline");
            $("#online"+id).removeClass( "online-meta" );
            if($("#online"+id).hasClass( "offline-meta" )){

            }else{
                $("#online"+id).addClass('offline-meta');
            }
        }
    });
});

var uploader = new SocketIOFileClient(socket);
var form = document.getElementById('modal-form');

uploader.on('start', function(fileInfo) {
    console.log('Start uploading', fileInfo);
});
uploader.on('stream', function(fileInfo) {
    var t = (fileInfo.sent / fileInfo.size) * 100 +'%';
    $(".progress-bar").css( "width", t );
    $(".progress-bar").html(t);
});
uploader.on('complete', function(fileInfo) {
    $(".progress-bar").css( "width", '100%' );
    $(".progress-bar").html('100%');
    var photo = '/static/images/thumb/'+fileInfo.name;

    setTimeout(function(){ $("#modal-image").attr('src',photo); }, 1000);

    console.log('Upload Complete', fileInfo);
});
uploader.on('error', function(err) {
    console.log('Error!', err);
});
uploader.on('abort', function(fileInfo) {
    console.log('Aborted: ', fileInfo);
});

form.onsubmit = function(ev) {
    ev.preventDefault();

    var fileEl = document.getElementById('modal-file');
    var uploadIds = uploader.upload(fileEl);
};