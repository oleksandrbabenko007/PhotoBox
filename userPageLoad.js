$.get('/user_page', function(res) {
    if (res.error || !res) {
        window.location.href = '/index.html';
        return;
    }
    $('.username').find('strong').text(res.name);
    $('.status').text(res.status);
    $('<img/>', {src: res.avatar, class: 'img-responsive img-circle'}).appendTo('.avatar');
    $.get(res.images, logImages);
});

function logImages(res) {
    var galery = $('.image-list');
    var link;
    for (var i = 0; i < res.length; i++) {
        link = $('<div>', {class: "thumbnail"}).appendTo(galery);
        link.append('<span class="glyphicon glyphicon-remove remove-photo" aria-hidden="true" value="' + res[i].id + '"></span>');
        link.append('<img src="' + res[i].src + '" class="img-responsive">');
        link.append('<div class="caption">' + res[i].descr + '</div>');
    }
}

$('.image-list').on('click', '.remove-photo', function(event) {
    event.preventDefault();
    var imageID = {id: $(this).attr('value')};
    console.log(imageID);

    $.post('/remove_photo', imageID, function(res) {
        if (res.status) {
            location.reload();
        }
    });
});

$(".avatar").on("mouseover", ".img-circle", function() {
    $(this).css("opacity", "0.5");
    $("div#alex").css("display", "block");
}).on("mouseout", ".img-circle", function() {
    $(this).css("opacity", "1"); 
    $("div#alex").css("display", "none");
});
$(".avatar").on("click", ".img-circle", function() {
    $("#avatarka").trigger("click");
});
