function userPage(){
    var guest = false;
    var url2 = window.location.search;
    console.log(url2);
    if(url2) {
        guest = true;
        $('.btn-login').hide();
        $('#avatarka').remove();
    };
    console.log(guest);
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

// $.post('/changeAvatarka', function(res) {
//     $('<img/>', {src: res.avatar, class: 'img-responsive img-circle'}).appendTo('.avatar');
// });

function logImages(res) {
    var galery = $('.image-list');
    var link;
    for (var i = 0; i < res.length; i++) {
        link = $('<a>', {class: "thumbnail fancybox", rel: "group", href: res[i].src}).appendTo(galery);
        if(guest == false){    
        link.append('<span class="glyphicon glyphicon-remove remove-photo" aria-hidden="true" value="' + res[i].id + '"></span>');
        }
        link.append('<img src="' + res[i].src + '" class="img-responsive openmodal">');
        // <a class="fancybox" rel="group" href="users_images/sasha/1.jpg"><img src="users_images/sasha/1.jpg" alt="" /></a>
        link.append('<div class="caption">' + res[i].descr + '</div>');
    }
}

$('.image-list').on('click', '.remove-photo', function(event) {
    event.preventDefault();
    var image = $(this).parent().removeClass('fancybox');
    var imageID = {id: $(this).attr('value')};
    console.log(imageID);
    $.post('/remove_photo', imageID, function(res) {
        if (res.status) {
            image.remove();
        }
    });
});

if(guest==false) {
$(".avatar").on("mouseover", ".img-circle", function() {
    $("div#alex").show("slow");
}).on("mouseout", ".img-circle", function() {
    $("div#alex").hide("slow");
});

$(".avatar").on("click", ".img-circle", function() {
    $("#avatarka").trigger("click");
});
};

};

$(document).ready(function() {
    userPage();
    $(".fancybox").fancybox({
        openEffect  : 'fade',
        openSpeed : 'slow',
        closeEffect : 'fade',
        closeSpeed : 'slow' 
    });
});
