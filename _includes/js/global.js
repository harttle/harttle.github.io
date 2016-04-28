var footHeight = $('#footer').outerHeight(true);

window.$body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');

window.uuid = function(){
    Math.random().toString(36).substr(2);
};

$(window).load(function(){
    $('script[type="text/async-script"]').each(function(idx, el){
        var $script = $('<script>');
        if(el.dataset.src) $script.attr('src', el.dataset.src);
        else $script.html(el.text);
        $script.appendTo('body');
        el.remove();
    });
});

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

$(function() {
    $('[data-toggle="tooltip"]').tooltip();
    $("img.lazy").lazyload({
        effect: "fadeIn",
        skip_invisible: false
    });

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

    // enable lightbox 
    $('.md img').not('a img').wrap(function(){
        return '<a data-lightbox="true" href="'+$(this).attr("src")+'"></a>';
    });
    $('.md a').attr('target', '_blank');
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

