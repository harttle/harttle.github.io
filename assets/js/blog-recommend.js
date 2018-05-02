(function () {
    recordPageView();
    initRecommends();
    function initRecommends () {
        fetch('/api/posts.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (posts) {
                if (typeof posts === 'string') {
                    posts = JSON.parse(posts);
                }
                if (posts.length < 2) return;

                var current;
                var mostSimPosts = [];
                var pv = getPageView();
                posts
                    .filter(function (post) {
                        if (post.url === location.pathname) {
                            current = post;
                            return false;
                        }
                        return post.tags.length !== 0;
                    })
                    .forEach(function (post) {
                        if (!current) return;
                        post.sim = pv[post.url] ? 0 : cosine(post.tags, current.tags);

                        for (var i = 0; i < mostSimPosts.length; i++) {
                            var inqueuePost = mostSimPosts[i];
                            if (inqueuePost.sim < post.sim) {
                                mostSimPosts.splice(i, 0, post);
                                post = null;
                                break;
                            }
                        }
                        post && mostSimPosts.push(post);
                        while (mostSimPosts.length > 3) {
                            mostSimPosts.pop();
                        }
                    });

                console.log('similar posts:', mostSimPosts);

                var prevEl = document.querySelector('.post-pager .previous');
                var nextEl = document.querySelector('.post-pager .next');

                var prevUrl = prevEl && prevEl.getAttribute('href');
                var nextUrl = nextEl && nextEl.getAttribute('href');
                if (mostSimPosts.length && prevUrl === mostSimPosts[0].url) {
                    mostSimPosts.shift();
                }
                if (mostSimPosts.length && nextUrl === mostSimPosts[0].url) {
                    mostSimPosts.shift();
                }
                if (mostSimPosts.length) {
                    var post = mostSimPosts[0];
                    var link = document.querySelector('.post-pager .recommend');
                    link.setAttribute('href', post.url);
                    link.textContent = '推荐阅读：' + post.title;
                    link.style.display = 'block';
                } else {
                    console.info('no similar posts found, recommendation disabled');
                }
            });
    }
    function cosine (lhs, rhs) {
        var lhsSet = {};
        lhs.forEach(function (i) {
            lhsSet[i] = true;
        });
        var count = rhs.filter(function (i) { return lhsSet[i]; }).length;
        return count / Math.sqrt(lhs.length) / Math.sqrt(rhs.length);
    }
    function recordPageView () {
        var pv = getPageView();
        var k = location.pathname;
        pv[k] = (pv[k] || 0) + 1;
        window.sessionStorage.setItem('pv', JSON.stringify(pv));
    }
    function getPageView () {
        var str = window.sessionStorage.getItem('pv');
        return str ? JSON.parse(str) : {};
    }
})();
