# marktex

A full GFM implementation in javascript. Additional smart features supported and enabled by default. [Live demo](http://buddys.github.io/marktex/) is available.

> GFM supported, code hilighting, math supporting, task list, smarter list, para alignment.

[![NPM version](https://badge.fury.io/js/marktex.png)](http://badge.fury.io/js/marktex)

## Install

``` bash
npm install marktex
```

## Usage

Minimal usage:

```js
console.log(marktex('**markdown** is wonderful'));
//output: <p><strong>markdown</strong> is wonderful</p>
```

Options and callback:

```js
var options = {
  gfm: true,
  marktex: true
};

marktex('**markdown** is wonderful', options, function (err, content) {
  if (err) throw err;
  console.log(content);
});
```

## marktex(markdownString, [options], [callback])

### markdownString

Markdown string to be parsed.

### options

Type: `Object`

Option object for marktex.

### callback

Type: `Function`

Callback function with error-string as the first arg, parsed-content as the second arg.

## Options

### gfm

Type: `Boolean`
Default: `true`

Enable [GitHub flavored markdown](https://help.github.com/articles/github-flavored-markdown).

### tables

Type: `Boolean`
Default: `true`

Enable GFM tables. Requires the `gfm` option to be true.

### todo

Type: `Boolean`
Default: `true`

Enable GFM todo. Requires the `gfm` option to be true.

### highlight

Type: `Function` Default: `null` Return: `string` 

Highlight interface, used for highlight code blocks. Takes language specification and code string, returns html. Requires the `gfm` option to be true.

```js
options = {
    highlight: function(codeString, language){ return highlight(lang, code).value; }
}
```

### breaks

Type: `Boolean`
Default: `true`

Enable GFM line breaks. Requires the `gfm` option to be true.

### marktex

Type: `Boolean`
Default: `true`

Enable [MarkTex](http://buddys.github.io/marktex/), features include task-list, math interface, para-alignment, smarter list ,etc.

### math

Type: `Function` Default: `null` Return: `string` 

Math interface, used for rendering math code. Takes math code, isInline and language, returns html. Requires the `marktex` option to be true.

```js
//sample
options = {
    math: function(mathString, isInline, language){
            return isInline ? '<span class="mathjax">\\('+mathString+'\\)</span>'
            :'<div class="mathjax">\\['+mathString+'\\]</div>';
            }
}
```

### smartlist

Type: `Boolean`
Default: `false`

Smarter list rendering. Different symbol in unsorted list, and consecutive `\n` in all list, will split lists. Requires the `marktex` option to be true.

### smartquote

Type: `Boolean`
Default: `true`

Smarter blockquote rendering. Consecutive `\n` will split blockquote. Requires the `marktex` option to be true.


### align

Type: `Boolean`
Default: `true`

Enable paragraph alignment. Requires the `marktex` option to be true.

### pedantic

Type: `Boolean`
Default: `false`

Conform to original markdown, do not fix any of bugs or poor behavior.

### sanitize

Type: `Boolean`
Default: `false`

Ignore any HTML that has been input.

### smartypants

Type: `Boolean`
Default: `false`

Use "smart" typograhic punctuation for things like quotes and dashes.

### renderer

Type: `Renderer`
Default: `new Renderer()`

A renderer instance for rendering ast to html. Learn more on the Renderer
section.


## Parser API

### Renderer

Renderer renders tokens to html.

```javascript
var r = new marktex.Renderer()
r.code = function(code, lang) {
  return highlight(lang, code).value;
}

console.log(marktex(text, {renderer: r}))
```

#### Block Level Renderer

- code(code, language)
- math(math, language)
- blockquote(quote)
- html(html)
- heading(text, level)
- hr()
- list(body, ordered)
- listitem(text)
- todo(body)
- todoitem(text, checked)
- paragraph(text)
- aligned_paragraph(text, alignment)
- table(header, body)
- tablerow(content)
- tablecell(content, flags)

`alignment` could be:

```
{
	align: 'center',
	indent: '2em'
}
```

`flags` could be:

```
{
    header: true,
    align: 'center'
}
```

#### Span Level Renderer

- strong(text)
- em(text)
- codespan(code)
- mathspan(math)
- br()
- del(text)
- link(href, title, text)
- image(href, title, text)

### Lexer

Lexer produces tokens from markdown text input.

``` js
var options={};
var lexer = new marktex.BlockLexer(options);
var tokens = lexer.lex(text);
console.log(tokens);
console.log(lexer.rules);
```

### Parser

Parser reads markdown text, outputs html. Renders and lexers can be customed within a parser.

``` js
var renderer = new marktex.Renderer();

renderer.heading = function(text, level) {
  return '<div class="h-' + level + '">' + text + '</div>'
}

var parse = function(src, options) {
  options = options || {};
  return marktex.parse(marktex.blockLex(src, options), options);
}

console.log(parse('# h1', {renderer: renderer}))
```

## Thanks

A lot thanks to [marked](https://github.com/chjj/marked) implemented by Jeffrey. Marktex is developed based on marked.
