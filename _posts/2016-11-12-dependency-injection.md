---
title: 什么时候应该使用依赖注入
tags: AMD AngularJS JavaScript 接口 测试 依赖注入
---

**依赖注入**（Dependency Indection, DI）是IoC思想的一种实现，用来解决模块间的依赖关系。
该设计模式的基本思想是集中式的模块管理，模块需要的依赖由DI框架统一注入，
模块自身不去主动发现和构建依赖。

JavaScript长期以来缺乏模块依赖机制，近年来随着前端的变重社区中出现了非常多的模块化标准和方案。
包括AMD标准、CommonJS规范、ES6 Import等等。
而DI不仅仅是一种模块化工具，而是通过控制反转的思想来解决可测试性和复用性问题。

<!--more-->

# 示例

首先关注一下引入依赖注入框架前后的代码有什么区别。
假设我们有一个`Controller`，它依赖于一个`Router`对象。

引入依赖注入前，Hard-wired依赖关系：

```javascript
function Controller(){
    var Router = require('router');
    router.redirect('../');
}
```

引入依赖注入后，Dependency Injection：

```javascript
function Controller(router){
    router.redirect('../');
}
```

> 上述代码（Constructor injection）只为阐明DI框架可以对Client代码产生怎样的影响，
> 具体语法和工具仍然取决于DI框架的接口设计。

# 单元测试

引入DI后马上就能感受到的好处就是单元测试更加容易了。
模块依赖复杂的代码很难测试，而硬编码的依赖使得独立的单元测试（isolated）非常困难。
例如：

```javascript
function Controller(){
    var Router = require('router');
    // ...
}
```

因为在单元测试中无法修改被测`Controller`的函数体，它对`Router`的依赖是硬编码的。
`Router`的缺陷可能会影响你对`Controller`的单元测试，这违反测试项独立的原则。
如此一来就很难从单元测试的结果来追踪代码错误。

> 当然我们可以对`require`进行Mock，但这不是通用方法。试想如果代码迁移到ES6的`import`时会怎样？

依赖注入使得我们可以在单元测试中配置任意的Mock对象，使用DI框架注入给Controller。
一个由于依赖复杂而不可测试的代码单元必然是不可复用的，它只能用于由这些依赖项构成的这个特定环境。

# 可配置的依赖

引入依赖注入可以将模块间依赖暴露出来，可以在不修改源码的情况下对软件的结构进行配置。
这得益于依赖关系的集中管理，代码单元不会主动去获取和构造被依赖的对象。

> 在Java Spring框架中，这些依赖关系甚至可以由一个统一的配置文件来管理。

当你有接口一致但实现各异的模块时，**可配置的依赖**非常有用。
例如你可能需要在不同的部署版本中使用不同的数据库引擎，但如果源码中遍布着这样的代码：

```javascript
function queryUser(){
    var mongoDB = require('mongodb');
    return mongoDB.findAsync('user');
}
```

替换数据库意味着修改整个code base。但如果数据库（或数据库Adapter）这个具体的依赖是注入进来的：

```javascript
function queryUser(db){
    return db.findAsync('user');
}
```

只需要更新依赖关系配置，使用一个接口一致的Adapter来替代`mongodb`即可。

# 可复用的模块

依赖注入使得模块对自己的具体依赖完全无知。这无疑有助于创建可复用的代码。
如果一个代码单元的所有依赖都由自己去获取，那么我们说这个代码单元与当前环境是硬绑定的。
我们就无法在不修改代码的同时将它复用到另一个环境中。还是举古老的『汽车和轮胎』的例子：

```javascript
// file: car.js
function Car(){
    this.tire = require('./track-tire.js')();
}
Car.prototype.start  = function(){
    this.tire.run();
};
```

上述代码中`Car`是一辆赛车，它自行获取和构建了它的依赖`TrackTire`。
假如我们希望把创建一辆越野车势必要重复上述代码。
如果`Car`不依赖于`TrackTire`具体的实现而是依赖于`Car`接口，
那么借助DI框架给它注入一个`OffroadTire`即可生成一辆越野车。

> 当然JavaScript没有接口的概念。但Harttle相信优雅的设计来自灵魂而不是语法。
> 比如[弱类型只是一种信仰](/2016/05/05/javascript-weak-type.html)

如果一个模块的行为依赖与其他模块的实现（而非接口），那么该模块势必会难以理解和维护。
所以说依赖注入有助于提高模块的复用性，可测试性与可维护性。

# 分离的构建过程

依赖注入为依赖项提供了构建过程与使用过程的分离，这使得应用中的模块更加Clean。
正如Robert C. Martin比喻的那样，构建和使用是两个完全不同的过程。

> As I write this, there is a new hotel under construction that I see out my window in Chicago. Today it is a bare concrete box with a construction crane and elevator bolted to the outside. The busy people there all wear hard hats and work clothes. In a year or so the hotel will be finished. The crane and elevator will be gone. The building will be clean, encased in glass window walls and attractive paint. The people working and staying there will look a lot different too.

对于依赖项而言，构建与使用的分离也强制了单一职责原则（[SRP][srp]）。
在DI框架中存在Provider的概念来提供复杂的构建过程，例如下面来自AngularJS 1的Provider示例：

```javascript
myApp.provider('unicornLauncher', function UnicornLauncherProvider() {
  var useTinfoilShielding = false;

  this.useTinfoilShielding = function(value) {
    useTinfoilShielding = !!value;
  };

  this.$get = ["apiToken", function unicornLauncherFactory(apiToken) {

    // let's assume that the UnicornLauncher constructor was also changed to
    // accept and use the useTinfoilShielding argument
    return new UnicornLauncher(apiToken, useTinfoilShielding);
  }];
});
To turn the tinfoil shielding on in our app, we need to create a config function via the module API and have the UnicornLauncherProvider injected into it:

myApp.config(["unicornLauncherProvider", function(unicornLauncherProvider) {
  unicornLauncherProvider.useTinfoilShielding(true);
}]);
```

AngularJS中，Provider的配置是在应用生命周期的configuration阶段完成的。
此后run阶段中，service实例才被创建和使用。

可能你不熟悉前端MVC，但如果你在Node.js下工作也一定会遇到类似的场景：
需要在一个流程入口（或统一的配置中心）进行一些初始化或构建工作，
但很难保证这些初始化操作在其他代码单元创建之前执行。

这就是因为CommonJS只是解决了模块化问题，并不像DI框架那样提供控制反转，
当然也没有配置阶段来让你执行这些操作。

# AMD require是依赖注入吗？

**AMD require不是依赖注入**。DI的关键是模块只负责依赖的使用而不去主动查找或构建依赖。
但AMD与DI也有相似之处，它们都是依赖解决工具用来加载和解决模块依赖。
不同的是AMD可以加载异步模块，而DI一般不具有异步获取的功能。

# 支持并行的开发

由于每个代码单元对外部依赖完全无知，所以依赖注入能够很好地支持并行开发。
开发者无需依赖于对方产出的代码单元，只需知道对方的接口。
你可能会想到如何运行自己的程序并验证是否正确工作呢？
想想单元测试的Isolate/Independent原则，验证你的模块正确工作不需要依赖于其他模块。

目前Github上非常流行的插件式架构正是依赖注入的思想，插件往往由第三方并行地开发而很少需要交流。
其实也有部分插件式架构属于[策略模式][strategy-pattern]，使用组合和代理实现。
比如[Highlight.js][hljs]有近300位插件开发者，Harttle的[Liquid][liquid]引擎中Filter和Tag也采用插件式架构。

# 支持平滑重构

依赖注入是一种对重构非常友好的设计模式，你可以在不改变原有代码行为的条件下迁移到依赖注入框架。
同时迁移后的代码也更容易进行独立的单元测试。这些好处对于迁移遗产代码而言非常重要。

> 平滑过渡，和平解放。

# 哪些场景不适合引入DI？

不同于编程风格和设计哲学，软件设计模式的优缺点和适用性的有普遍共识的。
其中DI也不是万能的，只能解决一类特定的问题。
过度设计与缺乏设计一样罪恶，不要沉溺于任何一种自己熟悉的设计模式。

> 关于Unix哲学和Vim信仰，却是不可动摇的。

这些场景下，引入DI并不合适：

* 构建过程及其简单时。直接new就很合适，DI强制构建的分离还会使调试变得麻烦。
* 只有单一的实现时。这时DI并不能解决复用性问题，反而引入了模块查找和构造的额外代价。
* 模块依赖简单。引入DI框架本身也是一条依赖。
* 软件不具有单一入口时。DI要求集中管理依赖的所有实现，那么Client引入你的工具库中任何一部分都必须首先构造整个IoC容器。

# 扩展阅读

* Wiki DI: https://en.wikipedia.org/wiki/Dependency_injection
* ES6 Import: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/import
* AngularJS Providers: https://docs.angularjs.org/guide/providers
* SRP: https://en.wikipedia.org/wiki/Single_responsibility_principle

[srp]: https://en.wikipedia.org/wiki/Single_responsibility_principle
[strategy-pattern]: https://en.wikipedia.org/wiki/Strategy_pattern
[hljs]: https://github.com/isagalaev/highlight.js
[liquid]: https://github.com/harttle/shopify-liquid
