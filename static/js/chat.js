$("#send-comment").on("click", function () {
    if($("#comment").val()==''){
        return;
    }


})

var n=0;
$(".sideBar-body").each(function () {
    if(n==0){
        $(this).addClass('grey');
        var h = '<div class="col-sm-2 col-md-1 col-xs-3 heading-avatar"><div class="heading-avatar-icon"><img src="/static/images/thumb/'+$(this).data('photo')+'" title="'+$(this).data('username')+'"><a class="heading-name-meta">Test cc Satu</a></div></div>';
        $(".avatar-place").html(h);
    }
    n++;
});

$(".sideBar-body").on("click", function () {
    var $this = $(this);
    $(".sideBar-body").each(function () {
        $(this).removeClass('grey');
    });

    $this.addClass('grey');
    var h = '<div class="col-sm-2 col-md-1 col-xs-3 heading-avatar"><div class="heading-avatar-icon"><img src="/static/images/thumb/'+$(this).data('photo')+'" title="'+$(this).data('username')+'"><a class="heading-name-meta">Test cc Satu</a></div></div>';
    $(".avatar-place").html(h);

});

