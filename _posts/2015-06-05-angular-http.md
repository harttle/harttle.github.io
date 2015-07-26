---
layout: blog 
categories: web
title: AngularJS $http Service
tags: AngularJS JavaScript HTTP AJAX Promise Web
redirect_from:
  - /web/angular-http.html
  - /2015/06/05/angular-http/
---

`$http`是[AngularJS][angular]提供的一个核心Service，通过浏览器的`XMLHttpRequest`或JSONP与服务器进行交互。
这是一个非常常用的Service，类似于jQuery提供的AJAX。与jQuery类似，`$http`也采用了deferred/promise模式，不同的是Angular的deferred/promise模式是由Angular的`$q`Service来提供的。

> 在Angular应用中尽量使用`$http`而不是jQuery函数来进行AJAX请求，因为`$http`会在响应到达时触发Angular更新视图（`$digest`循环）。
> 与此同时，`$http`还可以通过`$httpBackend`来Mock和单元测试。

`$http`文档参见： https://docs.angularjs.org/api/ng/service/$http

# 基本使用

如果你熟悉了jQuery的AJAX操作，那么使用`$http`只是重新记住几个方法名而已。把`done`, `fail`, `always`换成`success`, `error`, `finally`：

```javascript
$http.get('/someUrl')
    .success(function(data, status, headers, config){
    // GET成功时被回调
    })
    .error(function(data, status, headers, config){
    // GET失败时被回调
    });
```

`$http`方法返回的是一个由`$q`Service提供的Promise对象，事实上Promise对象有三个通用方法：`then`, `catch`, `finally`。
上述的`success`和`error`是`$http`提供的两个额外的方法。Promise的三个方法参数如下：

```javascript
then(successCallback, errorCallback, notifyCallback);
catch(errorCallback);
finally(callback, notifyCallback);
```

> Promise方法是可以链式调用的。

# 配置`$httpProvider`

`$http` Service定义在`ng` Module里，由`$httpProvider`提供。于是我们可以通过设置`$httpProvider`来配置`$http`的行为。比如，给HTTP请求插入一个拦截器：

```javascript
someModule.config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push(function($q, dependency1, dependency2){
        return {
            request: function(config){
                // 这里可以调整HTTP请求的配置
                return config;
            },
            response: function(response){
                // 这里能拿到响应对象，当然也可以更改它
                return response;
            }
        }
    });
}]);
```

还可以通过设置`$httpProvider`的`defaults`属性来进行请求/响应的转换（`transformRequest`, `transformResponse`）、设置请求的HTTP头字段（`headers`）。

更多信息，请参考`$httpProvider`文档： https://docs.angularjs.org/api/ng/provider/$httpProvider

<!--more-->

# 快捷方法

我们知道在jQuery中，使用`$.ajax()`可以产生一个HTTP请求，可以任意配置请求的字段。同时jQuery提供了`$.get`, `$.post`等更加快捷的函数。
Angular的`$http`也是这样，可以直接调用`$http`函数来产生一个高度可配置的HTTP请求：

```javascript
$http(config);
// config properties:
//    * method
//    * url
//    * params：对象，将被转换为Query字符串（`?key1=value1&key2=value2`）
//    * data：请求体对象
//    ...
```

也可以使用`$http.get`, `$http.post`等方法来快捷地发送一个HTTP请求。常用的方法参数如下：

```javascript
get(url, [config]);
delete(url, [config]);
post(url, data, [config]);
put(url, data, [config]);
```

[angular]: https://docs.angularjs.org
