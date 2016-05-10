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
        link = $('<a>', {href: res[i].src, class: "thumbnail"}).appendTo(galery);
        link.append('<img src="' + res[i].src + '" class="img-responsive">');
        link.append('<div class="caption">' + res[i].descr + '</div>');
    }
}
