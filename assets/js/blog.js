document.addEventListener('DOMContentLoaded', function () {
  recordPageView()
  initTOC()
  initRecommends()

  function initTOC () {
    var toc = getTOC($('.md'))
    var $toc = $('.toc')
    if (toc) {
      $toc.append(toc)

      // toc affix, this offset is for toc position recognition
      setTimeout(function () {
        $toc.affix({
          offset: {
            top: function () {
              var offsetTop = $toc.offset().top
              return (this.top = offsetTop - 40)
            },
            bottom: function () {
              return (this.bottom = $(document).height() - $('.md').offset().top - $('.md').height())
            }
          }
        })
      }, 100)

      // toc scroll spy
      $('body').scrollspy({
        target: '.toc',
        offset: 10 // make sure to spy the element when scrolled to
      })
    } else {
      $('article').addClass('collapsed')
    }

    $(window).resize(function () {
      $('body').scrollspy('refresh')
    })
  }

  function getTOC ($content) {
    var $toc = $('<ul class="nav level-0 list-unstyled">').addClass('nav sidenav')

    var baseLevel = 1
    while ($content.find('h' + baseLevel).length < 1 && baseLevel < 7) baseLevel += 1
    if (baseLevel === 7) return null

    $content.find(':header').each(function (i) {
      var $this = $(this)
      $this.attr('id', i)

      var level = parseInt(this.nodeName.substr(1))
      var offset = level - baseLevel

      var li = new $('<li/>')
        .append('<a href="#' + i + '" class="animate">' + $this.text() + '</a>')
        .append($('<ul class="nav list-unstyled level-' + (offset + 1) + '"/>'))

      $('<div>').append($toc).find('ul.level-' + offset + ':last').append(li)
    })
    // remove empty ul
    $toc.find('ul').not(':parent').remove()
    return $toc
  }

  function initRecommends () {
    $.get('/api/posts.json').done(function (posts) {
      if (typeof posts === 'string') {
        posts = JSON.parse(posts)
      }
      if (posts.length < 2) return

      var current
      var mostSim = null
      var secondSim = null
      var thirdSim = null
      var pv = getPageView()
      posts
        .filter(function (post) {
          if (post.url === location.pathname) {
            current = post
            return false
          }
          if (post.tags.length === 0) {
            return false
          }
          return true
        })
        .forEach(function (post) {
          if (!current) return
          post.sim = pv[post.url] ? 0
              : cosine(post.tags, current.tags)
          if (!thirdSim || thirdSim.sim < post.sim) {
            thirdSim = post
          }
          if (!secondSim || secondSim.sim < thirdSim.sim) {
            secondSim = thirdSim
            thirdSim = null
          }
          if (!mostSim || mostSim.sim < secondSim.sim) {
            mostSim = secondSim
            secondSim = null
          }
          return post
        })

      console.log('similar posts:', mostSim, secondSim, thirdSim)

      if (!mostSim) {
        console.info('no similar posts found, recommendation disabled')
        return
      }
      var $recommend = $('.recommend')
      $(window).scroll(function () {
        if ($recommend.hasClass('in')) return

        var article = $('.md').get(0)
        var total = article.clientHeight + article.offsetTop
        var scroll = document.body.scrollTop + window.innerHeight
        var icon = $('<i>').addClass('fa fa-hand-o-right')

        if (total - scroll > 200) {
          return
        }
        $recommend
          .addClass('in')
          .find('.post-link')
          .attr('href', mostSim.url)
          .append(icon)
          .append(mostSim.title)
      })
    })
  }
  function cosine (lhs, rhs) {
    var lhsSet = {}
    lhs.forEach(function (i) {
      lhsSet[i] = true
    })
    var count = 0
    rhs.forEach(function (i) {
      if (lhsSet[i]) count++
    })
    return count / Math.sqrt(lhs.length) / Math.sqrt(rhs.length)
  }
  function recordPageView () {
    var pv = getPageView()
    var k = location.pathname
    pv[k] = (pv[k] || 0) + 1
    window.sessionStorage.setItem('pv', JSON.stringify(pv))
  }
  function getPageView () {
    var str = window.sessionStorage.getItem('pv')
    return str ? JSON.parse(str) : {}
  }
})
