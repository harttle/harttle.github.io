---
title: ES6 Symbol 的用途
tags: ES6 Symbol 迭代器
---

[Symbol][mdn-symbol] 唯一的用途就是标识对象属性，表明对象支持的功能。
相比于字符属性名，Symbol 的区别在于唯一，可避免名字冲突。
这样 Symbol 就给出了唯一标识类型信息的一种方式，从这个角度看有点类似 C++ 的 [Traits][traits]。

<!--more-->

# 解决了什么问题

在 JavaScript 中要判断一个对象支持的功能，常常需要做一些 Duck Test。
比如经常需要判断一个对象是否可以按照数组的方式去迭代，这类对象称为 Array-like。
[lodash][lodash] 中是这样判断的：

```javascript
function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
}
```

在 ES6 中提出一个 `@@iterator` 方法，所有支持迭代的对象（比如 `Array`、`Map`、`Set`）都要实现。
`@@iterator` 方法的属性键为 `Symbol.iterator` 而非字符串。
这样只要对象定义有 `Symbol.iterator` 属性就可以用 `for ... of` 进行迭代。
比如：

```javascript
if (Symbol.iterator in arr) {
    for(let n of arr) console.log(n)
}
```

# 其他用例

上述例子中 Symbol 标识了这个对象是可迭代的（Iterables），是一个典型的 Symbol 用例。
详情可以参考 [ES6 迭代器](/2018/09/29/es6-iterators.html) 一文。
此外利用 Symbol 还可以做很多其他事情，例如：

## 常量枚举

JavaScript 没有枚举类型，常量概念也通常用字符串或数字表示。例如：

```javascript
const COLOR_GREEN = 1
const COLOR_RED = 2

function isSafe(trafficLight) {
    if (trafficLight === COLOR_RED) return false
    if (trafficLight === COLOR_GREEN) return true
    throw new Error(`invalid trafficLight: ${trafficLight}`)
}
```

* 我们需要认真地排列这些常量的值。如果不小心有两个值重复会很难调试，就像 `#define false true` 引起的问题一样。
* 取值可能重复。如果有另一处定义了 `BUSY = 1` 并不小心把 `BUSY` 传入，干脆 `isSafe(1)`，理想的枚举概念应该抛出异常，但上述代码无法检测。

Symbol 给出了解决方案：

```javascript
const COLOR_GREEN = Symbol('green')
const COLOR_RED = Symbol('red')
```

即使字符串写错或重复也不重要，因为每次调用 `Symbol()` 都会给出独一无二的值。
这样就可以确保所有 `isSafe()` 调用都传入这两个 Symbol 之一。

## 私有属性

由于没有访问限制，JavaScript 曾经有一个惯例：私有属性以下划线起始来命名。
这样不仅无法隐藏这些名字，而且会搞坏代码风格。
可以利用 Symbol 来隐藏这些私有属性：

```javascript
let speak = Symbol('speak')
class Person {
    [speak]() {
        console.log('harttle')
    }
}
```

如下几种访问都获取不到 `speak` 属性：

```javascript
let p = new Person()

Object.keys(p)                      // []
Object.getOwnPropertyNames(p)       // []
for(let key in p) console.log(key)  // <empty>
```

但 Symbol 只能隐藏这些函数，并不能阻止未授权访问。
仍然可以通过 `Object.getOwnPerpertySymbols()`, `Reflect.ownKeys(p)` 来枚举到 `speak` 属性。

# 新的基本类型

Symbol 是新的基本类型，从此 [JavaScript 有 7 种类型][js-type]：

* `Number`
* `Boolean`
* `String`
* `undefined`
* `null`
* `Symbol`
* `Object`

## 转换为字符串

Symbol 支持 `symbol.toString()` 方法以及 `String(symbol)`，
但不能通过 `+` 转换为字符串，也不能直接用于模板字符串输出。
后两种情况都会产生 `TypeError`，是为了避免把它当做字符串属性名来使用。

## 转换为数字

不可转换为数字。`Number(symbol)` 或四则运算都会产生 `TypeError`。

## 转换为布尔

`Boolean(symbol)` 和取非运算都 OK。这是为了方便判断是否包含属性。

## 包裹对象

Symbol 是基本类型，但不能用 `new Symbol(sym)` 来包裹成对象，需要使用 `Object(sym)`。
除了判等不成立外，包裹对象的使用与原基本类型几乎相同：

```javascript
let sym = Symbol('author')
let obj = {
    [sym]: 'harttle'
}
let wrapped = Object(sym)
wrapped instanceof Symbol   // true，真的是true!!!
obj[sym]                    // 'harttle'
obj[wrapped]                // 'harttle'
```

# 常见的 Symbol

文章最前面的例子提到的 `Symbol.iterator` 是一个内置 Symbol。除此之外常见的内置 Symbol 还有：

## Symbol.match

`Symbol.match` 在 `String.prototype.match()` 中用于获取 `RegExp` 对象的匹配方法。
我们来改写一下 `Symbol.match` 标识的方法，观察 `String.prototype.match()` 的表现，
下面的例子来自 MDN：

```javascript
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/@@match
class RegExp1 extends RegExp {
  [Symbol.match](str) {
    var result = RegExp.prototype[Symbol.match].call(this, str);
    return result ? 'VALID' : 'INVALID';
  }
}

console.log('2012-07-02'.match(new RegExp1('([0-9]+)-([0-9]+)-([0-9]+)')));
// expected output: "VALID"
```

## Symbol.toPrimitive

在对象进行运算时经常会变成 `"[object Object]"`，
这是对象转换为字符串（基本数据类型）的默认行为，定义在 `Object.prototype.toString`。
比如这个对象：

```javascript
var count = {
    value: 3
};
count + 2     // "[object Object]2"
```

这个对象也在表示一个数字，怎么让它可以参加四则运算呢？
给它加一个 `Symbol.toPrimitive` 属性，来改变它转换为基本类型的行为：

```javascript
count[Symbol.toPrimitive] = function () {
    return this.value
};
count + 2     // 5
```

更多内置 Symbol 请参考 MDN 文档： <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Well-known_symbols>

# 跨 Realm 使用

JavaScript Realm 是指当前代码片段运行的上下文，包括全局变量，比如 `Array`, `Date` 这些全局函数。
在打开新标签页、 加载 iframe 或加载 Worker 进程时，都会产生多个 JavaScript Realm。
跨 Realm 通信时这些全局变量是不同的，例如从 iframe 中传递给数组 `arr` 给父窗口，
父窗口中收到的 `arr instanceof Array` 为 `false`，因为它的原型是 iframe 中的那个 `Array`。

但是一个对象在 iframe 中可以迭代（Iterable），那么在父窗口中也应当能被迭代。
这就要求 Symbol 可以跨 Realm，当然 `Symbol.iterator` 可以。
如果你定义的 Symbol 也需要跨 Realm，请使用 Symbol Registry API：

```javascript
// 在 Symbol Registry 中注册一个跨 Realm Symbol
let sym = Symbol.for('foo')
// 获取 Symbol 的键值字符串
Symbol.keyFor(sym)      // 'foo'
```

内置的跨 Realm Symbol 其实不在 Symbol Registry 中：

```javascript
Symbol.keyFor(Symbol.iterator)  // undefined
```

[mdn-symbol]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
[traits]: /2015/09/15/effective-cpp-47.html
[lodash]: https://github.com/lodash/lodash/blob/4.17.10/lodash.js#L11331
[iterator]: /2018/09/29/es6-iterators.html
[js-type]: https://tc39.github.io/ecma262/#sec-ecmascript-language-types
