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
var form = document.getElementById('form');

uploader.on('start', function(fileInfo) {
    console.log('Start uploading', fileInfo);
});
uploader.on('stream', function(fileInfo) {
    console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
});
uploader.on('complete', function(fileInfo) {
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

    var fileEl = document.getElementById('file');
    var uploadIds = uploader.upload(fileEl);

    // setTimeout(function() {
    // uploader.abort(uploadIds[0]);
    // console.log(uploader.getUploadInfo());
    // }, 1000);
};