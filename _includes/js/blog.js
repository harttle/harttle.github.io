window.modules.blog = function(console, $ele, mod) {
    var toc = getTOC($('article')),
        $toc = $('.toc');
    if (toc) {
        $toc.append(toc);

        //toc affix, this offset is for toc position recognition
        setTimeout(function() {
            $toc.affix({
                offset: {
                    top: function() {
                        var offsetTop = $toc.offset().top;
                        return (this.top = offsetTop - 40);
                    },
                    bottom: function() {
                        return (this.bottom = $(document).height() - $('.md').offset().top - $('.md').height());
                    }
                }
            });
        }, 100);

        //toc scroll spy
        $('body').scrollspy({
            target: '.toc',
            offset: 10 //make sure to spy the element when scrolled to
        });
    } else {
        $ele.addClass('collapsed');
    }

    $(window).resize(function() {
        $('body').scrollspy('refresh');
    });

    //生成目录
    function getTOC($content) {
        var $toc = $('<ul class="nav level-0" >').addClass("nav sidenav");

        var base_level = 1;
        while ($content.find('h' + base_level).length < 1 && base_level < 7) base_level += 1;
        if (base_level == 7) return null;

        $content.find(':header').each(function(i) {
            var $this = $(this);
            $this.attr('id', i);

            var level = parseInt(this.nodeName.substr(1));
            var offset = level - base_level;

            var li = new $('<li/>')
                .append('<a href="#' + i + '" class="animate">' + $this.text() + '</a>')
                .append($('<ul class="nav level-' + (offset + 1) + '"/>'));

            $('<div>').append($toc).find('ul.level-' + offset + ':last').append(li);
        });
        // remove empty ul
        $toc.find('ul').not(':parent').remove();
        return $toc;
    }

    var links = {
        weibo: 'http://v.t.sina.com.cn/share/share.php?' + $.param({
            url: location.href,
            title: $('meta[name=description]').attr('content')
        }),
        wechat: location.href
    };
    $('#social-share-block').socialShare({ links: links, size: 'sm'});
};

