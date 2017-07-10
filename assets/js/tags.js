(function () {
  var Highcharts = window.Highcharts

  // lib config
  setHighchartsRadiationColors()

  // post/tag parsing
  var $btnPie = $('#tags-display-toggle .btn-pie')
  var $btnCloud = $('#tags-display-toggle .btn-cloud')
  var $btns = $('#tags-display-toggle .btn')
  var $btnList = $('#tags-display-toggle .btn-list')
  var $currentTag = $('#current-tag')
  var $tagContainer = $('.tag-container')
  var $tagPie = $('.tag-pie')
  var $tagList = $('.tag-list')
  var $tagCloud = $('.tag-cloud')
  var $postList = $('.post-list')

  $.when(getTags(), getPosts()).done(function (tags, posts) {
    showCloud(tags)
    initList()

    $tagContainer.on('click', 'span', function (e) {
      var tag = $(e.target).data('tag')
      tag && onTagSelected(tag)
    })

    $btnCloud.click(function () {
      hidePie()
      hideList()
      showCloud(tags)
    })
    $btnPie.click(function () {
      hideCloud()
      hideList()
      showPie(tags, onTagSelected)
    })
    $btnList.click(function () {
      hideCloud()
      hidePie()
      showList(tags)
    })

    function initList () {
      var selectedTag = decodeURIComponent(location.hash.replace('#', ''))
      if (selectedTag) setTag(posts, selectedTag)
      else updateList(posts.slice(0, 30), true)
    }

    function onTagSelected (tag) {
      setTag(posts, tag)
      $('body').animate({
        scrollTop: $('.right-panel').offset().top
      }, 500)
    }
  })

                    // functions
  function setTag (posts, tag) {
    var selectedPosts = searchByTag(posts, tag)
    updateList(selectedPosts)
    updateCurrentTag(tag, selectedPosts.length)
    location.hash = tag

    function searchByTag (posts, tag) {
      return posts.filter(function (post) {
        return post.tagstr.indexOf(',' + tag.toLowerCase() + ',') > -1
      })
    }

    function updateCurrentTag (tag, count) {
      $('head title').html('技术标签：' + tag + '（' + count + '）')
      $currentTag.html(tag + '(' + count + ')')
    }
  }

  function updateList (posts, disableAnimation) {
    var $lis = posts.map(function (p) {
      var $li = $('<li>', {
        class: 'clearfix'
      })
      var $anchor = $('<a>', {
        href: p.url
      }).html(p.title)
      var $time = $('<time>').html(p.date)
      var $title = $('<div>').append($anchor)
      return $li.append($time).append($title)
    })
    $postList.hide().html('').append($lis)
    if (disableAnimation) $postList.show()
    else $postList.fadeIn()
  }

  function showList (tags) {
    $btnList.addClass('active')
    $tagList.html('').append(tags.map(function (tag) {
      return $('<span>', {
        class: 'tag'
      })
      .data('tag', tag.name)
      .html(tag.name + '(' + tag.count + ')')
    }))
    $tagList.fadeIn()
  }

  function hideList () {
    $btnList.removeClass('active')
    $tagList.fadeOut().html('')
  }

  function showPie (tags, onTagSelected) {
    $btnPie.addClass('active')
    var options = getTagPieOptions(tags.slice(0, 20), function () {
      onTagSelected(this.name)
    })
    $tagPie.html('').show().highcharts(options)
  }

  function hidePie () {
    $btnPie.removeClass('active')
    $tagPie.hide().html('')
  }

  function showCloud (tags) {
    var displayTags = getTagCloudTags(tags)
    var options = getTagCloudOptions(function () {
      $btns.attr('disabled', false)
    })
    $btns.attr('disabled', true)
    $tagCloud.html('').show().jQCloud(displayTags, options)
    $btnCloud.addClass('active')
  }

  function hideCloud () {
    $btnCloud.removeClass('active')
    $tagCloud.html('').removeAttr('style').hide()
  }

  function getPosts () {
    return $.get('/api/posts.json').then(function (posts) {
      posts.forEach(function (post) {
        post.tagstr = ',' + post.tags.join(',').toLowerCase() + ','
      })
      return posts
    })
  }

  function getTags () {
    return $.get('/api/tags.json').then(function (tags) {
      return tags.sort(function (lhs, rhs) {
        return rhs.count - lhs.count
      })
    })
  }

  function getTagCloudTags (rawTags) {
    var norm = 0
    var offset = 0
    var last = -1
    var tags = rawTags.slice(0, 100).map(function (raw) {
      var wt = Math.log2(raw.count + 1)
      norm = Math.max(norm, wt)
      return {
        text: raw.name,
        count: raw.count,
        weight: wt,
        afterWordRender: function () {
          this.data('tag', raw.name)
        }
      }
    })
    .map(function (tag) {
      tag.weight *= 10 / norm
      return tag
    })
    .map(function (tag) {
      var cur = Math.round(tag.weight)
      if (last !== -1 && cur < last - 1) { offset += last - cur - 1 }
      tag.weight += offset
      last = cur
      return tag
    })
    return tags
  }

  function getTagCloudOptions (afterRender) {
    return {
      afterCloudRender: afterRender
    }
  }

  function getTagPieOptions (tags, clickCallback) {
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
        enabled: false
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          point: {
            events: {
              click: clickCallback
            }
          },
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.y}',
            style: {
              color: Highcharts.theme ? Highcharts.theme.contrastTextColor : 'black'
            },
            connectorColor: 'silver'
          }
        }
      },
      series: [{
        name: 'Tags',
        data: tags.map(function (tag) {
          return {
            name: tag.name,
            y: tag.count
          }
        })
      }]
    }
    return chartOptions
  }

  function setHighchartsRadiationColors () {
    // Radiation Configuration
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
      }
    })
  }
})()
