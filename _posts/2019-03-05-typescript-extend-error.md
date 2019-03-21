---
title: TypeScript 中如何继承 Error 类
tags: TypeScript Error 原型链
---

在 JavaScript 中很多时候都需要自定义错误，尤其是开发 Node.js  应用的时候。
比如一个典型的网站服务器可能需要有 `NetworkError`, `DatabaseError`, `UnauthorizedError` 等。
我们希望这些类都拥有 `Error` 的特性：有错误消息、有调用栈、有方便打印的 `toString` 等。
最直观的实现方式便是 **继承 Error 类**。
但考虑 TypeScript 需要编译到 ES5 兼容性问题会较为复杂，
本文用来帮助理解 TypeScript 中继承 Error 的问题来源以及对应的几种解决方式。

<!--more-->

## 我们需要怎样的 CustomError

为了容易讨论最佳实践，首先明确我们自定义的 CustomError 需要做到哪些功能。
下面是 Harttle 的观点：

1. 可以调用 `new CustomError()` 来创建，并且 `instanceof Error` 操作应该返回 `true`。可以用来创建是基本要求，能够被视为 `Error` 的实例能够兼容既有系统（比如 `toString()` 要返回调用栈），同时符合惯例。
2. `.stack` 属性首行应为 `CustomeError: <message>`。如果是 `Error: <message>` 可能就没那么漂亮。
3. `.stack` 属性应当包含调用栈并指向 `new CustomError()` 的那一行。这一点可能是关键，如果指向 `CustomError` 构造函数中的某一行，就会给这个类的使用方造成困惑。

下面举个例子，这是一个 `message` 为 `"intended"` 的 `CustomError` 的 `.stack` 属性值：

```
CustomError: intended
    at Object.<anonymous> (/Users/harttle/Downloads/bar/a.js:10:13)
    at Module._compile (module.js:653:30)
    at Object.Module._extensions..js (module.js:664:10)
    at Module.load (module.js:566:32)
    at tryModuleLoad (module.js:506:12)
    at Function.Module._load (module.js:498:3)
    at Function.Module.runMain (module.js:694:10)
    at startup (bootstrap_node.js:204:16)
    at bootstrap_node.js:625:3
```

## ES5 中如何继承 Error？

Error 是一个特殊的对象，或者说 JavaScript 的 `new` 是一个奇葩的存在。
为方便后续讨论，我们先讨论组 ES5 时代是怎样继承 Error 的。
[我们说 JavaScript 是一门混杂的语言][whatsjs]，如何继承 Error 就是一个典型的例子。
如果你熟悉 [原型继承的方式][prototype]，应该会写出如下代码：

```javascript
function CustomError (message) {
    Error.call(this, message)
}
CustomError.prototype = new Error()
```

因为 stack 只在 `new` 的时候生成，上述实现不能满足功能 2 和功能 3，也就是说：

* stack 的第一行是总是 `Error` 而不是 `CustomError` 且不包含 message 信息。
* stack 总是指向 `new Error()` 的那一行，而不是 `new CustomError()`。

[Node 文档](https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt) 中描述了一个 `captureStackTrace` 方法来解决这个问题，改动后的实现如下：

```javascript
function CustomError (msg) {
    this.name = 'CustomError'
    this.message = msg
    Error.captureStackTrace(this, CustomError)
}
CustomError.prototype = new Error()
```

其中 `.captureStackTrace()` 会使用传入对象的 name 和 message 来生成 stack 的前缀；同时第二个参数用来指定在调用栈中忽略掉哪一部分，这样栈就会指向 `new CustomError` 的地方而不是 `captureStackTrace()` 的地方。

## ES6 中如何继承 Error?

既然 ES6 通过 `class` 和 `extends` 等关键字给出了类继承机制，
那么想必通过编写 `CustomError` 类来继承 `Error`。事实也确实如此，只需要在构造函数中调用父类构造函数并赋值 `name` 即可实现文章开始提到的三个功能：

```javascript
class CustomError extends Error {
    constructor(msg) {
        super(msg)
        this.name = 'CustomError'
    }
}
```

## TypeScript 中如何继承 Error?

ES6 中提供了 [new.target][new.target] 属性，
使得 `Error` 的构造函数中可以获取 `CustomError` 的信息，以完成原型链的调整。
因此 TypeScript 需要编译到 ES5 时上述功能仍然是无法自动实现。
在 TypeScript 中的体现是形如上述 ES6 的代码片段会被编译成：

```javascript
var CustomError = /** @class */ (function (_super) {
    __extends(CustomError, _super);
    function CustomError(msg) {
        var _this = _super.call(this, msg) || this;
        _this.name = 'CustomError';
        return _this;
    }
    return CustomError;
}(Error));
```

注意 `var _this = _super.call(this, msg) || this;` 中 **this 被替换掉了**。
在 TypeScript 2.1 的 [changelog][changelog] 中描述了这个 Breaking Change。
**这会造成 `CustomError` 的所有对象方法都无法使用，这里介绍几种 workaround：

> 题外话，这个分支可能会导致测试覆盖率中的 [分支未覆盖问题](https://github.com/gotwarlost/istanbul/issues/690)。可以只在 ES6 下产生测试覆盖报告来解决。

### 1. 使用 [setPrototypeOf][setPrototypeOf] 还原原型链

这是 TypeScript 官方给出的解决方法，见 [这里][changelog]。

```typescript
class CustomError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, FooError.prototype);
    }
}
```

注意这是一个性能很差的方法，且在 ES6 中提出，兼容性也很差。在不兼容的环境下可以使用 `__proto__` 来替代。
更多原型链的解释可以参考 [JavaScript 内置对象与原型链结构](/2015/09/21/js-prototype-chain.html)。

### 2. 坚持使用 ES5 的方式

不使用 ES6 特性，仍然使用本文前面介绍的 『ES5 中如何继承 Error？』给出的方法。

### 3. 限制对象方法的使用

虽然 `CustomError` 的对象函数无法使用，但 **`CustomError` 仍然支持 protected 级别的方法供子类使用，阉割的地方在于自己不能调用。**
由于 JavaScript 中对象属性必须在构造函数内赋值，因此**对象属性也不会受到影响**。也就是说：


```typescript
class CustomError extends Error {
    count: number = 0
    constructor(msg) {
        super(msg)
        this.count      // OK，属性不受影响
        this.print()    // TypeError: _this.print is not a function，因为 this 被替换了
    }
    print() { 
        console.log(this.stack)
    }
}
class DerivedError extends CustomError {
    constructor(msg) {
        super(msg)
        super.print()   // OK，因为 print 是直接从父类原型获取的，即 `_super.prototype.print`
    }
}
```

[whatsjs]: /2018/10/14/so-what-is-js.html
[prototype]: /2016/02/17/js-prototypal-inheritance.html
[new.target]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new.target
[changelog]: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
[setPrototypeOf]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
