#!/usr/bin/node

fs = require('fs');
marktex = require('../');
opt = require('optimist')
  .usage('Parse markdown text to html (https://github.com/buddys/marktex).\nUsage: $0')
  .options('f',{
    alias: 'file',
    describe: 'Load a file'
  })
  .options('o',{
    alias: 'out',
    describe: 'Output to a file'
  })
  .options('h',{
    alias: 'help',
    describe: 'Show this help'
  })
  .options('gfm',{
    default: true,
    describe: 'Enable [GitHub flavored markdown](https://help.github.com/articles/github-flavored-markdown)',
    boolean: true
  })
  .options('tables',{
    default: true,
    describe: 'Enable GFM tables. Requires the `gfm` option to be true',
    boolean: true
  })
  .options('todo',{
    default: true,
    describe: 'Enable GFM todo. Requires the `gfm` option to be true.',
    boolean: true
  })
  .options('breaks',{
    default: true,
    describe: 'Enable GFM line breaks. Requires the `gfm` option to be true.',
    boolean: true
  })
  .options('marktex',{
    default: true,
    describe: 'Enable [MarkTex](http://buddys.github.io/marktex/), features include task-list, math interface, para-alignment, smarter list ,etc.',
    boolean: true
  })
  .options('smartlist',{
    default: false,
    describe: 'Smarter list rendering. Different symbol in unsorted list, and consecutive `\n` in all list, will split lists. Requires the `marktex` option to be true.',
    boolean: true
  })
  .options('smartquote',{
    default: true,
    describe: 'Smarter blockquote rendering. Consecutive `\n` will split blockquote. Requires the `marktex` option to be true.',
    boolean: true
  })
  .options('align',{
    default: true,
    describe: 'Enable paragraph alignment. Requires the `marktex` option to be true.',
    boolean: true
  })
  .options('pedantic',{
    default: false,
    describe: 'Conform to original markdown, do not fix any of bugs or poor behavior.',
    boolean: true
  })
  .options('sanitize',{
    default: false,
    describe: 'Ignore any HTML that has been input.',
    boolean: true
  })
  .options('smartypants',{
    default: false,
    describe: 'Use "smart" typograhic punctuation for things like quotes and dashes.',
    boolean: true
  });
argv = opt.argv;

if(argv.h){
  console.log(opt.help());
  return;
}

var text = '';
if(argv.f)
  fs.readFile(argv.f, function(err,data){
    text = data.toString();
    parse();
  });
else{
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function(chunk) {
    text += chunk;
  });

  process.stdin.on('end', function() {
    parse();
  });
}

function parse(){
//  console.log(argv);
//  console.log(text);
  var html = marktex(text, argv);
  if(argv.o) fs.writeFile(argv.o, html);
  else console.log('\n\n'+html);
}

