window.modules.blog = function(console, $ele) {

    recordPageView();
    initTOC();
    initShareButtons();
    initRecommends();

    function initTOC() {
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
    }

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

    function initShareButtons() {
        var links = [{
            plugin: 'weibo',
            target: '_blank',
            args: {
                title: $('meta[name=description]').attr('content') + ' - ' + document.title
            }
        }, {
            plugin: 'wechat',
            title: '扫一扫！'
        }];
        window.socialShare($('#social-share-block').get(0), links, {
            size: 'sm'
        });
    }

    function initRecommends(){
        $.get('/posts.json').done(function(posts){
            if(typeof posts === 'string'){
                posts = JSON.parse(posts);
            }
            if(posts.length < 2) return;

            var current;
            var mostSimilar = null;
            var pv = getPageView();
            posts
            .filter(function(post){
                if( post.url == location.pathname){
                    current = post;
                    return false;
                }
                return true;
            })
            .forEach(function(post){
                post.similarity = pv[post.url] ? 0 
                    : cosine(post.tags, current.tags); 
                if(!mostSimilar || mostSimilar.similarity < post.similarity){
                    mostSimilar = post;
                }
                return post;
            });

            var $recommend = $('.recommend');
            $(window).scroll(function(){
                if($recommend.hasClass('in')) return;

                var article = $('article').get(0);
                var total = article.clientHeight + article.offsetTop;
                var scroll = document.body.scrollTop + window.innerHeight;
                var icon = $('<i>').addClass('fa fa-hand-o-right');

                if(total - scroll < 200){
                    $recommend
                        .addClass('in')
                        .find('.post-link')
                        .attr('href', mostSimilar.url)
                        .append(icon)
                        .append(mostSimilar.title);
                }
            });
        });
    }
    function cosine(lhs, rhs){
        var lhsSet = {};
        lhs.forEach(function(i){
            lhsSet[i] = true;
        });
        var count = 0;
        rhs.forEach(function(i){
            if(lhsSet[i]) count++;
        });
        return count / Math.sqrt(lhs.length) / Math.sqrt(rhs.length);
    }
    function recordPageView(){
        var pv = getPageView();
        var k = location.pathname;
        pv[k] = (pv[k] || 0) + 1;
        window.sessionStorage.setItem('pv', JSON.stringify(pv));
    }
    function getPageView(){
        var str = window.sessionStorage.getItem('pv');
        return str ? JSON.parse(str) : {};
    }
};
