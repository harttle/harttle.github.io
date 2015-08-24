---
layout: blog 
categories: web
title: AngularJS 数据绑定与 $digest 循环
tags: AngularJS JavaScript 数据绑定 MVC
redirect_from:
  - /web/angular-data-binding-and-digest.html
  - /2015/06/06/angular-data-binding-and-digest/
---

数据绑定可以说是[AngularJS][angular]最大的特色。在Angular中，视图和模型的数据不仅是双向绑定的，并而且是实时的。
使用Angular可以做到良好的甚至是神奇的用户体验，例如用户在输入表单的过程中实时地提示输入有误或者输入正确。

# 双向绑定

下图是模板引擎中常见的单向数据绑定：

![](/assets/img/blog/angular/One_Way_Data_Binding.png)

通常在服务器端，将数据模型和模板结合，生成视图。当视图中的数据发生改变时，数据模型不会自动更新；模型发生改变时，视图也不会自动刷新。
因此开发者不得不写大量的代码来同步视图和模型。例如：

* 视图->模型：绑定DOM事件来监听视图的改变，进而通过javascript函数来同步数据模型，更改javascript对象，或者发送HTTP请求到后台。
* 模型->视图：模型改变时通过jQuery操作来更新DOM。如果数据模型在后台，可能还需要websocket之类的推送机制。

而Angular提供了双向的数据绑定，我们可以在Angular Controller的`$scope`中声明数据模型，在模板中进行绑定。
Angular会自动添加DOM事件，并在`$scope`发生改变时自动进行DOM操作。下面是Angular双向绑定的MVT关系示意图：

![](/assets/img/blog/angular/One_Way_Data_Binding.png)

图片来源： https://docs.angularjs.org/guide/databinding

<!--more-->

# Scope

`scope`在Angular中代表着应用模型，它是模板中表达式的上下文。在`scope`中，你可以`watch`（监听）表达式值的变化，可以传播事件。
在编写控制器时，我们往往会注入一个`$scope`Service来设置当前模板的上下文：

```javascript
var app = angular.module('helloWorldApp', []);
app.controller('worldCtrl', ['$scope', '$http', function($scope, $http) {
    // 在模板上下文中添加一个变量：username
    $scope.username = 'harttle';
}]);
```

然后在视图中绑定它：

```html
<div ng-app='helloWorldApp' ng-controller='worldCtrl'>
  <input type='text' ng-model='username'>
  <span ng-bind='username'>
</div>
```

`ng-model`设置了`input`内容和当前上下文中`username`之间的双向绑定；`ng-bind`设置了从上下文到`span`内容的绑定。
当我们在`input`中输入时，`span`的内容便会实时地改变。

更多`$scope`的信息请参考： [AngularJS 初始化过程][ai]

官方文档： https://docs.angularjs.org/api/ng/type/$rootScope.Scope

# Scope通信

因为Angular的Controller可以嵌套，子controller的`$scope`中可以直接访问父`$scope`中的属性。
子`$scope`中可以通过`$emit`方法来发射一个事件，父`$scope`中通过`$on`来监听该事件：

```javascript
// 子Controller中发射的事件会验证Controller的层级逐级上传
// 第一个参数为事件名，后面是任意个数的参数
$scope.$emit('alienDestroyed', args, ...)

// 父Controller中通过事件名来监听
$scope.$on('alienDestroyed', function(event, args, ...){});
```

> 如果两个控制器并非父子关系，还可以通过`$broadcast`方法来发送事件。
> Angular虽然提供了Scope之间的通信机制，但滥用事件和通知将会使得你的控制器难以理解和维护。
> 如果Controller间有数据共享，把数据抽取为Service更加合适。

# $watch

在`scope`中，有时我们希望监听某个表达式的变化。在Angular的`scope`中，监听表达式的值就像注册事件处理函数一样简单：

```javascript
$scope.$watch('username', function(newValue, oldValue){
    console.log('username changed:', oldValue, '->', newValue);
});
```

是不是很神奇？但是你可能会发现有时`$watch`并不起作用，这时你可能需要对Angular Scope中`$watch`的策略有更多的了解。Scope有三个监听方法：

1. `$watch`：通过引用（reference）监听，这时最高效的策略。只有该表达式返回值的引用（类似C++的地址）发生变化时才会触发。
2. `$watchCollection`：监听数组或对象的元素（引用）的变化。
3. `$watch(Expression, listener, true)`：监听值的变化。递归地检测任意深度的属性变化，他最方便，同时也最低效。

举个例子，模型发生变化时，上述三个方法的监听效果如下图所示：

![](/assets/img/blog/angular/concepts-scope-watch-strategies.png)

图片来源： https://docs.angularjs.org/guide/scope

# $digest循环

> 曾经有过Angular阴谋论，生成Angular是通过无限的循环来实时地刷新视图。事实上Angular要聪明地多，因为只有操作发生时视图才需要更新。
> 而这些有限的用户操作都会产生DOM事件，只需监听这些事件便可以做到实时地刷新视图。

Angular会监听网络和DOM事件来自动更新视图，下面以DOM事件为例来描述Angular如何进行视图的更新：

## 模板编译阶段

拥有`ng-app`属性的HTML元素会成为Angular模板，在页面载入时Angular会对它（以及它的子元素）进行编译（递归地匹配directive、controller并绑定DOM事件）。
主要有两个过程（以`<input>`和`ng-model`为例）：

1. `input`Directive找到声明了`ng-model`属性的`<input>`，绑定`<input>`的`keydown`事件。
2. 在`input`Directive的上下文（`$scope`）中添加对应数据模型的`$watch`函数，当模型改变时操作并更新DOM。

> `input`是Angular内置的一个Directive，它会匹配`<input>`元素，并对它实现双向的数据绑定。Angular对几乎所有输入型控件都编写了Directive。

## 运行阶段

1. 用户按键`x`，浏览器触发了`keydown`事件。
2. `input`Directive中的事件处理函数被调用，该处理函数中会执行`$apply("name = 'x'")`。
3. Angular 在当前`$scope`中执行（`$eval`）表达式`name = 'x'`，改变数据模型。
4. Angular 开始`$digest`循环。
5. `$digest`会调用所有监听该模型的`$watch`listener，这些监听函数会更新各自负责的DOM。
6. 浏览器重新渲染DOM。

这时一个示意图：

![](/assets/img/blog/angular/concepts-runtime.png)

# 强制刷新视图

让刷新视图有很多方法：`$scope.$digest`, `$scope.$apply`, `$timeout`。它们有各自的使用情景：

## $digest

`$digest`是`$scope`下的方法，调用它会导致当前上下文的所有listener被执行。

因为listener可能会改变数据，因此Angular会一遍一遍地调用这些listener直到数据不再改变。但我们通常不会使用`$digest`，而是使用下面的`$apply`。

## $apply

`$apply`也是`$scope`下的方法，它会导致`$digest`被调用。`$apply`有一个可选参数（表达式字符串）。被调用时，传入的表达式会被`$eval`执行，接着`$digest`会被调用。

通常我们应使用`$apply`来立即刷新视图。既然Angular会进行视图和模型的双向绑定，那么什么时候我们会需要显式地调用`$apply`呢？

> Angular监听了DOM事件、`$http`事件来刷新视图。但当我们使用实现自定义事件（尤其是使用第三方库）时，事件发生时Angular并不知道视图需要更新，此时便需要显示地调用`$apply`。
> 例如，Bootstrap事件发生时、使用jQuery进行AJAX时，websocket消息到达时。

## $timeout

`$timeout`也是`ng`Module下的Service，它是`window.setTimeout`的包装，用来延迟执行一个函数。当我们在Controller中更改了数据模型时，此时DOM还没有得到更新（`$digest`循环还没开始）。如果我们希望DOM刷新后执行某些操作，就可以使用`$timeout`。例如：

```javascript
module.controller('worldCtrl', ['$scope', '$timeout', function($scope, $timeout){
     $scope.users = ['alice', 'bob'];
     $timeout(function(){
         $('.user').tooltip();
     });
}]);
```

对应的模板：

```html
<div ng-controller="worldCtrl">
    <span class='user' ng-repeat='user in users'>{{user}}</span>
</div>
```

当`$scope.users = ['alice', 'bob'];`执行后，DOM中的`<span>`还不存在，此时`$('.user')`的值为空集。尽管`$timeout`没有设置延迟时间（第二个参数），但这样的调用会使得回调函数在`$digest`循环之后再执行。

[angular]: https://docs.angularjs.org
[ai]: /2015/05/31/angular-scope-initialize.html