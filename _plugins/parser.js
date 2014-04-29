#!/usr/bin/env node

marktex = require("marktex")
hljs = require("highlight.js")

console.log(marktex(process.argv[2],
	{
    smartlist: false,
		highlight: function(code, lang){
      if(lang)
			  return '<code class="hljs">'+hljs.highlight(lang,code).value+'</code>';
      else
        return '<code class="hljs">'+hljs.highlightAuto(code).value+'</code>';
		},
		math: function(math,inline,lang){
			if (inline) {
				return '<span class="mathjax">\\('+math+'\\)</span>';
				}
			else
				return '<div class="mathjax">\\['+math+'\\]</div>';
		}
	}))
