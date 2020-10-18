---
title: 在 ES Module 中引用 CommonJS：esModuleInterop
tags: CommonJS ESM ES6 allowSyntheticDefaultImports esModuleInterop
---

从 [ECMA 2015](https://www.ecma-international.org/ecma-262/6.0/#sec-imports)（ES6）JavaScript 开始标准化 ES [Modules][modules]，
从 JavaScript 语言层面给出了模块的概念和 `import`, `export` 等关键字。
ES Modules 用来取代 AMD、Webpack Require，CommonJS 这些社区规范。
那么 ES Modules 和 CommonJS 有啥区别，以及新的 ES Module 和旧的 CommonJS 之间怎么相互引用呢？
毕竟 npm 上还有成千上万的 CommonJS 模块，本文就来谈 **ES Modules 和 CommonJS 之间的互操作问题**。

**TL; DR**

1. ESM 需要不同的解析方式，因此 Node.js 中需要用新的 .mjs 后缀名。
2. CommonJS 可以通过 import API 引用 ESM，ESM 则可以直接 import CommonJS。
3. `import =` 语法受到 Babel 和 TypeScript 支持，但不符合 ES Modules 标准。
4. TypeScript 中通过 `import * as` 引用 CommonJS 的方式不符合 ES Modules 标准。
5. 使用 default-import + esModuleInterop 来让你的 TS 代码符合 ES Modules 标准。
6. 开启 esModuleInterop 之后，allowSyntheticDefaultImports 也会自动开启。

<!--more-->

## ESM 和 CommonJS 的区别

### 导出名字绑定

CommonJS 的 exports 是一个普通的 JavaScript 对象，而 ESM 的 export 和 import 是关键字，其声明的名字始终是绑定。
比如对 `exports.bar` 属性的引用是值引用，
当 `exports.bar` 改变指向到另一个对象后，此前的引用仍然保持旧的值：

```
// file: foo.js
setTimeout(function() { exports.bar = 'coo' })
exports.bar = 'bar'

// file: index.js
var bar = require('./foo').bar
// bar 的值总是 'bar'，不会跟着 foo.js 中的 exports.bar 改变
```

而在 ESM 中 export/import 的 bar 始终是同一个变量。
也就是说 export 处对 bar 的变更会直接体现在 import 处。例如：

```
// file: index.mjs
import { bar } from './foo'
// bar 的值会跟着 foo.js 中的 bar 改变而改变

// file: foo.mjs
export let bar = 'bar'
setTimeout(() => bar = 'coo')
```

名字绑定的实现细节可以参考 [这篇文章](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)。

### strict

解析 ES Modules 时总是 "strict" 模式。就像头部写了 "use strict" 一样。

### 语法不兼容

- CommonJS 中没有 `import`, `export` 关键字（注意 [import API][import] 是函数不是关键字），会引发解析错。
- 反过来引用 ESM 必须用 `import`，用 `require` 会发生 `ERR_REQUIRE_ESM` 错误。

### 跨域行为

浏览器下载 ES Modules 时使用 CORS 模式。
因此跨域脚本需要设置 [CORS HTTP 头][cors]，比如 `Access-Control-Allow-Origin: *`，也就不允许 `file://` 协议因为它的 origin 是 null。
也就是说 **脚本不能再随便跨域了**，JSONP 之类的魔法在 ESM 上不生效。

### this

- 浏览器中 `this === window`
- CommonJS 中 `this === global`
- ES Modules 中 `this === undefined`。

### 文件后缀

因为需要不同的模式去解析，所以 JS 引擎在解析一个模块之前就需要知道它是 ES Module 还是 ES5 的 CommonJS。
因此 [Node.js 下 ES Modules][node-esm] 要使用新的后缀 `.mjs`，浏览器中要设置 script 标签的 `type="module"`。

## CommonJS 引用 ESM

ES Modules 的设计主要考虑能够引用旧的 CommonJS，而且为了更大程度的兼容 ES Modules 一般会在发布前编译到 CommonJS。
因此 CommonJS 直接引用 ES Modules 的情况比较少。但如果真的存在这种情况，需要使用 [import][import] API：

```javascript
const foo = await import('./foo.mjs')
```

## ESM 引用 CommonJS

Node.js 从 13.2.0 开始支持 ES Modules，之前的版本比如 Node.js 10 中需要通过 `--experimental-modules` 开关来启用，更之前的版本就得通过 Babel 或 TypeScript 来用了。

总之 Node.js 支持在 ESM 中可以直接使用 import 语句来引入 CommonJS 模块：

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
而且非常方便从 ES5 的 `const a = require('./a.js')` 语法迁移代码。
因此这种使用方式非常流行。
**尽管如此，它没有定义在 ES Modules 标准中，也就是说 `import = ` 是不标准的**。

## TypeScript esModuleInterop

### TypeScript 的问题

当前较常见的方式是使用 Babel 或 [TypeScript][tsc] 把 ESM 编译到 CommonJS 再用 Node.js 去执行。
但这些工具不都是符合 ES Modules 标准的，比如 TypeScript 下 `import * as` 和 `import from` 等价。假设我们有一个 index.ts 的 ESM，需要引用 foo.js：

```javascript
// file: foo.js
exports.bar = 'bar'
```

```typescript
// file: index.ts
import * as foo from './foo.js'
console.log(foo.bar) 	// 期望输出 "bar"
```

TypeScript 在默认设置上述代码可以正常运行，即 foo 的值为 `{bar: "bar"}`。
而按照 ES Modules 规范 `foo` 得到的值应该是 [namespace object][namespace object]，即 `{default: {bar: "bar"}}`。

### 让 TypeScript 符合 ESM 标准

我们希望在上面的 TypeScript 里得到 `{bar: "bar"}` 的同时符合 ES Modules 标准，
就要通过 default-import 的方式来引用，上述 index.ts 符合 ESM 规范的写法为：

```typescript
// file: index.ts
import foo from './foo.js'
console.log(foo.bar) 	// 期望输出 "bar"
```

但默认配置下 tsc 编译后代码会在运行时出错，
**因为使用了 default-import 语法但 foo.js 没有定义 default。**：

> 注意：如果在编译期就出错了那说明还有其他问题。
> 比如 TS7016: Could not find a declaration file，需要先把 noImplicitAny 关掉。
> 也可以加一个 .d.ts 来解决，但这样类型和运行时需要分开考虑，详见下文。

```javascript
// file: index.ts 编译后的 index.js
let file_foo = require('./foo.js')
console.log(file_foo.default.bar)	// file_foo.default 未定义！
```

这时你需要在 tsconfig 里设置 [esModuleInterop][esModuleInterop] 为 `true`，
tsc 就会帮你生成一个 default。大概会编译成：

> 注意：以下代码是示意性的，实际会生成 `__importDefault()` 和 `__importStar()` 工具函数包装 `require()`，比如还需要检测 foo.js 是不是 ESM 编译得到的产出。
> 详见 [这个 Stack Overflow](https://stackoverflow.com/questions/56238356/understanding-esmoduleinterop-in-tsconfig-file)。

```javascript
// file: index.ts 编译后的 index.js
file_foo = { default: require('./foo.js') }
console.log(file_foo.default.bar)
```

总之会对 foo.js 的 exports 包装一个 default，上述代码就可以正常运行了。

### 有类型声明的情况

现在来考虑 foo.js 有对应的类型定义的情况，比如有一个 foo.d.ts：

```typescript
// file: foo.d.ts
export const bar: string
```

那么 tsc 会发现 foo.js 没有定义 default，会在编译期抛错 TS1259: can only be default-imported using the 'esModuleInterop' flag。
同样地，打开 esModuleInterop 之后就正常了。

### 有定义 default 的情况

再考虑 foo.js 定义了 default 的情况。这种情况下上述 foo.js 可以写成：

```javascript
// file: foo.js
exports.bar = 'bar'
exports.default = exports
```

通常 CommonJS 不会这样做，但是为了兼容 ESM 很多 npm 包都导出了一个额外的 default。
这时如果 foo.js 没有对应的类型声明，tsc 就不会做它的类型检查，运行时也可以读取到 default 属性，一切都很好。

但如果存在一个类型定义（比如你去 Definitely Typed 安装了一个类型文件），
并且这个类型定义里没有写 default。例如：

```typescript
// file: foo.d.ts
export const bar: string
```

这时我们不需要 esModuleInterop 来帮忙包装 default（因为 foo.js 中已经定义好了），
但是在类型系统中 tsc 会发现 foo.d.ts 对应的类型中不存在 default，就会抛出 TS2613 错误：".../foo" has no default export。

这种情况下只需要禁用这个错误，在 tsconfig 里设置 [allowSyntheticDefaultImports][allowSyntheticDefaultImports] 为 `true` 就可以解决。
也就是说这个选项只是让 TypeScript 的类型系统忽略 default 未定义的问题，
我们来确保运行时 default 是有定义的。

注意 **开启 esModuleInterop 之后，allowSyntheticDefaultImports 也会自动开启**。因为既然会自动生成 default，那么检查是否有 default 声明就没有意义了。

[cors]: /2015/10/10/cross-origin.html
[require]: https://nodejs.org/api/modules.html#modules_all_together
[import]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
[node-esm]: http://2ality.com/2017/09/native-esm-node.html
[tsc]: https://www.typescriptlang.org/docs/tutorial.html
[namespace object]: http://www.ecma-international.org/ecma-262/6.0/index.html#sec-module-namespace-objects
[allowSyntheticDefaultImports]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
[esModuleInterop]: https://www.typescriptlang.org/docs/handbook/compiler-options.html
[modules]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules
