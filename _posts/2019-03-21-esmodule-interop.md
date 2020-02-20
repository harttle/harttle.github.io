---
title: 在 ES Module 中引用 CommonJS：esModuleInterop
tags: CommonJS ESM ES6 allowSyntheticDefaultImports esModuleInterop
---

ES5 标准没有定义模块的概念或它们之间引用方式，因此出现了各种各样的社区规范。
比如在浏览器里的 AMD、Webpack Require，在 Node.js 里的 CommonJS。
它们定义了类似 `define`, `require`, `__webpack_require__` 这样的全局函数来定义和引用 ES5 模块。
关于 JavaScript 模块化的背景，在 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) 上有更详尽的说明。

从 [ECMA 2015](https://www.ecma-international.org/ecma-262/6.0/#sec-imports)（ES6）开始定义了 ES Modules，
从 JavaScript 语言层面给出了模块的概念，和 `import`, `export` 关键字。
那么什么是 ES Modules 呢，新的 ES Module 和旧的 CommonJS 之间怎么相互引用呢？
毕竟 npm 上还有成千上万的 CommonJS 模块，本文就来谈 **ES Modules 和 CommonJS 之间的互操作问题**。

<!--more-->

## ESM 和 CommonJS 的区别

1. 导出名字绑定。CommonJS 中 `module.exports` 是一个 JavaScript 对象，这意味着比如对 `exports.foo` 属性的引用是值引用，当 `exports.foo` 指向另一个对象时，引用点仍然保持旧的 `foo`。而 ES Modules `export` 是一个用于声明导出名字的关键字，引用点拿到的就是声明的那个名字，而非某个包装对象的属性，也就是说 `export foo` 的值有变更会直接体现在引用点。更多实现细节请参考 [这篇文章](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)。
2. 解析 ES Modules 时总是 "strict" 模式。就像头部写了 "use strict" 一样。
3. CommonJS 中不兼容 `import` 语句，会引发解析错。
4. 浏览器下载 ES Modules 时使用 CORS 模式。因此跨域脚本需要设置 [CORS HTTP 头][cors]，比如 `Access-Control-Allow-Origin: *`，也就不允许 `file://` 协议因为它的 origin 是 null。也就是说脚本不能再随便跨域了。
5. 浏览器中 `this === window`，CommonJS 中 `this === global`，而 ES Modules 中 `this === undefined`。

因为需要不同的模式去解析，所以 JS 引擎在解析一个模块之前就需要知道它是 ES Module 还是 ES5 的 CommonJS。
这就是为什么 [Node.js 下 ES Modules][node-esm] 要使用新的后缀 `.mjs`，浏览器中要设置 script 标签的 `type="module"`。

## CommonJS 引用 ESM

ES Modules 的设计主要考虑能够引用旧的 CommonJS，而且为了更大程度的兼容 ES Modules 一般会在发布前编译到 CommonJS。
因此 CommonJS 直接引用 ES Modules 的情况比较少。但如果真的存在这种情况，需要使用 [import][import] API：

```javascript
const foo = await import('./foo.mjs')
```

## ESM 引用 CommonJS

目前 Node.js 还没有完全支持 ES Modules，在 Node.js 10 中需要通过 `--experimental-modules` 开关来启用。
在 ESM 中可以直接使用 import 语句来引入 CommonJS 模块：

```javascript
// a.js in CommonJS
exports.foo = 'foo'

// b.mjs in ES Modules
import a from './a.js'
console.log(a)      // prints {foo: "foo"}

// c.mjs in ES Modules
import * as a from './a.js'
console.log(a)      // prints {default: {foo: "foo"}}
```

上面的代码演示了 ESM 引用 CommonJS 的规则：

* CommonJS 中的 `module.exports` 对象会被作为默认导出（default export），值为 `{ foo: 'foo' }`；
* `import a from './a.js'` 会让 `a` 引用到 a.js 里的默认导出，即 `{ foo: 'foo' }`；
* `import * as a from './a.js'` 会让 `a` 引用到 a.js 里的 [namespace object][namespace object]，即 `{default: {foo: "foo"}}`。

## import =

这是一个非标准的例子，通过 `import =` + [require][require] 的方式来引用 CommonJS 模块：

```javascript
import a = require('./a.js')
console.log(a)  // prints {foo: "foo"}
```

因为这一语法在 Babel 和 TypeScript 中都支持，
而且非常方便从 ES5 的 `const a = require('./a.js')` 语法迁移代码，
如上使用方式非常流行，但是尽管如此它没有定义在 ES Modules 标准中，也就是说如上是不标准的。

## esModuleInterop

当前较常见的方式是使用 Babel 或 [TypeScript][tsc] 把 ESM 编译到 CommonJS 再用 Node.js 去执行。
但这些工具的表现不都是符合 ES Modules 标准的，
比如 TypeScript 默认设置下对 `import * as a` 的处理和 `import a from` 相同：
即 `import * as a from './a.js'` 会让 `a` 引用到 a.js 的默认导出 `{foo: "foo"}` 而非 ES Modules 规范的 [namespace object][namespace object] `{default: {foo: "foo"}}`。

为了让我们写的 TypeScript 同时符合 ES Modules 标准，需要开启 [esModuleInterop][esModuleInterop]
编译选项并使用 `import a from './a.js'` 方式来引用 a.js。
esModuleInterop 做了两件事情：

1. 在编译产出中通过 `__importDefault()` 和 `__importStar()` 包装 `require()`，使模块引用行为符合 ES Modules 规范。[这个 Stack Overflow](https://stackoverflow.com/questions/56238356/understanding-esmoduleinterop-in-tsconfig-file) 有很详细的讨论。
2. 开启 [allowSyntheticDefaultImports][allowSyntheticDefaultImports] 编译选项来让类型系统也按照 ESM 的方式理解 import。

也就是说如果被你引用的模块已经按照 ESM 规范编译到了 CommonJS 并在产出里定义了 `.default` 属性，
那么你只需要让 TypeScript 的类型系统按照 ESM 规范去理解 import，也就是说打开
`allowSyntheticDefaultImports` 编译选项就可以了。
但如果你要引用的模块就是一个基本的 CommonJS 模块（`exports.default === undefined`），那么你需要把 `esModuleInterop` 也打开。

[cors]: /2015/10/10/cross-origin.html
[require]: https://nodejs.org/api/modules.html#modules_all_together
[import]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
[node-esm]: http://2ality.com/2017/09/native-esm-node.html
[tsc]: https://www.typescriptlang.org/docs/tutorial.html
[namespace object]: http://www.ecma-international.org/ecma-262/6.0/index.html#sec-module-namespace-objects
[allowSyntheticDefaultImports]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
[esModuleInterop]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
