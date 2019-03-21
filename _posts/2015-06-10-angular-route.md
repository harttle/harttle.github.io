---
layout: blog 
title: AngularJS 路由：ng-route 与 ui-router
tags: AngularJS HTML JavaScript MVC 模板 路由
---

[AngularJS][angular]的[ng-route][ng-route]模块为控制器和视图提供了[Deep-Linking]URL。
通俗来讲，[ng-route][ng-route]模块中的`$route`Service监测`$location.url()`的变化，并将它映射到预先定义的控制器。也就是在客户端进行URL的路由。
下面首先给出`$route`的使用示例，然后引入一个更加强大的客户端路由框架[ui-router][ui-router]。

## Angular 路由

在APP中定义多个页面的控制器，并给出对应的模板。然后`$routeProvider`进行配置，即可将URL映射到这些控制器和视图。
首先定义一个基本的Angular APP，并引入`ngRoute`：

> Angular`$route`Service在`ngRoute`模块里。需要引入它对应的javascript文件，并在我们的APP里`ngRoute`添加为模块依赖（[如何添加模块依赖？][module]）。

```javascript
var app = angular.module('ngRouteExample', ['ngRoute'])
    .controller('MainController', function($scope) {
    })
    .config(function($routeProvider, $locationProvider) {
      $routeProvider
          .when('/users', {
              templateUrl: 'user-list.html',
              controller: 'UserListCtrl'
          })
          .when('/users/:username', {
              templateUrl: 'user.html',
              controller: 'UserCtrl'
          });

        // configure html5
        $locationProvider.html5Mode(true);
    });
```

上述代码中，`$routeProvider`定义了两个URL的映射：`/users`使用`user-list.html`作为模板，`UserListCtrl`作为控制器；
`/users/:username`则会匹配类似`/users/alice`之类的URL，稍后你会看到如何获得`:username`匹配到的值。先看首页的模板：

> **HTML5Mode**： 服务器端路由和客户端路由的URL以`#`分隔。例如`/foo/bar#/users/alice`，Angular通过操作锚点来进行路由。
> 然而`html5Mode(true)`将会去除`#`，URL变成`/foo/bar/users/alice`（这需要浏览器支持HTML5的，因为此时Angular通过`pushState`来进行路由）。
> 此时服务器对所有的客户端路由的URL都需要返回首页（`/foo/bar`）视图，再交给Angular路由到`/foo/bar/users/alice`对应的视图。

```html
<div ng-controller="MainController">
  Choose:
  <a href="users">user list</a> |
  <a href="users/alice">user: alice</a>

  <div ng-view></div>
</div>
```

注意到模板文件中有一个`div[ng-view]`，子页面将会载入到这里。

<!--more-->

## 路由参数

接着我们定义上述路由配置的子页面控制器和视图模板。用户列表页面：

```javascript
app.controller('UserListCtrl', function($scope) {});
```

```html
<!--user-list.html-->
<h1>User List Page</h1>
```

用户页面：

```javascript
app.controller('UserCtrl', function($scope, $routeParams) {
    $scope.params = $routeParams;
});
```

```html
<!--user.html-->
<h1>User Page</h1>
<span ng-bind="params.userName"></span>
```

我们点击首页的`/users/alice`时，将会载入`user.html`，`span`的值为`alice`。[$routeParams][route-params]提供了当前的路由参数，例如：

```javascript
// Given:
// URL: http://server.com/index.html#/Chapter/1/Section/2?search=moby
// Route: /Chapter/:chapterId/Section/:sectionId
//
// Then
$routeParams ==> {chapterId:'1', sectionId:'2', search:'moby'}
```

除了[$routeParams][route-params]，Angular还提供了[$location][location]来获取和设置URL。

## UI-Router

[UI-Router][ui-router]是[Angular-UI][angular-ui]提供的客户端路由框架，它解决了原生的[ng-route][ng-route]的很多不足：

1. 视图不能嵌套。这意味着`$scope`会发生不必要的重新载入。这也是我们在[Onboard][onboard]中引入`ui-route`的原因。
2. 同一URL下不支持多个视图。这一需求也是常见的：我们希望导航栏用一个视图（和相应的控制器）、内容部分用另一个视图（和相应的控制器）。

[UI-Router][ui-router]提出了`$state`的概念。一个`$state`是一个当前导航和UI的状态，每个`$state`需要绑定一个URL Pattern。
在控制器和模板中，通过改变`$state`来进行URL的跳转和路由。这是一个简单的例子：

```html
<!-- in index.html -->
<body ng-controller="MainCtrl">
<section ui-view></section>
</body>
```

```javascript
// in app-states.js
$stateProvider
    .state('contacts', {
        url: '/contacts',
        template: 'contacts.html',
        controller: 'ContactCtrl'
    })
    .state('contacts.detail', {
        url: "/contacts/:contactId",
        templateUrl: 'contacts.detail.html',
        controller: function ($stateParams) {
            // If we got here from a url of /contacts/42
            $stateParams.contactId === "42";
        }
    });
```

当访问`/contacts`时，`contacts` `$state`被激活，载入对应的控制器和视图。在[ui-router][ui-router]时，通常使用`$state`来完成页面跳转，
而不是直接操作URL。例如，在脚本使用[$state.go][go]：

```javascript
$state.go('contacts');  // 指定state名，相当于跳转到 /contacts
$state.go('contacts.detail', {contactId: 42});  // 相当于跳转到 /contacts/42
```

在模板中使用[ui-sref][sref]（这是一个Directive）：

```html
<a ui-sref="contacts">Contacts</a>
<a ui-sref="contacts.detail({contactId: 42})">Contact 42</a>
```

## 嵌套视图

不同于Angular原生的[ng-route][ng-route]，[ui-router][ui-router]的视图可以嵌套，视图嵌套通常对应着[$state][state]的嵌套。
`contacts.detail`是`contacts`的子`$state`，`contacts.detail.html`也将作为`contacts.html`的子页面：

```html
<!-- contacts.html -->
<h1>My Contacts</h1>
<div ui-view></div>
```

```html
<!-- contacts.detail.html -->
<span ng-bind='contactId'></span>
```

> 上述`ui-view`的用法和`ng-view`看起来很相似，但不同的是`ui-view`可以配合`$state`进行任意层级的嵌套，
> 即`contacts.detail.html`中仍然可以包含一个`ui-view`，它的`$state`可能是`contacts.detail.hobbies`。

## 命名视图

在[ui-router][ui-router]中，一个`$state`下可以有多个视图，它们有各自的模板和控制器。这一点也是[ng-route][ng-route]所没有的，
给了前端路由极大的灵活性。来看例子：

```html
<!-- index.html -->
<body>
  <div ui-view="filters"></div>
  <div ui-view="tabledata"></div>
  <div ui-view="graph"></div>
</body>
```

这一个模板包含了三个命名的`ui-view`，可以给它们分别设置模板和控制器：

```javascript
$stateProvider
  .state('report',{
    views: {
      'filters': {
        templateUrl: 'report-filters.html',
        controller: function($scope){ ... controller stuff just for filters view ... }
      },
      'tabledata': {
        templateUrl: 'report-table.html',
        controller: function($scope){ ... controller stuff just for tabledata view ... }
      },
      'graph': {
        templateUrl: 'report-graph.html',
        controller: function($scope){ ... controller stuff just for graph view ... }
      }
    }
  })
```

[state]: http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.$state
[sref]: https://github.com/angular-ui/ui-router/wiki/Quick-Reference#ui-sref
[go]: https://github.com/angular-ui/ui-router/wiki/Quick-Reference#stategoto--toparams--options
[onboard]: https://onboard.cn
[angular-ui]: https://github.com/angular-ui
[route-params]: http://docs.angularjs.cn/api/ngRoute/service/$routeParams
[location]: http://docs.angularjs.cn/api/ng/service/$location
[ng-route]: http://docs.angularjs.cn/api/ngRoute/service/$route
[module]: /web/angular-module.html
[ui-router]: https://github.com/angular-ui/ui-router
[angular]: https://docs.angularjs.org
[dl]: http://en.wikipedia.org/wiki/Deep_linking
