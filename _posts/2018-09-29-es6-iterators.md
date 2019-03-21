---
title: ES6 迭代器：Iterator, Iterable 和 Generator
tags: ES6 JavaScript 生成器 迭代器
---

对集合中每个元素进行处理是很常见的操作，比如数组遍历、对象的属性遍历。
以往这些操作是通过 `for` 循环、`.forEach`、`.map` 等方式进行，
在 [ES6][es6] 中直接把迭代放在语言层面进行支持，同时提供定制 `for...of` 的机制。
借由迭代器机制为 Map、Array、String 等对象提供了统一的遍历语法，以及更方便的相互转换。
为方便编写迭代器还提供了生成器（Generator）语法。

本文展开介绍了这些相关概念：Iterables（可迭代对象）、Iterator（迭代器）、
Generator（生成器）和 Generator Function（生成器函数），
以及相关机制：Iterable Protocol、Iterator Protocol、Symbol.iterator。

<!--more-->

## Iterables 和 Iterators

实现了 Iterable Protocol 的对象称为 **可迭代对象（Iterables）**，这种对象可以用 `for...of` 来遍历。
[Map][map], [Set][set], Array, String 都属于可迭代对象。
自定义的对象也可以使用这一机制，成为可迭代对象。

**Iterable Protocol**：需要实现一个 ECMA `@@iterator` 方法，即在键 `[Symbol.iterator]` 上提供一个方法。对象被 `for...of` 调用时，这个方法会被调用。方法应该返回一个迭代器对象（Iterator）用来迭代。

实现了 Iterator Protocol 的对象称为 **迭代器对象（Iterator）**，也就是我们说的迭代器对象。

**Iterator Protocol**：又称 Iteration Protocol，需要实现一个 `next()` 方法，每次调用会返回一个包含 `value`（当前指向的值）和 `done`（是否已经迭代完成）的对象。

## 标准 Iterables 举例：Array

Array 可以用 `for...of` 来遍历，是一个可迭代对象。
我们来观察它是如何实现上述 Protocol 的。首先拿到它的 `Symbol.iterator` 属性（Iterable Protocol）：

```javascript
let arr = ['Alice', 'Bob', 'Carol']
let iterator = arr[Symbol.iterator]()
```

然后调用它的 `.next()` 方法（Iterator Protocol）得到，直到 `done === true`：

```javascript
console.log(iterator.next())    // { value: 'Alice', done: false }
console.log(iterator.next())    // { value: 'Bob', done: false }
console.log(iterator.next())    // { value: 'Carol', done: false }
console.log(iterator.next())    // { value: undefined, done: true }
```

## 自定义 Iterables

除了 Array、Map 等标准的全局对象外，我们的自定义对象也可以通过提供一个 `Symbol.iterator` 成为 Iteratable。
比如实现一个 50 以内的 [斐波那契数列][fibonacci]：

```javascript
let obj = {
    [Symbol.iterator]: function () {
        let a = 0, b = 0
        return {
            next: function () {
                let value = 0
                if (!a) {
                    value = a = 1
                }
                else if (!b) {
                    value = b = 1
                }
                else if (b < 50){
                    value = a + b
                    a = b
                    b = value
                }
                return {done: value === 0, value}
            }
        }
    }
}
for (let i of obj) {
    console.log(i)  // 1 1 2 3 5 8 13 21 34 55
}
```

## 利用 Generator

上述迭代器中我们维护了 `a` 和 `b` 两个状态，以及每次调用进入的条件分支。
ES6 提供了 [Generator Function][function*]（生成器方法）来方便上述迭代器的实现。
生成器方法返回的 [Generator 对象][generator-obj] 直接就是一个实现了 Iterator Protocol 的对象。

下面使用生成器方法重新实现50以内的斐波那契数列：

```javascript
let obj = {
    [Symbol.iterator]: function *() {
        let a = 1, b = 1
        yield a
        yield b
        while (b < 50) {
            yield b = a + b
            a = b - a
        }
    }
}
for (let i of obj) {
    console.log(i)  // 1 1 2 3 5 8 13 21 34 55
}
```

## Map, Set, String, Array 互相转换

Iteration Protocol 给出了统一的迭代协议，使得不同类型的集合间转换更加方便，也方便了编写适用于不同类型集合的算法。
这一概念类似 [Lodash](https://lodash.com) 中的 Collection，
或者 [STL 中的迭代器](/2015/07/01/introduction-to-stl.html)。以下是一些很方便的转换技巧：


从 `Array` 生成 `Set`，可用于数组去重：

```javascript
new Set(['Alice', 'Bob', 'Carol'])    // {'Alice', 'Bob', 'Carol'}
// 等价于
new Set(['Alice', 'Bob', 'Carol'][Symbol.iterator]())
```

从 `Set` 得到 `Array`：

```javascript
let set = new Set(['Alice', 'Bob', 'Carol'])
Array.from(set) // 'Alice', 'Bob', 'Carol'
// 等价于
Array.from(set[Symbol.iterator]())
```

除了 `for...of` 外，[展开语法][spread-syntax]（Spread Syntax）`...` 也支持迭代器（Iterables）。借此可以简写作：

```javascript
let set = new Set(['Alice', 'Bob', 'Carol'])
let names = [...set]        // 'Alice', 'Bob', 'Carol'
```

从 `String` 到 `Set`，得到字符串中包含的字符：

```javascript
let alphabet = 'abcdefghijklmnopqrstuvwxyz';
new Set(alphabet)           // {'a', 'b', 'c', ...}
// 等价于
new Set('alice bob'[Symbol.iterator]())
```

从 `Object` 到 `Map`，也就是把传统的 JavaScript 映射转换为 `Map`：

```javascript
let mapping = {
    "foo": "bar"
}
new Map(Object.entries(mapping))    // {"foo" => "bar"}
```

类似地，`Object` 的键的集合可以这样获取：

```javascript
let mapping = {
    "foo": "bar"
}
new Set(Object.keys(mapping))    // {"foo"}
```

## 参考链接

* <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map>
* <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set>
* <https://www.ecma-international.org/ecma-262/6.0/#sec-iteration>
* <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators>
* <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols>
* <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator>
* <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*>
* <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax>

[spread-syntax]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
[generator-obj]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
[es6]: https://www.ecma-international.org/ecma-262/6.0/#sec-iteration
[map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[function*]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
[fibonacci]: https://zh.wikipedia.org/wiki/%E6%96%90%E6%B3%A2%E9%82%A3%E5%A5%91%E6%95%B0%E5%88%97
