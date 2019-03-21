---
title: ES Modules 和 ES5 Script 之间相互引用
tags: CommonJS ES6
---

ES5 没有定义文件之间引用方式，在浏览器中文件之间引用需要通过类似
`define`, `require`, `__webpack_require__` 这样的全局变量，它们由不同的模块化框架定义。
ES Modules 从标准上定义了 JS 文件间的引用方式，而且现在主流浏览器和 Node.js 都已经有了实现。
本文介绍 Node.js 中新写的 ES Modules 怎么和旧的 CommonJS 模块相互引用，
以及如何引用 npm 上成千上万的 CommonJS 模块。即 **ES Modules 和 ES5 Script 间的互操作问题**。
ES5 Script 有多种模块化实现，本文集中讨论 Node.js 中的 CommonJS。

<!--more-->

## ES Modules 和 ES5 Script 的区别

* CommonJS 中 `module.exports` 会被拷贝一份，这意味着 export 的值在变更后引用处还是旧的。ES Modules export 的值会被关联到引用方（通过 ImportEntry/ExportEntry Record 实现）；但 
* ES Modules 采用 "strict" 模式解析，就像头部写了 "use strict" 一样。
* ES5 Script 不允许使用 import from 语句。 
* 浏览器使用 CORS 模式来获取 ES Modules，因此如果模块脚本跨域需要设置 [CORS HTTP 头][cors]，比如 `Access-Control-Allow-Origin: *`，也就不允许 `file://` 协议因为它的 origin 是 null。ES5 Script 默认情况下没有跨域限制。
* ES5 Script 中 this 指向全局作用于即 window 或 global，ES Modules 中的 this 是 undefined。

因为解析方式有区别，所以解释执行之前需要知道它是 ES Module 还是 Script。
这就是为什么 [Node.js 下 ES Modules][node-esm] 要使用新的后缀 `.mjs`，浏览器中要设置 script 标签的 `type="module"`。

## CommonJS 引用 ES Modules

目前一般 ES Modules 都会编译成 CommonJS，因此 CommonJS 直接引用 ES Modules 的情况比较少。
如果要用，需要使用动态 [import][import]：

```javascript
const foo = await import('./foo.mjs')
```

## ES Modules 引用 CommonJS

ES Modules 还没有在 Node.js 10 落地，目前需要通过 `--experimental-modules` 开关来启用。
在 ESM 中可以直接使用 import 语句来引入 CommonJS 模块（`module.exports` 会被作为 `default` export）：

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

由于 Node 还未支持 ES Modules，目前通常会使用 Babel 或 [TypeScript][tsc] 来编译到 CommonJS。
这些编译工具提供了很多编译选项，可以比 ES Modules 标准做更多地事情。
**但有些选项是违反标准的，因此要慎用这些选项**。

例如，目前 TypeScript 中 `import * as a from './a.js'` 会返回 a.js 的 default export，
即 `{foo: "foo"}` 而非 [namespace object][namespace object] `{default: {foo: "foo"}}`。
开启 [allowSyntheticDefaultImports][allowSyntheticDefaultImports] 选项并使用
`import a from './a.js'` 反而会更符合 ES6 标准。

例如，Babel 和 TypeScript 中都支持 import + [require][require] 语法来引入 CommonJS 模块，
这一语法非常方便与 ES5 的 `const a = require('./a.js')` 来回切换，但这个语法没有定义在 ES6 标准中：

```javascript
import a = require('./a.js')
console.log(a)  // prints {foo: "foo"}
```

## 相关讨论

* <https://stackoverflow.com/questions/29596714/new-es6-syntax-for-importing-commonjs-amd-modules-i-e-import-foo-require>
* <https://stackoverflow.com/questions/52534910/difference-between-import-x-requirex-and-const-x-requirex-in-typ>
* <https://github.com/domenic/chai-as-promised/issues/133>

[cors]: /2015/10/10/cross-origin.html
[require]: https://nodejs.org/api/modules.html#modules_all_together
[import]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
[node-esm]: http://2ality.com/2017/09/native-esm-node.html
[tsc]: https://www.typescriptlang.org/docs/tutorial.html
[namespace object]: http://www.ecma-international.org/ecma-262/6.0/index.html#sec-module-namespace-objects
[allowSyntheticDefaultImports]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
