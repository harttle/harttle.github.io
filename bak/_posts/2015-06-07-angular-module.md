---
layout: blog 
categories: web
title: AngularJS 模块化与依赖注入
tags: AngularJS JavaScript 模块化 MVC 依赖注入
---

[AngularJS][angular]使用模块化的组织方式，和依赖注入的设计。这使得模块之间耦合度较低，模块更容易复用。同时支持声明式的编程风格。
在你创建Angular Module 或者 Service 之前，首先需要了解一下 Angular Module 和 Service 的工作方式。

# 模块概念

在Angular中，一个Module通常对应一个js文件，其中可以包括Controller、Service、Filter、Directive等。
下面我们声明一个模块：`helloApp`，并在其中声明一个Controller：`worldCtrl`，一个Directive：`customer`，和一个Filter：`count`。

![](/assets/img/blog/angular/module-js@2x.png)

接着在模板中，使用上面声明的`helloApp`模块作为Angular APP：

![](/assets/img/blog/angular/module-html@2x.png)

* Module依赖：在声明`helloApp`模块时，需要给出依赖模块的列表。同时这些模块对应的JS需要在HTML中加以引入。在`helloApp`中可以直接使用依赖模块中声明的Service、Directive、Filter。
* Service依赖：在声明Controller、Service、Directive、Filter的工厂方法中，把依赖的Service直接放到参数列表，Angular Injector会为你生成这些Service的实例。

<!--more-->

# 依赖注入

在Angular中，Directive、Service、Filter、Controller都是以工厂方法的方式给出，而工厂方法的参数名对应着该工厂方法依赖的Service。如：

```javascript
app.controller('wolrdCtrl', function($scope, $http){
    // ...
});
```

在上述的`function`执行之前，Angular Injector会生成一个`$scope`的实例和`$http`的实例，并传入该方法。
如果你希望对JS进行压缩处理，那么参数名就可能发生变化，Angular Injector将不能够正确地注入依赖的Service。于是有另外一种写法：

```javascript
app.controller('wolrdCtrl', ['$scope', '$http', function($scope, $http){
    // ...
}]);
```

以字符串数组的形式来声明依赖项，因为字符串常量不会被压缩。

除此之外，还可以设置`$inject`属性显式地声明Controller的依赖：

```javascript
var worldCtrl = function($scope, $http){
    // ...
};

worldCtrl.$inject = ['$scope', '$http'];
app.controller('worldCtrl', worldCtrl);
```

# Service声明

如上所述，Service以依赖注入的方式被 Controller、Filter、Directive 或其他 Service 使用。Service 是 Angular 中最常见的代码复用机制。
本节便来探索如何创建自己的 Service。

## 最常见的方式：工厂方法

```javascript
app.factory('someService', function(dependency1, ...){
    return {
        property1: value1,
        property2: value2
    }
});
```

当`someService`被依赖时，Angular Injector 会调用上述工厂方法，将返回值作为Service的实例传入依赖它的工厂方法。

## 最直接的方式：构造函数

```javascript
app.service('someService', someService(dependency1, ...){
    this.property1 = value1;
    this.property2 = value2;
});
```

当`someService`被依赖时，Angular Injector 会以`new`的方式调用该构造函数，将返回值作为 Service 的实例传入依赖它的工厂方法。

## 最简单的方式：Value/Constant

```javascript
app.value('someService', { property1: value1, property2: value2});

app.constant('anotherService', 'I am a simple string');
```

通常在启动一个`app`之前，需要通过jQuery读取静态渲染的一些环境变量，以`value`或`constant`的方式注入到 Angular APP 中。

> 显然，`constant`和`value`的区别在于是否允许修改。

## 最通用的方式：Provider

上述的 Service 构建方式都是 Service Provider 的特例，事实上它们都是调用 Service Provider 来实现 Service 声明的。下面给出一个典型的 Service Provider 声明：

```javascript
app.provider('someService', function someServiceProvider(){
    var someSettings = false;

    this.changeSetting = function(value){
        someSettings = value;
    }

    this.$get = function(dependency1, ...){
        return {
            property: someSettings ? value1 : value2
        }
    }
});
```

同时 Service Provider 是可配置的：

```javascript
app.config(function(someServiceProvider){
    someServiceProvider.changeSetting(true);
});
```

[angular]: https://docs.angularjs.org
