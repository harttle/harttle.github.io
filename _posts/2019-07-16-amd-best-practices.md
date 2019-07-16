---
title: AMD 模块化最佳实践
---

[AMD](https://requirejs.org/docs/whyamd.html) 是 RequireJS 给出的模块加载方案。
支持递归依赖解析、模块异步加载，夜兼容 CommonJS 可以在 Node.js 里用。
虽然目前已经不再流行，很多站点更倾向于编写 ES Modules 并直接 Webpack 打包，
但 AMD 是完整的，兼容性良好的，支持动态加载的模块化方案，在大型的、独立部署的、异构的项目中仍然有一席之地。
所以还是决定写一篇关于 AMD 最佳实践的文章，致敬老式的 Old School 的 Web 开发。

**TL;DR**

* 源文件中，模块应该匿名编写。区分好“使用 AMD 语法”和“模块化”，充分利用 AMD 又不被套牢。
* 一个模块对应一个文件。每个模块是一个单独的源文件，每个文件只包含一个模块定义。
* 避免手动写依赖列表，可以通过编译工具自动生成。
* 独立维护的工具模块，应当通过打包编译隐藏其内部结构。

<!--more-->

## 模块匿名：源文件名即模块名

**源文件中，模块应该匿名编写**。为了理解这一点，
首先要区分“使用 AMD 语法”和“模块化”这两件事情。
模块化是目标而“使用 AMD 语法”只是手段，
我们最终想要的模块代码是被 define 包裹起来的 function 里面的这一部分。
最理想的方式是只编写模块内容，define 在编译时完成。例如：

```javascript
// 源码：src/foo.js
exports.foo = x => console.log(x)

// 编译后：dist/foo.js
define('foo', function () {
    return { foo: x => console.log(x) }
})
```

如果希望有更大的自由，可以更容易地和 RequireJS 互操作，也可以在源码中包含 `define`：

```javascript
// 源码：src/foo.js
define(function () {
    return { foo: x => console.log(x) }
})

// 编译后：dist/foo.js
define('foo', function () {
    return { foo: x => console.log(x) }
})
```

注意上述代码块中源码模块是匿名的。也就是说模块本身只包含模块化的业务逻辑，
AMD 特定的部分由编译来解决不混入源码。否则会对后续维护造成困难：
文件重命名、移动目录时，如果变更 ID 会使得引用挂掉，如果不变更 ID 又会跟文件名不一致。
从 AMD 迁移到其他模块化方案时也会遇到类似的问题。

## 一个模块对应一个文件

**每个模块是一个单独的源文件，每个文件只包含一个模块定义。**
如果一个文件包含多个模块，那么势必会编写出具名模块，手动管理所有的 ID 和引用关系。
这违反了上一个实践：模块匿名。

另一个反例是源文件中不仅定义了模块，还在模块外写了其他代码：

```javascript
// file: foo.js
define('foo', function () { /* do some thing */ })
require(['foo'])
```

如上 foo.js 就不是一个模块文件，它只是一个 JavaScript 文件，
一个不可复用的，不可测试的 JavaScript 文件。
它是自执行的，不是用来让别人 require 的，
效果上等价于一个 IIFE，因此完全没有必要写成一个 AMD 模块。

## 自动生成依赖列表

**避免手动维护依赖列表，把重复性工作交给编译器**。
因为一个模块的依赖可能很多而且是变化的，比如这个：

```javascript
define(['skyWalker', 'starShipManager', 'theLastJedi', 'theVeryLastJedi',
function (skyWalker, starShipManager, theLastJedi, theVeryLastJedi) {
    // do something    
}])
```

手动维护一个字符串列表和一个形参列表不仅麻烦还容易出错，而且一旦错位了很难调试。
这些工作完全可以交给编译器，这也是 local require 的重要用法：

```javascript
define(function (require) {
    var skyWalker = require('skyWalker')
    var starShipManager = require('starShipManager')
    var theLastJedi = require('theLastJedi')
    var theVeryLastJedi = require('theVeryLastJedi')
    // do something    
})
```

RequireJS 本身也利用 `Function.prototype.toString`（见 [fdf418][r.js-tos]）
提供了依赖分析，上述代码甚至不需要编译就可以在浏览器里运行。
如果再把 define 这一层包装放到浏览器里，你写的就是 CMD 模块了，然后通过编译得到 AMD 规范的模块。

## 隐藏模块的内部结构

对于一个采用 AMD 方案的，由很多独立维护的模块构成的最终系统。
默认这些独立模块的文件结构会完全映射到最终系统中。
这使得模块之间可以相互引用深层的内部文件，而不只是模块入口。
例如最终模块引用了一个叫做 foo 的 AMD 规范的独立模块：

```
├── index.js
└── node_modules
    └── foo
        ├── src/
        │   └── bar.js
        └── index.js
```

最终打包后代码可能是：

```javascript
define('index', [ 'node_modules/foo/index', 'node_modules/foo/src/bar' ], function (foo, bar) { 
    console.log(foo, bar);
})
```

其中对 `node_modules/foo/src/bar` 的引用是脆弱的。
因为 `foo` 是一个独立维护的模块，其 API 由入口文件 `index.js` 定义：
`bar` 不应当暴露给外部使用，我们需要技术手段来禁止这种引用操作。比如：

1. `foo` 内部不使用 AMD 作为模块规范。打包后只把入口声明为 AMD 模块。
2. `foo` 内部仍然用 AMD 作为模块规范。打包时除了入口之外的所有模块都添加 md5（可以是前缀，也可以是后缀）。

再配合适当的 requirejs 配置，总之需要达到的效果类似：

```javascript
define('index', [ 'foo' ], function (foo) { 
    console.log(foo, foo.bar);
})
```

[r.js-tos]: https://github.com/requirejs/requirejs/blob/fdf4186d3e68df06a04bd71cb6ea0f24eb1600d1/require.js#L2087
