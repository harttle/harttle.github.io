
window.modules.taglist = function(console, $ele, name){
    var $li = $ele.find('li');

    quicksort(0, $li.length);
    $ele.fadeIn();
    updateHref();

    function updateHref(){
        $li.each(function(idx, ele){
            var $ele = $(ele).find('a'), name = $ele.html().split('(')[0].trim();
            $ele.attr('href', '/tags.html?tag=' + encodeURIComponent(name));
        });
    }
    function swap(i, j){
        var l1 = $li.eq(i), l2 = $li.eq(j), tmp = l1.html();
        l1.html(l2.html());
        l2.html(tmp);
    }
    function val(i){
        return parseInt($li.eq(i).find('a').html().match(/\((\d+)\)\s*$/)[1]);
    }
    function text(i){
        return $li.eq(i).find('a').html().trim();
    }
    function quicksort(begin, end){
        if(end-begin<=1) return;

        var ran = Math.floor(Math.random()*(end-begin)) + begin;
        swap(ran, end-1);

        var pivot = end-1, lessEnd = begin, vpivot = val(pivot);
        for(var i=begin; i<end-1; i++){
            if(val(i) > vpivot) swap(i, lessEnd++);
        }
        swap(pivot, lessEnd);
        quicksort(begin, lessEnd);
        quicksort(lessEnd+1, end);
    }
};
