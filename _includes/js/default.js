
window.modules.default = function(console, $ele, mod) {
    $('.site-nav .toggle').click(function(){
        $('.site-nav').addClass('hover');
    });
    $('.site-content').click(function(){
        $('.site-nav').removeClass('hover');
    });
};
