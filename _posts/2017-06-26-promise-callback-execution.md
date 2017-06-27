---
title: Promise 回调的执行
tags: JavaScript Promise 异步
---

[Promise](/2016/08/10/promise.html) 是 JavaScript 中处理异步的一种模式，
可以大幅简化异步代码和增加可读性，[基于 Promise 的单元测试][promise-test] 也更加可读。
本文参考了 [Promises/A+][promise-aplus]、[ECMA 2015][promise-es6] 等文档，
测试了 [Bluebird][bb], Chrome 58.0.3029.110，Node.js 6.9.2 等环境，给出 Promise 异步行为。

## TL; DR

* `Promise.prototype.then` 传入的回调会在 NextTick（异步）执行
* 构造 Promise 时传入的 `executor` 会立即执行
* Promise 的各种实现表现一致

# onFulfilled 是异步的

根据 [PerformPromiseThen][PerformPromiseThen] 算法，调用 `.then()` 时会将 `onFulfilled`, `onRejected` 两个回调作为新的 Job 传入 `EnqueueJob (queueName, job, arguments)`。
即通过 `.then()` 传入的回调是异步执行的。

```javascript
console.log('before .then call')
Promise.resolve('onFulfilled called').then(console.log)
console.log('after .then call')
```

输出为：

```
before .then call
after .then call
onFulfilled called
```

# 构造 executor 是同步的

传入 `new Promise(<executor>)` 的回调会立即执行，是同步的。例如：

```javascript
console.log('before constructor call')
new Promise(() => console.log('executor called'))
console.log('after constructor call')
```

输出为：

```
before constructor call
executor called
after constructor call
```

[promise-aplus]: https://promisesaplus.com/
[promise-es6]: http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects
[promise-test]: /2016/07/12/async-test-with-chai-as-promised.html
[bb]: http://bluebirdjs.com/docs/getting-started.html
[PerformPromiseThen]: http://www.ecma-international.org/ecma-262/6.0/#sec-performpromisethen
