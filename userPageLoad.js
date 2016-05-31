$(function() {
    var guest = false;
    var url = window.location.search || '';
    if (url) {
        guest = true;
        $('.btn-login').hide();
        $('#chooseAvatar').remove();
    }

    $.get('/user_page' + url, function(response) {
        if (response.error || !response) {
            window.location.href = '/index.html';
            return;
        }
        var res = response[0];
        if (response[1]) {
            guest = false;
        }
        $('.username').find('strong').text(res.name);
        $('.status').text(res.status);
        $('<img/>', {src: res.avatar, class: 'img-responsive img-circle'}).appendTo('.avatar'); 
    });

    if (guest == false) {
        $('.avatar').on('mouseover', '.img-circle', function() {
            $('div#textChange').show('slow');
        }).on('mouseout', '.img-circle', function() {
            $('div#textChange').hide('slow');
        });

        $('.avatar').on('click', '.img-circle', function() {
            $('#chooseAvatar').trigger('click');
        });
    }

    $(".fancybox").fancybox({
        openEffect: 'fade',
        openSpeed: 'fast',
        closeEffect: 'fade',
        closeSpeed: 'fast'
    });
});
