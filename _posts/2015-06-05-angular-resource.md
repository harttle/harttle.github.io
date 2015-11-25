---
layout: blog 
categories: web
title: AngularJS Resource：与 RESTful API 交互
tags: AngularJS JavaScript HTTP
---

[REST][rest]（表征性状态传输，Representational State Transfer）是Roy Fielding博士在2000年他的博士论文中提出来的一种软件架构风格。RESTful风格的设计不仅具有更好的可读性（Human Readable），而且易于做缓存以及服务器扩展（scalability）。REST风格体现在URL设计上：

* 每个URL对应一个资源
* 对资源的不同操作对应于HTTP的不同方法
* 资源表现形式（representation）通过`Accept`和`Content-Type`指定

[AngularJS][angularjs]提供了`$resource`Service来更方便地与RESTful服务器API进行交互，可以方便地定义一个REST资源，而不必手动所有的声明CRUD方法。

参考文档： https://docs.angularjs.org/api/ngResource/service/$resource

# Resource Factory

`$resource`Service定义在`ngResource`Module中，需要在你的HTML中引入这个Module对应的JS，同时在你的APP中添加这样一个依赖：

```javascript
var app = angular.module('helloApp, ['ngResource']);
```

然后为资源建立一个Factory：

```javascript
app.factory('Notes', ['$resource', function($resource) {
    return $resource('/notes/:id');
}]);
```

> 当然，你也可以不把`$esource`的实例放到Factory里，直接在控制器中存起来：`var Notes = $resource('/notes/:id)`。

<!--more-->

# CRUD

在你的控制器中就可以对资源进行增删改查了：

```javascript
app.controller('NotesCtrl', ['$scope', 'Notes', function($scope, Notes) {
    var notes = Notes.query(function(){
        // GET: /notes
        // Response: [{id: 1, content: 'hello'}, {id: 2, content: 'world'}];
        
        var first = notes[0];
        first.content = 'halo';
        first.$save();
        // POST: /notes/1 {id: 1, content: 'halo'}
        // Response: {id: 1, content: 'halo'}
    
        second.$delete();
        // DELETE: /notes/2
    });
    
    var note = new Notes({content: 'xxx'});
    note.$save();
    // POST: /notes
    // Response: {id: 3, content: 'xxx'}
}]);
```

# PUT 操作

`$resource`提供了五种默认操作：`get`, `query`, `save`, `remove`, `delete`。你可以配置一个`update`操作来完成HTTP PUT：

```javascript
app.factory('Notes', ['$resource', function($resource) {
    return $resource('/notes/:id', null, {
        update: { method:'PUT' }
    }); 
}]);
```

现在，你可以在控制器中获取一个note并更新它：

```javascript
var note = Notes.get({ id: 3}),
    $id = note.id;

note.content = 'yyy';
Notes.update({ id:$id }, note);
// PUT /notes/3 {id: 3, content: 'yyy'}
```

现在你的`Notes`有六种操作了。这些操作有两种调用方式：

1. 通过资源类调用，例如：`Notes.update({id: xxx})`；
2. 通过资源实例调用，例如：`note.$update()`，此时操作名需加前缀`$`。

具体的调用参数可参考文档：

> HTTP GET "class" actions: Resource.action([parameters], [success], [error])
> 
> non-GET "class" actions: Resource.action([parameters], postData, [success], [error])
> 
> non-GET instance actions: instance.$action([parameters], [success], [error])

其中，success参数为`(value, responseHeaders)`，error参数为`(httpResponse)`。

# 属性/URL映射

上述例子中，我们看到note对象的`id`属性会映射到URL中的`:id`（`/notes/:id`）。如果你的业务更加复杂，可以手动配置这个映射关系。例如：

```javascript
var Notes = $resouce('/users/:userId/notes/:noteId', {
    noteId: '@id',
    userId: '@owner'
}
```

将会读取`note`的`owner`和`id`属性来生成URL，比如删除note时：

```javascript
// note === {id: 123, owner: 'alice', content: 'hello'}
note.$delete();
// DELETE: /users/alice/notes/123
```

**在构造`$resource`时，多于的属性映射会成为URL Query**。例如：

```javascript
var Notes = $resouce('/notes/:id', {
    id: '@id',
    user: '@owner'
});
// note === {id: 123, owner: 'alice', content: 'hello'}
note.$delete();
// DELETE: /notes/123?user=alice
```

**REST操作的声明和调用中，多于的属性会成为URL Query**。例如：

```javascript
var Notes = $resouce('/notes/:id', {id: '@id'}, {
    update: {method: 'PUT', operator: 'bob'}
});
// note === {id: 123, content: 'hello'}
note.$update({trusted: true});
// PUT: /notes/123?operator=bob&trusted=true {id: 123, content: 'hello'}
```

# 响应转换

有时基于既定的后台设计，无法提供完全RESTful的API，比如`/notes`返回的是一个分页器对象，而非数组。此时，我们仍然可以使用`$resource`，但需要设置响应转换回调。例如：

```javascript
var Notes = $resouce('/notes/:id', null, {
    pager: {
        method: 'GET', 
        transformResponse: function(data, headers){
            // Server respond: 
            // data = {currentPage: 1, 
            //     totalPage: 20, 
            //     pageSize: 2,
            //     content: [{id: 1, content: 'hello'}, {id: 2, content: 'world'}]}
            var pager = JSON.parse(data);
            return pager.content;
        }
    }
});
var notes = Notes.query(function(){
    // GET: /notes
    // notes === [{id: 1, content: 'hello'}, {id: 2, content: 'world'}]
});
```

类似响应重写，你还可以设置请求转换`transformRequest`。

> 虽然`$resource`的设计可以支持绝大多数的URL和内容表示设计，但如果你发现`$resource`的使用过程极其复杂，那可能是你的服务器API并不满足RESTful风格。

[rest]: http://zh.wikipedia.org/zh-cn/REST
[angularjs]: https://docs.angularjs.org
