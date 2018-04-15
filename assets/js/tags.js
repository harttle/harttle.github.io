(function () {
  var postList = document.querySelector('.post-list')

  Promise.all([getTags(), getPosts()]).then(function (tags, posts) {
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
      currentTag.innerHTML = tag + '(' + count + ')'
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
    postList.style.display = 'none'
    postList.innerHTML = ''
    $lis.each(li => postList.appendChild(li));
    postList.style.display = 'block'
  }

  function showList (tags) {
    btnList.classList.add('active')
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
    btnList.classList.remove('active')
    tagList.style.display = 'none'
    tagList.innerHTML = ''
  }

  function showPie (tags, onTagSelected) {
    btnPie.classList.add('active')
    var options = getTagPieOptions(tags.slice(0, 20), function () {
      onTagSelected(this.name)
    })
    tagPie.innerHTML = ''
    tagPie.style.display = 'block'
    Highcharts.chart(tagPie, options)
  }

  function getPosts () {
    return fetch('/api/posts.json')
    .then(function (res) { return res.json() })
    .then(function (posts) {
      posts.forEach(function (post) {
        post.tagstr = ',' + post.tags.join(',').toLowerCase() + ','
      })
      return posts
    })
  }

  function getTags () {
    return fetch('/api/tags.json')
    .then(function (res) { return res.json() })
    .then(function (tags) {
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
})()
