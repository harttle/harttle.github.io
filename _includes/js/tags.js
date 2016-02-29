window.modules.tags = function (console, $ele) {
    var posts = parsePosts(getRawArray('script#posts-data'));
    var tags = parseTags(getRawArray('script#tags-data'));

    // Tag Cloud

    var selectedSpan = null, selectedTag = null, dirty = false,
        $tagCloud = $('.tag-cloud');

    initTagCloud(tags);

    var tag = location.query('tag');
    if(tag) setSelected(tag);
    else updateList(posts.slice(0, 30));

    $tagCloud.on('click', 'span', function(e){
        var $span = $(e.target);
        setSelected($span.html());
    });

    function setSelected(tag){
        selectedTag = tag;
        var posts = searchByTag(tag);
        updateList(posts);
        updateTitle(tag, posts.length);
        location.query('tag', tag);
        $body.animate({
            scrollTop: $('.right-panel').offset().top
        }, 500);
        if(!updateSpan().length){
            dirty = true;
        }
    }

    function updateTitle(tag, count){
        var text = '技术标签：' + tag + '（'+ count + '）';
        $('head title').html(text);
        $('.page-title').html(text);
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
            var $li = $('<li>', {class: 'clearfix'}),
                $anchor = $('<a>', { href: p.url}).html(p.title),
                    $time = $('<time>').html(p.date),
                        $title = $('<div>').append($anchor);
                        $ul.append($li.append($time).append($title));
        });
        $('.post-list').html($ul.html());
    }

    function searchByTag(tag){
        return posts.filter(function(post){
            return post.tagstr.indexOf(',' + tag + ',') > -1;
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
                date: raw[1],
                url: raw[2],
                tags: raw[3].split(',').filter(notEmpty).map(trim),
                tagstr: ',' + raw[3] + ','
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
                count: parseInt(raw[1]),
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
            // removeOverflowing: true,
            // shape: 'rectangular',
            afterCloudRender: afterCloudRender,
            autoResize: true
        });
    }

    function trim(item){
        return item.trim();
    }
    function notEmpty(item){
        return item.trim() !== '';
    }

    // Tag Charts

    // Radialize the colors
    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
        return {
            radialGradient: {
                cx: 0.5,
                cy: 0.3,
                r: 0.7
            },
            stops: [
                [0, color],
                [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
            ]
        };
    });

    // Build the chart
    var zones = tags.slice(0, 20), $tagChart = $('.tag-chart');
    zones = zones.map(function(tag){
        return {
            name: tag.text,
            y: tag.count
        };
    });
    var chartOptions = {
        title: {
            text: '' 
        },
        credits: {
            enabled: false
        },
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        tooltip: {
            enabled: false,
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (e) {
                            setSelected(this.name);
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.y}',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    },
                    connectorColor: 'silver'
                }
            }
        },
        series: [{
            name: 'Tags',
            data: zones
        }]
    };

    // Toggle Logic
    var $toggle = $('.toggle'), tagCloudShown = true;
    $toggle.click(function(){
        $tagCloud.fadeToggle();
        if(tagCloudShown){
            $tagChart.show();
            $tagChart.highcharts(chartOptions);
        }
        else{
            $tagChart.html('');
        }
        tagCloudShown = !tagCloudShown;
    });
};

