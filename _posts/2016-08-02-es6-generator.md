---
title: ES6生成器：可迭代协议与迭代器协议
tags: JavaScript 迭代器 生成器 ES6
---

ES6（ECMAScript 2015）中提出了**生成器**的概念，进一步完整了JavaScript语言。
本文介绍了可迭代协议与迭代器协议的概念区别，以及生成器的声明与使用方法。

# 生成器函数

生成器函数是用来返回生成器的函数，生成器是一种有状态的迭代器，
可实现较复杂的迭代行为，比如生成ID。
生成器函数使用`function*`语法来定义：

```javascript
function* idMaker(){
    var index = 0;
    while(index<3){
        yield index++;
    }
}
```

> 生成器函数也可以通过`GeneratorFunction`（类似`Function`）、`function* expression`来定义（可以使用匿名函数）。

<!--more-->

调用生成器函数并不会执行函数体，而是会返回一个**生成器**：

```javascript
var gen = idMaker();
```

# 生成器

ES6中生成器有三个方法：

* `Generator.prototype.next()`: 返回下一个`yield`的值。
* `Generator.prototype.return()`: 返回并结束生成器。
* `Generator.prototype.throw()`: 抛出错误。

示例代码：

```javascript
var gen = idMaker();

console.log(gen.next().value); // 0
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // undefined
```

# 可迭代协议

[可迭代协议][iteration-protocols]（iterable protocol）使得我们可以定制JavaScript对象
的迭代行为，比如定义`for...of`时迭代出来怎样的值。
将`[Symbol.iterator]`属性定义为一个**迭代器对象**即可实现该协议。

`String`, `Array`, `Map`等内置类型是满足可迭代协议的，例如：

```javascript
var someString = "hi";
var iterator = someString[Symbol.iterator]();
iterator.next();                             // { value: "h", done: false }
iterator.next();                             // { value: "i", done: false }
iterator.next();                             // { value: undefined, done: true }
```

# 迭代器协议

[迭代器协议][iteration-protocols]（iterator protocol）又称生成器协议，
该协议定义了什么是迭代器对象。其实迭代器协议很简单，
只要实现`.next()`方法（并具有对应语义）即可。
该方法返回的对象除`.value`属性外，
还应有一个`.done`属性来标识迭代器是否已越过最后一个元素：

```javascript
function* g(){
    yield 1;
    yield 2;
}
var iterator = g();
console.log(iterator.next());   // { value: 1, done: false }
console.log(iterator.next());   // { value: 2, done: false }
console.log(iterator.next());   // { value: undefined, done: true }
```

生成器函数中的`return`会立即结束生成器，因此`done`会立即变为`true`（不同于`yield`）。

```javascript
function* g(){
    yield 1;
    return 2;
}
var iterator = g();
console.log(iterator.next());   // { value: 1, done: false }
console.log(iterator.next());   // { value: 2, done: true }
console.log(iterator.next());   // { value: undefined, done: true }
```

# yield*

`yield*`可以将需要`yield`的值委托给另一个**生成器**，或其他任何可迭代对象
（由[ES6 迭代协议][iteration-protocols]规约）。例如：

```javascript
function* g1() {
  yield 2;
  yield 3;
  yield 4;
}

function* g2() {
  yield 1;
  yield* g1();
  yield 5;
}

var iterator = g2();

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: 4, done: false }
console.log(iterator.next()); // { value: 5, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

除了生成器外，`yield*`还可以委托给其他的可迭代类型：

```javascript
function* g() {
  yield* [1, 2];
  yield* "34";
  yield* arguments;
}

var iterator = g(5, 6);

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: "3", done: false }
console.log(iterator.next()); // { value: "4", done: false }
console.log(iterator.next()); // { value: 5, done: false }
console.log(iterator.next()); // { value: 6, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

# 参考阅读

* iteration protocols: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols>
* `function*`: <https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/function*>
* 生成器：<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator>
* 迭代协议：<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols>
* `yield`: <https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/yield>
* `yield*`: <https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/yield*>

> 文中代码来自[MDN][mdn]。

[mdn]: https://developer.mozilla.org
[iteration-protocols]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols
