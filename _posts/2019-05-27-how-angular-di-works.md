---
title: Angular DI 是怎么工作的？
tags: TypeScript 依赖注入 反射 装饰器
---

这又是一篇短命的（short-lived）描述当下技术框架的博客文章。
DI（依赖注入、Dependency injection）是一种设计模式，常用来提升代码的可复用性、健壮性和可测试性。
DI 在前端的流行很大程度上归功于它在 Angular1.x 中的应用。
Angular 2 以后借助 TypeScript 的类型分析，可以干脆省去了 Angular1.x 中冗余的依赖声明。
本文用来解释这个魔法是怎么工作的，以及相关的标准化 Proposal 和实现 Trick。

> 对于不熟悉依赖注入的同学可以参考我的另外两篇文章
> [什么时候应该使用依赖注入](https://harttle.land/2016/11/12/dependency-injection.html) 和
> [JavaScript 依赖注入实现](https://harttle.land/2016/11/19/javascript-dependency-injection-implementation.html)，
> 或者 [Wikipedia: DI](https://en.wikipedia.org/wiki/Dependency_injection)。这里还有一篇 Angular 的教程：<https://angular.io/guide/dependency-injection>

<!--more-->

## 一个例子

### Angular1.x

为了方便说明，我们先给一个 Angular1 Dependency Injection 的例子：

```javascript
angular.module('bar').controller('Bar', function (Foo) {})
```

在使用上述组件（Bar）时，Angular DI 会创建一个 Foo 并用来初始化 Bar 的实例。
Angular 使用 `Function.prototype.toString` 来获取控制器 Bar 的参数需要哪些类型。
因此如果上述代码经过 uglify 之后依赖注入会不起作用。因此有另一种写法：

```javascript
// 因为字符串字面量不会被 uglify，相当于通过字符串字面量来声明依赖
angular.module('bar').controller('Bar', ['Foo', function (Foo) {}])
```

### Angular with TypeScript

再看 TypeScript 下的 Angular2 代码，省去了这个字面量的声明：

```typescript
import { Foo } from './foo'

@Component({...})
class Bar {
  constructor(private foo: Foo) {}
}
```

上述 TypeScript 代码中 Bar 只依赖 Foo 的类型，
这意味着 TypeScript 编译上述代码得到的文件中没有对 Foo 的引用。
**这里的魔法在于：Angular DI 是怎么在运行时知道 Bar 的第一个参数类型是 Foo？**

## 装饰器

装饰器是一种用来提供面向切面编程功能的一种语法构造。
目前是一个 [Stage2 Proposal](https://github.com/tc39/proposal-decorators)，还没有进入 ECMA 标准。

在 TypeScript 可以打开 `experimentalDecorators` 选项来使用。
它的原理就是调用自定义的一个高阶函数，来操作被装饰的函数。
可以参考 TypeScript 教程：<https://www.typescriptlang.org/docs/handbook/decorators.html>。
比如上面的 Component 装饰器，它会在运行时对 Bar 做一个转换。比如这样：

```javascript
var __decorator = function() {/*...*/}
var Bar = function (foo) {
    this.foo = foo
}
Bar = __decorate([Component], Bar)

function Component(Bar) {
    // 对 Bar 进行一些操作，甚至返回一个新的类替代原来的 Bar
}
```

**借助于装饰器的机制，我们就有机会在 Component 函数中标记 Bar 的依赖信息**。
如果你是分模块编译的，可能需要避免重复输出 `__decorator` 函数的定义。
设置 [importHelpers](https://www.typescriptlang.org/docs/handbook/compiler-options.html) 编译器参数可以禁止它输出，
然后在运行时统一引入 [tslib](https://www.npmjs.com/package/tslib)。
当然如果你在使用 Angular，则应该引入 Angular Polyfill。

## 获取依赖信息

恰好 TypeScript 提供来一个 `emitDecoratorMetadata` 开关来产出编译时的类型信息给装饰器。
目前只提供三种类型信息：

* "design:type"
* "design:paramtypes"
* "design:returntype"。

参考这个 Issue <https://github.com/Microsoft/TypeScript/issues/2577>。
打开 `emitDecoratorMetadata` 开关后编译后代码会多这样一部分内容：

```javascript
var Bar = __decorate([
    __metadata('design:paramtypes', [foo_1.Foo])
], Bar);
```

可以看到它把 Bar 的参数类型 Foo 传给来 `__metadata` 这个 Helper。
这里和 Angular1.x 的不同还在于这里存的类型就是对函数 Foo 的引用，不是某种序列化后的字符串。
这意味着 Angular DI 不依赖于序列化后的字符串和被注入函数之间的对应关系；
但是也意味着这个类型只能是 class、string、object 这样的既存在于编译期也存在于运行时的类型。
比如 Interface 和 Type 这样的类型信息就无法记录，参考：
<https://github.com/microsoft/TypeScript/issues/3015#issuecomment-98852421>

接下来的问题就是，`__metadata` 怎么存储这个类型信息 `Foo`，最终怎么让 Angular DI 读取到。
由于 Angular DI 容器需要在运行时使用这个信息，这就需要 JavaScript 的反射机制。

## Metadata Reflection API

[反射](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
用来在运行时检查和操作对象，是 ES6 标准的一部分。
而 [Reflect Metadata 提案](https://rbuckton.github.io/reflect-metadata)
则是让 Reflect API 可以提供对类型的元数据进行操作的方法，
需要引入 Polyfill：[reflect-metadata](https://www.npmjs.com/package/reflect-metadata)。

元数据反射机制的灵感来源是 C#、Java 之类的语言。
它们可以在源代码中通过一些标注来给类型设置元数据，并用反射 API 在运行时读取。
总之 Reflect 就是用来存这些元数据（类型信息）的地方。
下面看一下 `__metadata` 是怎样使用 Metadata Reflection API 的：

```javascript
var __metadata = this && this.__metadata || function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
        return Reflect.metadata(k, v);
};
```

可以看到 `__metadata` Helper 把类型信息存到来 `Reflect.metadata` API 中。

## Angular DI 中获取类型信息

既然类型信息已经存入 Reflect API，Angular DI 就可以在创建 Bar 的时候拿到它的参数类型信息了。比如这样：

```javascript
function create(Bar) {
    const types = Reflect.getMetadata('design:paramtypes', Bar)
    const args = types.map(Type => new Type())
    return new Bar(...args)
}
```
