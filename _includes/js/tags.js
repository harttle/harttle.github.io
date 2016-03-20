window.modules.tags = function (console, $ele) {
    // lib config
    setHighchartsRadiationColors();

    // post/tag parsing
    var $toggle = $('#tags-display-toggle'), 
        $currentTag = $('#current-tag'), 
        $tagChart = $('.tag-chart'),
        $tagCloud = $('.tag-cloud'),
        posts, tags;

    $.when(getTags(), getPosts()).done(function(ts, ps){
        posts = ps;
        tags = ts;
        showCloud(tags);
        initList();
    });

    $tagCloud.on('click', 'span', function(e){
        var $span = $(e.target);
        setTag($span.html());
    });

    $toggle.click(function(){
        if($tagCloud.is(':visible')){
            hideCloud();
            showChart();
        } 
        else{
            hideChart();
            showCloud(tags);
        } 
    });

    // functions
    function onTagSelected(tag){
        setTag(tag);
        $body.animate({
            scrollTop: $('.right-panel').offset().top
        }, 500);
    }

    function setTag(tag){
        var selectedPosts = searchByTag(tag); 
        updateList(selectedPosts);
        updateCurrentTag(tag, selectedPosts.length);
        location.hash = tag;
    }

    function updateList(posts, disableAnimation){
        var $ul = $('<ul>'), $list = $('.post-list');
        $list.hide();
        posts.map(function(p){
            var $li = $('<li>', {class: 'clearfix'}),
                $anchor = $('<a>', { href: p.url}).html(p.title),
                $time = $('<time>').html(p.date),
                $title = $('<div>').append($anchor);
            $ul.append($li.append($time).append($title));
        });
        $list.html($ul.html());
        if(disableAnimation) $list.show();
        else $list.fadeIn();
    }

    function initList(){
        var selectedTag = location.hash.replace('#', '');
        if(selectedTag ) onTagSelected(selectedTag, true);
        else updateList(posts.slice(0, 30), true);
    }

    function showChart(){
        var options = getTagChartOptions(tags.slice(0, 20), function(){
            onTagSelected(this.name);
        });
        $tagChart.show().highcharts(options);
    }

    function hideChart(){
        $tagChart.hide().html('');
    }

    function showCloud(tags){
        var displayTags = getTagCloudTags(tags),
            options = getTagCloudOptions(function(){ 
                $toggle.addClass('shown'); 
            });
        $toggle.removeClass('shown');
        $tagCloud.show().jQCloud(displayTags, options);

    }

    function hideCloud(tags){
        $tagCloud.html('').removeAttr('style').hide();
    }

    function searchByTag(tag){
        return posts.filter(function(post){
            return post.tagstr.indexOf(',' + tag + ',') > -1;
        });
    }

    function getPosts(){
        return $.get('/posts.json').then(function(posts){
            posts.forEach(function(post){
                post.tagstr = ',' + post.tags.join(',') + ',';
            });
            return posts;
        });
    }

    function getTags(){
        return $.get('/tags.json').then(function(tags){
            return tags.sort(function(lhs, rhs){
                return rhs.count - lhs.count;
            });
        });
    }

    function getTagCloudTags(rawTags){
        var norm = 0, offset = 0, last = -1;
        var tags = rawTags.slice(0, 100).map(function (raw) {
            var wt = Math.log2(raw.count+1);
            norm = Math.max(norm, wt);
            return {
                text: raw.name,
                count: raw.count,
                weight: wt,
                afterWordRender: function(){
                    //this.addClass('tag');
                }
            };
        })
        .map(function(tag){
            tag.weight *= 10/norm;
            return tag;
        })
        .map(function(tag){
            var cur = Math.round(tag.weight);
            if(last !== -1 && cur < last-1)
                offset += last - cur - 1;
            tag.weight += offset;
            last = cur;
            return tag;
        });
        return tags;
    }

    function getTagCloudOptions(afterRender){
        return {
            afterCloudRender: afterRender
        };
    }

    function getTagChartOptions(tags, clickCallback){
        var chartOptions = {
            title: { text: '' },
            credits: { enabled: false },
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            tooltip: { enabled: false, },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    point: {
                        events: { click: clickCallback }
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
                data: tags.map(function(tag){
                    return { name: tag.name, y: tag.count };
                })
            }]
        };
        return chartOptions;
    }

    function updateCurrentTag(tag, count){
        $('head title').html('技术标签：' + tag + '（'+ count + '）');
        $currentTag.html(tag + '('+count+')');
    }

    function setHighchartsRadiationColors(){
        // Radiation Configuration
        Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
            return {
                radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                ]
            };
        });
    }
};
