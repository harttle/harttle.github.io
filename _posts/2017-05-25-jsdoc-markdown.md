---
title: 为 JS 代码生成 Markdown 文档
tags: AMD ES6 Markdown 注释 ESLint JSDoc
---

从 C++/Python/Java 来到 JavaScript 的同学一定希望有类似
[Doxygen][doxygen], [Sphinx][sphinx], Javadoc 或 phpDocumentor 的文档工具。
事实上 JavaScript 社区也有 [JSDoc][jsdoc]、 [YUIdoc][yuidoc]、doxx 等工具。
其中 JSDoc 的使用尤为广泛，[Harttle][harttle] 的很多代码注释都是按照 JSDoc 语法来 [Lint][vim-eslint] 的。
本文介绍的是如何从 JSDoc 语法的 JavaScript 源码生成 Markdown 格式的 API 文档。

<!--more-->

## 什么是 JSDoc？

官网: <http://usejsdoc.org/>

[JSDoc][jsdoc] 是一个 JavaScript 的 API 文档生成器，最新的版本是 3.4.3。
JSDoc 可以扫描源代码中的注释，生成 HTML 格式的文档网站。
最典型的使用方式就是生成 API 文档，解释源代码的文件、类、接口、函数签名等内容。

> Harttle 在 [谨慎使用代码注释](/2016/10/08/code-comments.html) 一文中曾提到，
> 一般情况不赞成添加代码注释，但自动生成文档的注释除外。这里的 JSDoc 就是典型。

以 `/**` 开始的代码注释会被解释为 JSDoc 注释。例如对 `Book` 构造函数的注释：

```javascript
/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function Book(title, author) {
}
```

执行 `jsdoc book.js` 便可以在当前目录的 `out/` 文件夹生成这一函数的 HTML 文档。
为了确保 JSDoc 注释格式书写正确，可以为你的 JavaScript 引入风格检查工具比如 ESLint。
ESLint 会 [检查 JSDoc 的合法性][valid-jsdoc]。

> 如果你也在用 Vim，可以参考
> [Vim 中使用 eslint 检查代码风格](/2017/03/12/vim-eslint.html)
> 来配置你的 Vim。

## Markdown

在今天怎么可以接受非 Markdown 格式的文档？
[jsdoc-to-markdown][jsdoc-to-markdown] 工具可以 [识别 JSDoc 语法][jsdoc-parse]
并生成 Markdown 格式的文档。可以通过 npm 安装：

```bash
npm install --save-dev jsdoc-to-markdown
```

执行 `jsdoc2md book.js` 将会输出这样的 Markdown 文档：

```markdown
## Book

**Kind**: global class  

### new Book(title, author)
Represents a book.

| Param | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | The title of the book. |
| author | <code>string</code> | The author of the book. |
```

## ES6 Class

从前在 JSDoc 中通过 `@class` 或 `@constructor` 来标注构造函数。
在 ES6 中由于直接引入了 `class` 关键字，Class 不再需要标注了。
但继承关系是需要通过 [`@extends`][augments] 来标注的，例如：

```javascript
/**
 * Class representing a dot.
 * @extends Point
 */
class Dot extends Point {
    /**
     * Create a dot.
     * @param {number} x - The x value.
     * @param {number} y - The y value.
     * @param {number} width - The width of the dot, in pixels.
     */
    constructor(x, y, width) {
        // ...
    }
}
```

## AMD 模块

由于 AMD 模块是由 `define` 包裹的，而且常常文件与模块名挂钩。在 JSDoc 注释中需要声明模块。
此外，还可以引用另一个 AMD 模块。

对于一个简单地声明了一个对象的 AMD 模块，只需要把该对象声明为 `exports` 即可：

```javascript
define('my/shirt', function() {
   /**
    * A module representing a shirt.
    * @exports my/shirt
    */
    var shirt = {
        color: 'black',

        /** @constructor */
        Turtleneck: function(size) {
            this.size = size;
        }
    };
    return shirt;
});
```

如果模块返回的是函数，则需要单独声明 `@module` 名称，再用 `@alias` 关联到你的构造函数：

```javascript
/**
 * A module representing a jacket.
 * @module my/jacket
 */
define('my/jacket', function() {
    /**
     * @constructor
     * @alias module:my/jacket
     */
    var Jacket = function() {};

    /** Zip up the jacket. */
    Jacket.prototype.zip = function() {};

    return Jacket;
});
```

> 虽然 AMD 的代码结构更为复杂，但 AMD 和 CMD 有同样的模块组织的概念。
> 因此上述规则同样适用于 CMD 模块。

## 相关文档

* JSDoc 标签文档：<http://usejsdoc.org/>
* jsdoc2md 文档：<https://github.com/jsdoc2md/jsdoc-to-markdown/wiki>
* [Vim 中为 Markdown 配置回车展开](/2016/08/05/vim-markdown-cr-expansion.html)
* howto CommonJS Modules：<http://usejsdoc.org/howto-commonjs-modules.html>
* howto AMD Modules：<http://usejsdoc.org/howto-amd-modules.html>

[doxygen]: http://www.stack.nl/~dimitri/doxygen
[sphinx]: http://zh-sphinx-doc.readthedocs.io/en/latest/index.html
[jsdoc]: http://usejsdoc.org
[yuidoc]: http://yui.github.io/yuidoc/
[harttle]: https://harttle.land/about.html
[vim-eslint]: /2017/03/12/vim-eslint.html
[valid-jsdoc]: http://eslint.org/docs/rules/valid-jsdoc
[jsdoc-to-markdown]: https://www.npmjs.com/package/jsdoc-to-markdown
[jsdoc-parse]: https://www.npmjs.com/package/jsdoc-parse
[augments]: http://usejsdoc.org/tags-augments.html
