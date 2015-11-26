window.modules.tags = function (console, $ele) {
    var posts = parsePosts(getRawArray('script#posts-data'));
    var tags = parseTags(getRawArray('script#tags-data'));
    var selectedSpan = null, selectedTag = null, dirty = false;

    initTagCloud(tags);

    var tag = location.query('tag');
    if(tag){
        setSelected(tag);
    }
    else{
        updateList(posts.slice(0, 30));
    }

    $('.tag-cloud').on('click', 'span', function(e){
        var $span = $(e.target);
        setSelected($span.html());
    });

    function setSelected(tag){
        selectedTag = tag;
        updateList(searchByTag(tag));
        location.query('tag', tag);
        $body.animate({
            scrollTop: $('.right-panel').offset().top
        }, 500);
        if(!updateSpan().length){
            dirty = true;
        }
    }

    function updateSpan(){
        var $span = $('.tag-cloud span[data-tag="'+selectedTag+'"]');
        if(selectedSpan) selectedSpan.removeClass('glowing');
        selectedSpan = $span.addClass('glowing');
        return selectedSpan;
    }

    function afterCloudRender(){
        if(!dirty) return;
        updateSpan();
        dirty = false;
    }

    function updateList(ps){
        var $ul = $('<ul>');
        ps.map(function(p){
            var $li = $('<li>');
            var $time = $('<time>').html(p.date);
            var $anchor = $('<a>', { href: p.url}).html(p.title);
            $li.append($time).append($anchor);
            $ul.append($li);
        });
        $('.post-list').html($ul.html());
    }

    function searchByTag(tag){
        return posts.filter(function(post){
            return post.tagstr.indexOf(tag + ',') > -1;
        });
    }

    function getRawArray(query){
        return $(query).html()
        .split(';')
        .filter(notEmpty)
        .map(function (item) {
            return item.split('&').map(trim);
        });
    }

    function parsePosts(rawPosts){
        return rawPosts.map(function(raw){
            return {
                title: raw[0],
                date: parseDate(raw[1]),
                url: raw[2],
                tags: raw[3].split(',').filter(notEmpty).map(trim),
                tagstr: raw[3] + ','
            };
        });
    }

    function parseTags(rawTags){
        var norm = 0, offset = 0, last = -1;
        var tags = rawTags
        .sort(function(lhs, rhs){
            return rhs[1] - lhs[1];
        })
        .slice(0, 100)
        .map(function (raw) {
            var wt = Math.log2(parseInt(raw[1])+1);
            norm = Math.max(norm, wt);
            return {
                text: raw[0],
                rawWeight: raw[1],
                weight: wt,
                afterWordRender: function(){
                    this.attr('data-tag', raw[0]);
                }
            };
        })
        .map(function(tag){
            tag.weight *= 10/norm;
            return tag;
        })
        .map(function(tag){
            var cur = Math.round(tag.weight);
            if(last !== -1 && cur < last-1){
                offset += last - cur - 1;
            } 
            tag.weight += offset;
            last = cur;
            return tag;
        });
        return tags;
    }

    function zeros(n){
        var ret = [];
        for(var i=0; i<n; i++){
            ret.push(0);
        }
        return ret;
    }

    function initTagCloud(tags){
        $('.tag-cloud').jQCloud(tags, {
            removeOverflowing: true,
            afterCloudRender: afterCloudRender
        });
    }

    function parseDate(date){
        var tokens = date.split('-');
        return tokens[0] + '年' + tokens[1] + '月' + tokens[2] + '日';
    }

    function trim(item){
        return item.trim();
    }
    function notEmpty(item){
        return item.trim() !== '';
    }
};

