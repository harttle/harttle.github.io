(function () {
    var md = document.querySelector('.md');
    var asideTOC = window.asideTOC;
    initTOC();

    function initTOC () {
        var toc = generateTOC(md);
        var article = document.querySelector('article');
        if (!toc) {
            article.classList.add('collapsed');
            return;
        }
        asideTOC.appendChild(toc);

        var topLimit = 406;
        window.addEventListener('scroll', scrollSpy);

        function scrollSpy () {
            var cls = window.pageYOffset < topLimit ? 'affix-top' : 'affix';
            asideTOC.setAttribute('class', cls);

            var lastPassedAnchor;
            Array.prototype.forEach.call(asideTOC.querySelectorAll('a'), function (anchor) {
                var href = anchor.getAttribute('href');
                var heading = document.querySelector(href);
                if (window.pageYOffset > heading.offsetTop - 20) {
                    lastPassedAnchor = anchor;
                }
                anchor.parentNode.removeAttribute('class');
            });
            while (lastPassedAnchor) {
                lastPassedAnchor.parentNode.classList.add('active');
                lastPassedAnchor = lastPassedAnchor.parentNode.parentNode.previousElementSibling;
            }
        }
    }

    function generateTOC (content) {
        var toc = document.createElement('ul');
        toc.setAttribute('class', 'nav level-0 list-unstyled sidenav');

        var baseLevel = 1;
        while (!content.querySelector('h' + baseLevel) && baseLevel < 7) baseLevel += 1;
        if (baseLevel === 7) return null;

        Array.prototype.forEach.call(content.querySelectorAll('h1,h2,h3,h4,h5,h6'), function (header, i) {
            var id = 'header-' + i;
            header.setAttribute('id', id);

            var level = parseInt(header.nodeName.substr(1));
            var offset = level - baseLevel;

            var li = document.createElement('li');
            li.innerHTML = '<a href="#' + id + '">' + header.textContent + '</a>' +
        '<ul class="nav list-unstyled level-' + (offset + 1) + '"/>';

            var container = document.createElement('div');
            container.appendChild(toc);
            var parents = container.querySelectorAll('ul.level-' + offset);
            parents[parents.length - 1].appendChild(li);
        });
        return toc;
    }
})();
