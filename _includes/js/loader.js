window.modules = {};

$(function() {
    var enabled = {};
    $('[class|=module]').each(function(i, ele) {
        var mod, $ele = $(ele);
        $ele.attr('class').split(' ').map(function(cls){
            var mt = cls.match(/^module-(\w+)/);
            mod = mt && mt[1] || mod;
        });

        if(enabled[mod]) return;
        else enabled[mod] = true;

        var ctrl = window.modules[mod];
        if (typeof ctrl !== 'function') return;

        console.log('[module]', 'loading', mod);
        ctrl(conslFactory(mod), $ele);
    });

    function conslFactory(mod) {
        return {
            log: console.log.bind(console, '[' + mod + ']'),
            info: console.info.bind(console, '[' + mod + ']'),
            warn: console.warn.bind(console, '[' + mod + ']'),
            error: console.error.bind(console, '[' + mod + ']'),
        };
    }
});
