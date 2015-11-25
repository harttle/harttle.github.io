window.modules.tags = function (console, $ele) {
    var posts = parsePosts(getRawArray('script#posts-data')),
        tags = parseTags(getRawArray('script#tags-data'));

        initTagCloud(tags);

        var tag = location.query('tag');
        if(tag){
            updateList(searchByTag(tag));
        }
        else{
            updateList(posts.slice(0, 30));
        }

        $('.tag-cloud').on('click', 'span', function(e){
            var $span = $(e.target),
                tag = $span.html();
                updateList(searchByTag(tag));
            location.query('tag', tag);
        });

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
                    weight: wt
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
                //shape: 'rectangular',
                removeOverflowing: true
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

