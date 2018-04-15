document.addEventListener('DOMContentLoaded', function () {
  var md = document.querySelector('.md')
  recordPageView()
  initTOC()
  initRecommends()

  function initTOC () {
    var toc = generateTOC(md)
    var header = document.querySelector('.blog-header')
    var article = document.querySelector('article')
    if (!toc) {
      article.classList.add('collapsed');
      return
    }
    asideTOC.appendChild(toc)

    var topLimit
    updateTopLimit()
    window.addEventListener('resize', updateTopLimit)
    window.addEventListener('scroll', function () {
      var cls = window.pageYOffset < topLimit ? 'affix-top' : 'affix'
      asideTOC.setAttribute('class', cls)

      var lastPassedAnchor
      Array.prototype.forEach.call(asideTOC.querySelectorAll('a'), function (anchor) {
        var href = anchor.getAttribute('href')
        var heading = document.querySelector(href)
        if (window.pageYOffset > heading.offsetTop - 20) {
          lastPassedAnchor = anchor
        }
        anchor.parentNode.removeAttribute('class')
      })
      while (lastPassedAnchor) {
        lastPassedAnchor.parentNode.classList.add('active')
        lastPassedAnchor = lastPassedAnchor.parentNode.parentNode.previousElementSibling
      }
    })
    function updateTopLimit() {
      topLimit = header.offsetTop + header.offsetHeight - 70
    }
  }

  function generateTOC (content) {
    var toc = document.createElement('ul')
    toc.setAttribute('class', 'nav level-0 list-unstyled sidenav')

    var baseLevel = 1
    while (!content.querySelector('h' + baseLevel) && baseLevel < 7) baseLevel += 1
    if (baseLevel === 7) return null

    Array.prototype.forEach.call(content.querySelectorAll('h1,h2,h3,h4,h5,h6'), function (header, i) {
      var id = 'header-' + i
      header.setAttribute('id', id)

      var level = parseInt(header.nodeName.substr(1))
      var offset = level - baseLevel

      var li = document.createElement('li')
      li.innerHTML= '<a href="#' + id + '">' + header.textContent + '</a>' +
        '<ul class="nav list-unstyled level-' + (offset + 1) + '"/>'

      var container = document.createElement('div')
      container.appendChild(toc)
      var parents = container.querySelectorAll('ul.level-' + offset)
      parents[parents.length - 1].appendChild(li)
    })
    return toc
  }

  function initRecommends () {
    fetch('/api/posts.json')
    .then(function (response) {
      return response.json()
    })
    .then(function (posts) {
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
          post.sim = pv[post.url] ? 0 : cosine(post.tags, current.tags)
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

      if (mostSim) {
        var link = document.querySelector('.post-pager .recommend')
        link.setAttribute('href', mostSim.url)
        link.textContent = '推荐阅读：' + mostSim.title
        link.style.display = 'block'
      } else {
        console.info('no similar posts found, recommendation disabled')
      }
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
