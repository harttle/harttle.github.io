var footHeight = $('#footer').outerHeight(true);

$(function() {
    $('[data-toggle="tooltip"]').tooltip();
    $("img.lazy").lazyload({
        effect: "fadeIn",
        skip_invisible: false
    });

    //页面内链接滑动效果
    $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
    $('a.animate').click(function() {
        var $this = $(this);
        if ($this.attr('offset')) {
            offset += parseInt($(this).attr('offset'));
        }
        $body.animate({
            scrollTop: $($this.attr('href')).offset().top
        }, 500);
        return false;
    });

    initScrollTopButton();
});

function initScrollTopButton(){
    var $window = $(window), topDistance = 300, shown = false, $btn = $('#site-scroll-top');
    $window.scroll(function() {
        if ($window.scrollTop() > topDistance) {
            if (!shown) {
                shown = true;
                $btn.addClass('show');
            }
        } else {
            if (shown) {
                $btn.removeClass('show');
                shown = false;
            }
        }
    });
}
