---
title: JavaScript 依赖注入实现
tags: AngularJS JavaScript defineProperty 容器 依赖注入
---

随着AngularJS的流行，依赖注入开始在JavaScript领域获得不少的关注。
DI最突出的好处在于开发可复用可测试的代码单元。
本文以简易的代码解释DI的实现机制，更多对DI优缺点的讨论可参考：
[什么时候应该使用依赖注入](/2016/11/12/dependency-injection.html)一文。

<!--more-->

## 一个基本的DI用例

每个模块声明自己的依赖，并提供自己的服务。例如：

```javascript
di.service('foo', ['bar'], function foo(bar){
    function Foo(){
        this.bar = bar;
    }
    this.prototype.greeting = function(){
        console.log('hello, world');
    }
    return Foo;
});
var foo = di.container.get('foo');
foo.greeting();
```

注意依赖注入和CommonJS（或AMD）的区别，`foo`只需要声明其依赖项`bar`而不需要主动获取。
正是这一点使得`function foo`对依赖所处的位置和构建方法都完全无知，
`function foo`成为可测试、可复用的代码单元。

## DI 框架的设计

注册服务和使用服务应该在不同时期进行。
作为一种特殊的依赖解决工具，DI框架将软件单元的生命周期分为注册阶段和运行阶段。
上述例子中，在注册阶段提供`foo`和`bar`服务，在运行阶段获取并使用这些服务。
多数DI框架都采取lazy construction的策略，该策略也避免了在注册阶段进行构造的困难。

服务的定制可以在注册阶段后运行阶段前进行。
[AngularJS 1][ng]引入配置阶段来定制这些服务，其Provider可以理解为一个特化的工厂对象。
[BottleJS][BottleJS]则使用修饰器和中间件来支持对服务的定制。

使用IoC容器来索引服务实例或存储服务提供者。
当有人提供服务时就把它加入到容器中，
当有人使用服务时就从容器中查找提供者并生成一个服务实例。
通常服务的实例可以被缓存。

## DI 框架的实现

先来实现最常见的接口函数`.service()`，该接口用来注册一个服务的构造器。
被传入的函数将会被进行`new`操作。

```javascript
var di = {
    container: {}
};

di.service = function(name, Constructor) {
    defineLazyProperty(name, () => new Constructor());
};

function defineLazyProperty(name, getter){
    Object.defineProperty(di.container, name, {
        configurable: true,
        get: function() {
            var obj = getter(container);
            Object.defineProperty(di.container, name, {
                configurable: false
                value: obj
            });
            return obj;
        }
    });
}
```

[Object.defineProperty][defprop] 在这里用来做服务缓存。
只在第一次构建服务时调用构造器，后续的访问就是直接读取IoC容器的属性。
它是ES5的标准方法[兼容性非常好][caniuse-defprop]。
有了`defineLazyProperty()`方法，这些常用的注册接口实现就很直观了：

```javascript
di.factory = function(name, factory) {
    return defineLazyProperty(name, factory);
};

di.provider = function(name, Provider) {
    return defineLazyProperty(name, function(){
        var provider = new Provider();
        return provider.$get();
    });
};

di.value = function(name, val) {
    return defineLazyProperty(name, () => val);
};
```

服务的定制接口就不再赘述了，值得一提的是统一的服务定制需要统一的服务构造方法，
而不是直接调用`.defineLazyProperty()`生成属性。
[AngularJS][ng] 中这些策略都由 Provider 来实现，
其他的所有服务注册方法都借由Provider来实现。

[BottleJS]: https://github.com/young-steveo/bottlejs
[ng]: https://angularjs.org/
[defprop]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
[caniuse-defprop]: http://caniuse.com/#search=defineproperty
