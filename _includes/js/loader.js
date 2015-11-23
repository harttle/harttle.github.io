window.modules = {};

$(function() {
    resolve(function(mod){
        var ctrl = window.modules[mod];
        if(typeof ctrl !== 'function') return;
        ctrl(conslFactory(mod), $('[class*=module-'+mod+']'), mod);
        console.log('[loader]', mod, 'loaded');
    });

    function conslFactory(mod) {
        return {
            log: console.log.bind(console, '[' + mod + ']'),
            info: console.info.bind(console, '[' + mod + ']'),
            warn: console.warn.bind(console, '[' + mod + ']'),
            error: console.error.bind(console, '[' + mod + ']'),
        };
    }
    function resolve(cb){
        var enabled = {};
        $('[class*=module-]').each(function(i, ele) {
            $(ele).attr('class').split(' ').map(function(cls){
                var mt = cls.match(/^module-(\w+)/),
                    mod = mt && mt[1];

                if(!mod) return;
                if(enabled[mod]) return;
                else enabled[mod] = true;

                cb(mod);
            });
        });
    }
});
