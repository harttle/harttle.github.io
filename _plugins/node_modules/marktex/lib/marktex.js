/**
* Github Flavored Markdown implementation based on 'marked' from Jeffrey.
*
* Copyright (c) 2013-2016, Harttle. (MIT Licensed)
* https://github.com/buddys/marktex
* 
* With Portions Copyright (c) 2011-2013, Christopher Jeffrey. 
* https://github.com/chjj/marked
*/

(function() {

  // Block-Level Grammar
  var block = {};

  
  // Normal Block Grammar
  block.normal = {
    newline: /^\n+/,
    code: /^( {4}[^\n]+\n*)+/,
    hr: /^( *[-*_]){3,} *(?:\n+|$)/,
    heading: /^(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    lheading: /^([^\n]+)\n(=|-){2,} *(?:\n+|$)/,
    blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
    list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
    html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
    paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
    text: /^[^\n]+/,
    bullet: /(?:[*+-]|\d+\.)/,
    item: /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,
    aligned_paragraph: noop,
    math_fences: noop,
    nptable: noop,
    fences: noop,
    table: noop,
    todo: noop,

    _tag: '(?!(?:'
      + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code' 
      + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo' 
      + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b',
  };


  // GFM Block Grammar
  block.gfm = {
    fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
    nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/,
    todo: /^( *)(?:bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
    todo_bullet: /- *\[[x ]\]/,
  };

  
  // MarkTex Block Grammar
  block.marktex={
    //empty line breaks list
    list: /^( *)(bull) [\s\S]+?(?:hr|\n{1,}(?! )(?!\1bull )\n*|\s*$)/,
    //empty line breaks blockquote
    blockquote: /^( *>[^\n]+(\n[^\n]+)*)+/,
    //aligned paragraph
    aligned_paragraph: /^([^\n>]*[^\n>\\])>(>|\d+|)(?:\n|$)((?:[^\n]+(?:\n|$))*)(?:\n+|$)/,
    //math fences
    math_fences: /^ *(\${2,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  };

  
  // Block Lexer
  function BlockLexer(options) {
    this.tokens = [];
    this.tokens.links = {};
    this.options = merge({}, marktex.defaults, options);
    this.rules = merge({},block.normal);

    //grammar merging
    if (this.options.gfm) {
      var opts = merge({},block.gfm);
      if (!this.options.todo) delete opts.todo;
      if (!this.options.tables){ delete opts.table; delete opts.nptable};
      merge(this.rules, opts);
    }
    if (this.options.marktex) {
      var opts = merge({},block.marktex);
      if(!this.options.smartlist) delete opts.list;
      if(!this.options.smartquote) delete opts.blockquote;
      if(!this.options.align) delete opts.aligned_paragraph;
      merge(this.rules, opts);
    }
    
    // replacing
    this.rules.item = replace(this.rules.item, 'gm')
      (/bull/g, this.rules.bullet)
      ();
    this.rules.list = replace(this.rules.list)
      (/bull/g, this.rules.bullet)
      ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
      ();
    this.rules.html = replace(this.rules.html)
      ('comment', /<!--[\s\S]*?-->/)
      ('closed', /<(tag)[\s\S]+?<\/\1>/)
      ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
      (/tag/g, this.rules._tag)
      ();
    this.rules.paragraph = replace(this.rules.paragraph)
      ('hr', this.rules.hr)
      ('heading', this.rules.heading)
      ('lheading', this.rules.lheading)
      ('blockquote', this.rules.blockquote)
      ('tag', '<' + this.rules._tag)
      ('def', this.rules.def)
      ();
    if (this.options.gfm) {
      this.rules.paragraph = replace(this.rules.paragraph)
        ('(?!', '(?!'
        + this.rules.fences.source.replace('\\1', '\\2') + '|'
        + this.rules.list.source.replace('\\1', '\\3') + '|')
        ();
    }
    if (this.options.gfm && this.options.todo) {
      this.rules.todo = replace(this.rules.todo)
        (/bull/g, this.rules.todo_bullet)
        ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
        ();
    }
  }

  // Static Lex Method
  BlockLexer.lex = function(src, options) {
    var lexer = new BlockLexer(options);
    return lexer.lex(src);
  };

  // Preprocessing
  BlockLexer.prototype.lex = function(src) {
    src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');
    
    return this.token(src, true);
  };

  // Lexing
  BlockLexer.prototype.token = function(src, top) {
    var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

    while (src) {
      // newline
      if (cap = this.rules.newline.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[0].length > 1) {
          this.tokens.push({
            type: 'space'
          });
        }
      }

      // code
      if (cap = this.rules.code.exec(src)) {
        src = src.substring(cap[0].length);
        cap = cap[0].replace(/^ {4}/gm, '');
        this.tokens.push({
          type: 'code',
          text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
        });
        continue;
      }

      // fences (gfm)
      if (cap = this.rules.fences.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'code',
          lang: cap[2],
          text: cap[3]
        });
        continue;
      }

      // math fences (marktex)
      if (cap = this.rules.math_fences.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'math',
          lang: cap[2],
          text: cap[3]
        });
        continue;
      }

      // heading
      if (cap = this.rules.heading.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[1].length,
          text: cap[2]
        });
        continue;
      }

      // table no leading pipe (gfm)
      if (top && (cap = this.rules.nptable.exec(src))) {
        src = src.substring(cap[0].length);

        item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3].replace(/\n$/, '').split('\n')
        };

        for (i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = 'right';
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = 'center';
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }

        for (i = 0; i < item.cells.length; i++) {
          item.cells[i] = item.cells[i].split(/ *\| */);
        }

        this.tokens.push(item);

        continue;
      }

      // lheading
      if (cap = this.rules.lheading.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'heading',
          depth: cap[2] === '=' ? 1 : 2,
          text: cap[1]
        });
        continue;
      }

      // hr
      if (cap = this.rules.hr.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'hr'
        });
        continue;
      }

      // blockquote
      if (cap = this.rules.blockquote.exec(src)) {
        src = src.substring(cap[0].length);

        this.tokens.push({
          type: 'blockquote_start'
        });

        cap = cap[0].replace(/^ *> ?/gm, '');

        // Pass `top` to keep the current
        // "toplevel" state. This is exactly
        // how markdown.pl works.
        this.token(cap, top);

        this.tokens.push({
          type: 'blockquote_end'
        });

        continue;
      }

      // todo(gfm)
      if (cap = this.rules.todo.exec(src)) {
        src = src.substring(cap[0].length);

        this.tokens.push({
          type: 'todo_start',
        });

        // Get each top-level item.
        cap = cap[0].match(this.rules.item);

        l = cap.length;
        i = 0;

        for (; i < l; i++) {
          item = cap[i];

          // Remove the list item's bullet
          // so it is seen as the next token.
          space = item.length;
          var checked = /^ *- *\[([ x])\] +/.exec(item)[1] == 'x';
          item = item.replace(/^ *- *\[[ x]\] +/, '');

          // Outdent whatever the
          // list item contains. Hacky.
          if (~item.indexOf('\n ')) {
            space -= item.length;
            item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
          }

          this.tokens.push({
            type: 'todo_item_start',
            checked: checked,
          });

          // Recurse.
          this.token(item, false);

          this.tokens.push({
            type: 'todo_item_end'
          });
        }

        this.tokens.push({
          type: 'todo_end'
        });

        continue;
      }

      // list
      if (cap = this.rules.list.exec(src)) {
        src = src.substring(cap[0].length);
        bull = cap[2];

        this.tokens.push({
          type: 'list_start',
          ordered: bull.length > 1
        });

        // Get each top-level item.
        cap = cap[0].match(this.rules.item);

        next = false;
        l = cap.length;
        i = 0;

        for (; i < l; i++) {
          item = cap[i];

          // Remove the list item's bullet
          // so it is seen as the next token.
          space = item.length;
          item = item.replace(/^ *([*+-]|\d+\.) +/, '');

          // Outdent whatever the
          // list item contains. Hacky.
          if (~item.indexOf('\n ')) {
            space -= item.length;
            item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
          }

          // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.
          if (this.options.smartlist && i !== l - 1) {
            b = this.rules.bullet.exec(cap[i + 1])[0];
            if (bull !== b && !(bull.length > 1 && b.length > 1)) {
              src = cap.slice(i + 1).join('\n') + src;
              i = l - 1;
            }
          }

          // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.
          loose = next || /\n\n(?!\s*$)/.test(item);
          if (i !== l - 1) {
            next = item.charAt(item.length - 1) === '\n';
            if (!loose) loose = next;
          }

          this.tokens.push({
            type: loose
            ? 'loose_item_start'
            : 'list_item_start'
          });

          // Recurse.
          this.token(item, false);

          this.tokens.push({
            type: 'list_item_end'
          });
        }

        this.tokens.push({
          type: 'list_end'
        });

        continue;
      }

      // html
      if (cap = this.rules.html.exec(src)) {
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: this.options.sanitize
          ? 'paragraph'
          : 'html',
          pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
          text: cap[0]
        });
        continue;
      }

      // def
      if (top && (cap = this.rules.def.exec(src))) {
        src = src.substring(cap[0].length);
        this.tokens.links[cap[1].toLowerCase()] = {
          href: cap[2],
          title: cap[3]
        };
        continue;
      }

      // table (gfm)
      if (top && (cap = this.rules.table.exec(src))) {
        src = src.substring(cap[0].length);

        item = {
          type: 'table',
          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
        };

        for (i = 0; i < item.align.length; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = 'right';
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = 'center';
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }

        for (i = 0; i < item.cells.length; i++) {
          item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
        }

        this.tokens.push(item);

        continue;
      }

      // top-level aligned paragraph(marktex)
      if (top && (cap = this.rules.aligned_paragraph.exec(src))) {
        src = src.substring(cap[0].length);
        var firstline = cap[1];
        var flag = cap[2];
        var following = cap[3].charAt(cap[3].length - 1) === '\n'
        ? cap[3].slice(0, -1)
        : cap[3];

        var indent = '0em';
        var align = 'left';

        switch (flag) {
          case '>':
            align= 'right';
            break;
          case '':
            align='center';
            break;
          default:
            indent=parseInt(flag)*2+'em';
        }
        this.tokens.push({
          type: 'aligned_paragraph',
          text: firstline + '\n' + following,
          align: align,
          indent: indent
        });
        continue;
      }

      // top-level paragraph
      if (top && (cap = this.rules.paragraph.exec(src))) {
        src = src.substring(cap[0].length);
        var text = cap[1].charAt(cap[1].length - 1) === '\n'
        ? cap[1].slice(0, -1)
        : cap[1];
        this.tokens.push({
          type: 'paragraph',
          text: text
        });
        continue;
      }

      // text
      if (cap = this.rules.text.exec(src)) {
        // Top-level should never reach here.
        src = src.substring(cap[0].length);
        this.tokens.push({
          type: 'text',
          text: cap[0]
        });
        continue;
      }

      if (src) {
        throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
      }
    }

    return this.tokens;
  };

  // Inline-Level Grammar
  var inline = {};

  // Normal Inline Grammar
  inline.normal = {
    escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
    autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
    url: noop,
    tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
    link: /^!?\[(inside)\]\(href\)/,
    reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
    nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
    strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
    em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    br: /^ {2,}\n(?!\s*$)/,
    del: noop,
    text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/,
    math: noop,
    _inside: /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/,
    _href: /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/
  };

  // Pedantic Inline Grammar
  inline.pedantic = {
    strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
  };

  // GFM Inline Grammar
  inline.gfm = {
    url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
    del: /^~~(?=\S)([\s\S]*?\S)~~/,
  };

  // Marktex Inline Grammar
  inline.marktex={
    math: /^(\$+)\s*([\s\S]*?[^$])\s*\1(?!\$)/,
  };

  // Inline Lexer & Compiler
  function InlineLexer(links, options) {
    this.options = merge({}, marktex.defaults, options);
    this.links = links;
    this.rules = merge({},inline.normal);
    this.renderer = this.options.renderer || new Renderer;
    this.renderer.options = this.options;
    if (!this.links) {
      throw new Error('Tokens array requires a `links` property.');
    }

    //grammar merging
    if (this.options.pedantic) {
      merge(this.rules, inline.pedantic);
    }
    if (this.options.gfm) {
      merge(this.rules, inline.gfm);
      if (this.options.breaks) {
        merge(this.rules, inline.breaks);
      }
    }
    if (this.options.marktex) {
      merge(this.rules, inline.marktex);
    }
    
    //replacing
    this.rules.link = replace(this.rules.link)
      ('inside', this.rules._inside)
      ('href', this.rules._href)
      ();
    this.rules.reflink = replace(this.rules.reflink)
      ('inside', this.rules._inside)
      ();
    if(this.options.gfm){
      this.rules.escape = replace(this.rules.escape)('])', '~|])')();
      this.rules.text = replace(this.rules.text)
        (']|', '~]|')
        ('|', '|https?://|')
        ();
    }
    if (this.options.gfm && this.options.breaks) {
      this.rules.br = replace(this.rules.br)('{2,}', '*')();
      this.rules.text = replace(this.rules.text)('{2,}', '*')();
    }
    if (this.options.marktex) {
      this.rules.escape = replace(this.rules.escape)('])', '$])')();
      this.rules.text = replace(this.rules.text)
        (']|', '$]|')
        ();
    }
  }

  // Static Lexing/Compiling Method
  InlineLexer.output = function(src, links, options) {
    var inline = new InlineLexer(links, options);
    return inline.output(src);
  };

  // Lexing/Compiling
  InlineLexer.prototype.output = function(src) {
    var out = ''
    , link
    , text
    , href
    , cap;

    while (src) {
      // escape
      if (cap = this.rules.escape.exec(src)) {
        src = src.substring(cap[0].length);
        out += cap[1];
        continue;
      }

      // autolink
      if (cap = this.rules.autolink.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[2] === '@') {
          text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
          href = this.mangle('mailto:') + text;
        } else {
          text = escape(cap[1]);
          href = text;
        }
        out += this.renderer.link(href, null, text);
        continue;
      }

      // url (gfm)
      if (cap = this.rules.url.exec(src)) {
        src = src.substring(cap[0].length);
        text = escape(cap[1]);
        href = text;
        out += this.renderer.link(href, null, text);
        continue;
      }

      // tag
      if (cap = this.rules.tag.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
        continue;
      }

      // link
      if (cap = this.rules.link.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.outputLink(cap, {
          href: cap[2],
          title: cap[3]
        });
        continue;
      }

      // reflink, nolink
      if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
          src = src.substring(cap[0].length);
          link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
          link = this.links[link.toLowerCase()];
          if (!link || !link.href) {
            out += cap[0].charAt(0);
            src = cap[0].substring(1) + src;
            continue;
          }
          out += this.outputLink(cap, link);
          continue;
        }

        // strong
        if (cap = this.rules.strong.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.strong(this.output(cap[2] || cap[1]));
          continue;
        }

        // em
        if (cap = this.rules.em.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.em(this.output(cap[2] || cap[1]));
          continue;
        }

        // code
        if (cap = this.rules.code.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.codespan(escape(cap[2], true));
          continue;
        }

        // math(marktex)
        if (cap = this.rules.math.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.mathspan(escape(cap[2], true));
          continue;
        }

        // br
        if (cap = this.rules.br.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.br();
          continue;
        }

        // del (gfm)
        if (cap = this.rules.del.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.del(this.output(cap[1]));
          continue;
        }

        // text
        if (cap = this.rules.text.exec(src)) {
          src = src.substring(cap[0].length);
          out += escape(this.smartypants(cap[0]));
          continue;
        }

        if (src) {
          throw new
          Error('Infinite loop on byte: ' + src.charCodeAt(0));
        }
    }

    return out;
  };

  // Compile Link
  InlineLexer.prototype.outputLink = function(cap, link) {
    var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

    if (cap[0].charAt(0) !== '!') {
      return this.renderer.link(href, title, this.output(cap[1]));
    } else {
      return this.renderer.image(href, title, escape(cap[1]));
    }
  };

  // Smartypants Transformations
  InlineLexer.prototype.smartypants = function(text) {
    if (!this.options.smartypants) return text;
    return text
    // em-dashes
    .replace(/--/g, '\u2014')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
  };

  // Mangle Links
  InlineLexer.prototype.mangle = function(text) {
    var out = ''
    , l = text.length
    , i = 0
    , ch;

    for (; i < l; i++) {
      ch = text.charCodeAt(i);
      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }
      out += '&#' + ch + ';';
    }

    return out;
  };

  // Renderer
  function Renderer() {}

  Renderer.prototype.code = function(code, lang) {
    if (typeof this.options.highlight == "function") {
      try{
        return s = '<pre>' + this.options.highlight(code, lang) + '</pre>';
      }catch(e){}
    }
    return '<pre><code>' + escape(code, true) + '</code></pre>';
  };

  Renderer.prototype.math = function(math, lang) {
    if (typeof this.options.math == "function") {
      try{
        return this.options.math(math,false, lang);
      }catch(e){}
    }
    return '<pre><code class="math">' + escape(math, true) + '</code></pre>';
  };

  Renderer.prototype.blockquote = function(quote) {
    return '<blockquote>\n' + quote + '</blockquote>\n';
  };

  Renderer.prototype.html = function(html) {
    return html;
  };

  Renderer.prototype.heading = function(text, level, raw, options) {
    return '<h'
    + level
    + '>'
    + text
    + '</h'
    + level
    + '>\n';
  };

  Renderer.prototype.hr = function() {
    return '<hr>\n';
  };

  Renderer.prototype.list = function(body, ordered) {
    var type = ordered ? 'ol' : 'ul';
    return '<' + type + '>\n' + body + '</' + type + '>\n';
  };

  Renderer.prototype.listitem = function(text) {
    return '<li>' + text + '</li>\n';
  };

  Renderer.prototype.todo = function(body) {
    return '<div class="todo">\n' + body + '</div>\n';
  };

  Renderer.prototype.todoitem = function(text,checked) {
    var str = checked?'class="checked"':'';
    return '<div class="todoitem">'+
      '<span '+str+'>' + '</span>' +
      '<div>' + text + '</div>'+
      '</div>\n';
  };

  Renderer.prototype.paragraph = function(text) {
    return '<p>' + text + '</p>\n';
  };

  Renderer.prototype.aligned_paragraph = function(text, alignment) {
    var align = alignment.align,
    indent = alignment.indent,
    style = 'style="';
    if (align != 'left') {
      style += 'text-align:' + align + ';';
    }
    if (indent != '0em') {
      style += 'text-indent:'+ indent + ';';
    }
    style += '"';
    if (style != 'style=""') {
      return '<p '+ style +'>' + text + '</p>\n';    
    }
    else{
      return '<p>' + text + '</p>\n';    
    }
  };

  Renderer.prototype.table = function(header, body) {
    return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
  };

  Renderer.prototype.tablerow = function(content) {
    return '<tr>\n' + content + '</tr>\n';
  };

  Renderer.prototype.tablecell = function(content, flags) {
    var type = flags.header ? 'th' : 'td';
    var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
    return tag + content + '</' + type + '>\n';
  };

  // span level renderer
  Renderer.prototype.strong = function(text) {
    return '<strong>' + text + '</strong>';
  };

  Renderer.prototype.em = function(text) {
    return '<em>' + text + '</em>';
  };

  Renderer.prototype.codespan = function(text) {
    return '<code>' + text + '</code>';
  };

  Renderer.prototype.mathspan = function(text) {
    if (typeof this.options.math == "function") {
      try{
        return this.options.math(text, true);
      }catch(e){}
    }
    return '<code class="math">' + text + '</code>';
  };

  Renderer.prototype.br = function() {
    return '<br>';
  };

  Renderer.prototype.del = function(text) {
    return '<del>' + text + '</del>';
  };

  Renderer.prototype.link = function(href, title, text) {
    var out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
  };

  Renderer.prototype.image = function(href, title, text) {
    var out = '<img src="' + href + '" alt="' + text + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>';
    return out;
  };

  // Parsing
  function Parser(options) {
    this.tokens = [];
    this.token = null;
    this.options = merge({}, marktex.defaults, options);
    this.options.renderer = this.options.renderer || new Renderer;
    this.renderer = this.options.renderer;
  }

  // Static Parse Method
  Parser.parse = function(src, options) {
    var parser = new Parser(options);
    return parser.parse(src);
  };

  // Parse Loop
  Parser.prototype.parse = function(src) {
    this.inline = new InlineLexer(src.links, this.options);
    this.tokens = src.reverse();
    var out = '';
    while (this.next()) {
      out += this.tok();
    }
    return out;
  };

  // Next Token
  Parser.prototype.next = function() {
    return this.token = this.tokens.pop();
  };

  // Preview Next Token
  Parser.prototype.peek = function() {
    return this.tokens[this.tokens.length - 1] || 0;
  };

  // Parse Text Tokens
  Parser.prototype.parseText = function() {
    var body = this.token.text;
    while (this.peek().type === 'text') {
      body += '\n' + this.next().text;
    }
    return this.inline.output(body);
  };

  // Parse Current Token
  Parser.prototype.tok = function() {
    switch (this.token.type) {
      case 'space': {
        return '';
      }
      case 'hr': {
        return this.renderer.hr();
      }
      case 'heading': {
        return this.renderer.heading(
          this.inline.output(this.token.text),
          this.token.depth
        );
      }
      case 'code': {
        return this.renderer.code(this.token.text, this.token.lang);
      }
      case 'math':{
      return this.renderer.math(this.token.text, this.token.lang);
      }
      case 'table': {
        var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;
  
        // header
        cell = '';
        for (i = 0; i < this.token.header.length; i++) {
          flags = { header: true, align: this.token.align[i] };
          cell += this.renderer.tablecell(
            this.inline.output(this.token.header[i]),
            { header: true, align: this.token.align[i] }
          );
        }
        header += this.renderer.tablerow(cell);
  
        for (i = 0; i < this.token.cells.length; i++) {
          row = this.token.cells[i];
  
          cell = '';
          for (j = 0; j < row.length; j++) {
            cell += this.renderer.tablecell(
              this.inline.output(row[j]),
              { header: false, align: this.token.align[j] }
            );
          }
  
          body += this.renderer.tablerow(cell);
        }
        return this.renderer.table(header, body);
      }
      case 'blockquote_start': {
        var body = '';
  
        while (this.next().type !== 'blockquote_end') {
          body += this.tok();
        }
  
        return this.renderer.blockquote(body);
      }
      case 'list_start': {
        var body = ''
        , ordered = this.token.ordered;
  
        while (this.next().type !== 'list_end') {
          body += this.tok();
        }
  
        return this.renderer.list(body, ordered);
      }
      case 'list_item_start': {
        var body = '';
  
        while (this.next().type !== 'list_item_end') {
          body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
        }
  
        return this.renderer.listitem(body);
      }
      case 'loose_item_start': {
        var body = '';
    
        while (this.next().type !== 'list_item_end') {
          body += this.tok();
        }
  
        return this.renderer.listitem(body);
      }
      case 'todo_start': {
        var body = ''
        , ordered = this.token.ordered;
  
        while (this.next().type !== 'todo_end') {
          body += this.tok();
        }
  
        return this.renderer.todo(body, ordered);
      }
      case 'todo_item_start': {
        var body = '';
        var checked = this.token.checked;
        while (this.next().type !== 'todo_item_end') {
          body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
        }
  
        return this.renderer.todoitem(body,checked);
      }
      case 'html': {
        //var html = !this.token.pre && !this.options.pedantic 
        //            ? this.inline.output(this.token.text)
        //            : this.token.text;
        var html = this.token.text;
        return this.renderer.html(html);
      }
      case 'aligned_paragraph': {
        return this.renderer.aligned_paragraph(this.inline.output(this.token.text), {align: this.token.align, indent: this.token.indent});
      }
      case 'paragraph': {
       return this.renderer.paragraph(this.inline.output(this.token.text));
      }
      case 'text': {
        return this.renderer.paragraph(this.parseText());
      }
    }
  };

  // Helpers
  function escape(html, encode) {
    return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  }
  
  function replace(regex, opt) {
    regex = regex.source;
    opt = opt || '';
    return function self(name, val) {
      if (!name) return new RegExp(regex, opt);
      val = val.source || val;
      val = val.replace(/(^|[^\[])\^/g, '$1');
      regex = regex.replace(name, val);
      return self;
    };
  }
  
  function noop() {}
  noop.exec = noop;
  
  function merge(obj) {
    var i = 1
    , target
    , key;

    for (; i < arguments.length; i++) {
      target = arguments[i];
      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }
    return obj;
  }

  // Marktex
  function marktex(src, opt, callback) {
    if (callback || typeof opt === 'function') {
      if (!callback) {
        callback = opt;
        opt = null;
      }

      opt = merge({}, marktex.defaults, opt || {});

      try {
        return callback(null, Parser.parse(BlockLexer.lex(src, opt), opt));
      } catch (e) { return callback(e); }
    }
    else{
      if (opt) opt = merge({}, marktex.defaults, opt);
      return Parser.parse(BlockLexer.lex(src, opt), opt);
    }
  }

  // Options
  marktex.options = function(opt) {
    merge(marktex.defaults, opt);
    return marktex;
  };

  marktex.defaults = {
    /*gfm settings*/
    gfm: true,
    tables: true,
    todo: true,
    highlight: null,
    breaks: true,

    /*marktex settings*/
    marktex: true,
    math: null,  
    smartlist: false,  
    smartquote: true,  
    align: true,

    /*markdown settings*/
    pedantic: false,
    sanitize: false,
    smartypants: false,

    /*parser settings*/
    renderer: new Renderer,
  };

  // Expose
  marktex.Parser = Parser;
  marktex.parse = Parser.parse;

  marktex.BlockLexer = BlockLexer;
  marktex.blockLex = BlockLexer.lex;

  marktex.InlineLexer = InlineLexer;
  marktex.inlineLex = InlineLexer.output;

  marktex.Renderer = Renderer;

  if (typeof exports === 'object') {
    module.exports = marktex;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return marktex; });
  } else {
    this.marktex = marktex;
  }

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());
