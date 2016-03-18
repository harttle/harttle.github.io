window.modules.taglist = function(console, $ele, name) {
    var $li = $ele.find('.tag'),
        pattern = /[^\(]+\((\d+)\)/;

    quicksort(0, $li.length);
    $ele.fadeIn();

    function swap(i, j) {
        var l1 = $li.eq(i),
            l2 = $li.eq(j),
                tmp = l1.html();
                l1.html(l2.html());
                l2.html(tmp);
    }

    function val(i) {
        var match = $li.eq(i).html().match(pattern);
        return parseInt(match[1]);
    }

    function quicksort(begin, end) {
        if (end - begin <= 1) return;

        var ran = Math.floor(Math.random() * (end - begin)) + begin;
        swap(ran, end - 1);

        var pivot = end - 1,
            lessEnd = begin,
                vpivot = val(pivot);
                for (var i = begin; i < end - 1; i++) {
                    if (val(i) > vpivot) swap(i, lessEnd++);
                }
                swap(pivot, lessEnd);
                quicksort(begin, lessEnd);
                quicksort(lessEnd + 1, end);
    }
};
