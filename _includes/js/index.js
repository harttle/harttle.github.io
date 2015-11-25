window.modules.index = function() {
    var ias = $.ias({
        container: '.posts',
        item: '.post',
        pagination: '.pager',
        next: '.pager .previous a'
    });
    ias.on('loaded', function(data, items) {
        console.log('loaded:', items);
    });
    ias.extension(new IASSpinnerExtension({
        src: '/assets/img/loading.gif'
    }));
    ias.extension(new IASNoneLeftExtension({
        text: '只有这些了~',
        html: '<div class="ias-noneleft" style="text-align: center;">{text}</div>'
    }));
};
