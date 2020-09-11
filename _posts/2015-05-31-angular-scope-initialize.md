---
title: AngularJS 初始化过程
tags: AngularJS DOM HTML JavaScript MVC 模板 模块化 依赖注入 异步
---

[AngularJS][angularjs]属于典型的单页APP框架，现由Google维护，用在了Google的多款产品中。
如果你的项目引入了AngularJS，同时还有不少的jQuery代码，你可能会碰到两者初始化顺序的问题。
本文就来探讨AngularJS APP以及Controller的初始化过程和时机。

## Angular APP

一个Angular APP其实就是一个Angular Module，通常可以包含若干Controller、Service以及Directive。甚至不自己定义APP也可以启动一个Angular应用，例如：

```html
<div ng-app>
  <ng-form>...</ng-form>
</div>
```

在你引入AngularJS之后，`div[ng-app]`便会在页面载入时启动，其子元素范围内构成一个`$scope`，可以使用angular标签（又称语义标签，其实就是`directive`）。通常我们会显示地定义一个Angular APP：

```javascript
var app = angular.module('helloApp', []); // 第二个参数定义了Module依赖
// 添加controller
app.controller('worldCtrl', ['$scope', function($scope){
    //...
}]);
```

然后在页面中引用它：

```html
<div ng-app="helloApp">
  <ng-form ng-controller='worldCtrl'>...</ng-form>
</div>
```

在`div[ng-app]`的子元素中可以使用该`app`下的所有控制器，**控制器可以嵌套，子控制器的`$scope`直接共享父控制器的`$scope`中的变量**。

## Angular APP 的启动

**同一个页面中可以包含多于一个的APP，但不能嵌套**。同一页面中有多于一个APP时AngularJS不会自动帮你启动APP了，你需要手动启动这些APP。例如：

```javascript
var element = $('#some-div')[0];
angular.bootstrap(element, ['helloApp']);
```

AngularJS通过依赖注入的方式来实现模块化与封装。在启动APP之前，往往需要注入一些APP所在环境的信息：

> 这是常见的需求。因为在AngularJS中，尽量不要去操作DOM（除非你在写`directive`），否则可测试性会严重下降。参见 <http://docs.angularjs.cn/guide/controller>

```javascript
var app = angular.module('helloApp'); // 获得之前声明的那个叫helloApp的模块
app.constant('sessionInfo', {
    'currentUser': $('input#current-user').val(),
    'uploadDir':   $('input#upload-dir').val()
});
```

<!--more-->

## APP启动时，控制器立即执行

对于上文中的例子，**`helloApp`启动时，传入`worldCtrl`的构造函数会立即执行**。如若未显示地启动Angular APP，在页面载入时Angular会自动启动，构造函数在此时得以执行。

在Web前端开发中，常常需要在页面载入后做进一步的DOM增强，例如：启动Bootstrap的`tooltip`：

```javascript
$(function(){
    $('[data-toggle=tooltip]').tooltip();
});
```

一个常见的问题是：有些DOM元素是在页面载入后由Angular进行渲染，上述jQuery选择器未能获取这些DOM元素。

如果合理利用Controller的启动时机，便可解决这个时序问题。例如：

```javascript
$(function(){
    // do some config
    ...
    
    // bootstrap app, controllers will be executed
    angular.bootstrap(element, ['helloApp']);
    
    // init page augments
    $('[data-toggle=tooltip]').tooltip();
});
```

> 当然，如果Controller中需要异步获取资源，上述的trick失效。此时最好使用Angular插件提供的各种Directive。

## Link Scope时，控制器立即执行

有时，我们需要动态编译（`$compile`）HTML。有这样两种典型的场景：

1. 你不得不从服务器获取HTML片段，需要把它加入到Angular模板中。
2. 你在编写Directive，需要把HTML片段插入到DOM中并应用Scope。

将HTML插入到Angular包括两个过程：

* Compile：处理HTML，生成Linking函数，参见： <http://docs.angularjs.cn/guide/compiler>
* Link：将Compile结果与Scope结合，产生动态视图。

例如：

```javascript
// 可以编译已存在的HTML模板
var link = $compile($element);
// 也可以直接编译HTML字符串
var link = $compile('<div ng-bind="xxx"></div>');

// 应用Scope
link(scope);
```

注意，在**`link(scope)`时，HTML模板或字符串中指定的控制器立即执行**。这里提一个Trick，如何在Angular中获取已经在页面里的Angular模板？

假如你有这样一个模板，并且该`script`已经包含在当前页面中：

```html
<script type="text/ng-template" id="world.html">
   <div ng-controller="worldCtrl">...</div>
</script>
```

可以在Angular中从模板缓存获取模板字符串：

```javascript
$http.get('world.html', {cache: $templateCache})
    .success(function (tplStr) {
        console.log(tplStr);
    });
```

> Angular 默认从服务器获取模板，而`script[type=text/ng-template]`会被Angular识别为模板缓存。不论是`$http.get`还是`Router`中都可以访问该缓存。


[angularjs]: https://docs.angularjs.org
