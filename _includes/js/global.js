var footHeight = $('#footer').outerHeight(true);

window.$body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');

window.uuid = function(){
    Math.random().toString(36).substr(2);
}

location.query = function(name, val) {
    if(arguments.length == 1){
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(this.search);
        return results === null ? 
            "" : 
            decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    else{
        history.replaceState(null, document.title, '?'+name+'='+encodeURIComponent(val));
    }
};

function updateTagHref(){
    $('a[data-tag]').each(function(idx, ele){
        var $ele = $(ele), name = $ele.html().split('(')[0].trim();
        $ele.attr('href', '/tags.html?tag=' + encodeURIComponent(name));
    });
}

$(function() {
    $('[data-toggle="tooltip"]').tooltip();
    $("img.lazy").lazyload({
        effect: "fadeIn",
        skip_invisible: false
    });
    updateTagHref();

    // 页面内链接滑动效果
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

