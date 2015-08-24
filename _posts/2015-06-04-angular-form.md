---
layout: blog 
categories: web
title: AngularJS 表单（ng-form）验证
tags: AngularJS JavaScript 表单 MVC
redirect_from:
  - /web/angular-form.html
  - /2015/06/04/angular-form/
---

在HTML中，用户通过`input`, `select`, `textarea`等元素进行输入，我们通常用表单来包装和管理这些控件。客户端表单验证非常重要，可以及时地为用户提供表单验证信息。但客户端表单验证只是为了增强用户体验，服务器端验证仍然是必要的。

[AngularJS][angularjs]最大的特点便是数据绑定。利用Angular在客户端脚本中构建MVC框架，Model和View之间可以实现双向绑定。因此**AngularJS的表单验证可以做到实时的用户反馈**。

> 事实上，正是因为**实时的用户反馈**这个神奇的特性，我们团队在 http://tianmaying.com 中也继续引入了AngularJS，尽管此时我们对单页应用已经不感兴趣。

# 一个简单的表单

Angular是模块化的，每个APP都是一个Angular Module。我们知道Module下可以包含这样四种内容：

* 控制器（controllers），用来完成页面逻辑，不包含DOM操作、资源获取。
* 服务（services），用来提供资源访问和获取，控制资源的访问，维护数据一致性。
* 过滤器（filters），用来格式化数据显示，很多第三方插件以提供`filter`为主，例如`angular-moment`。
* 语义标签（directives），增强的HTML标签，DOM操作都应当抽象为`directive`。

Angular表单其实是Angular提供的Directive，它有一个别名叫`ng-form`。是这个Directive实例化了一个`FormController`来负责表单内的页面逻辑（主要是表单验证）。

```html
<div ng-app>
  <ng-form name=someForm>
    <input name="username" type="text" ng-model="user.username" pattern="^\w{6,18}$">
    <div class="alert alert-danger" ng-show="someForm.username.$error.pattern">
      用户名必须为6-18个字母、数字或下划线
    </div>
  </ng-form>
</div>
```

`ng-model`可以把`input`的值双向地绑定到当前上下文的`user.username`变量。我们设置了用户名的`pattern`为6到18位。我们输入用户名时，`.alert`错误提示便会实时地显示或者隐藏。

> 这里我们指定了`form`的`name`属性，`form` Directive 实例化的`FormController`就会以`someForm`命名，并插入到当前`$scope`。所以在模板中才能够访问`userForm`变量。另外，Angular的Pattern使用Javascript正则表达式语法，这里`\w`相当于`[a-zA-Z_]`。

<!--more-->

# SELECT标签

HTML中的`select`标签是一个单选的下拉列表，Angular对`select`也提供了支持（事实上，是在`ng`Module里面提供了一个叫`select`的Directive）。假如上下文中有这样的对象：

```javascript
$scope.selectValue = [{value: 0, label: 'Banana'}, {value: 1, label: 'Apple'}];
$socpe.selectedValue = 1;
```

在模板中这样写：

```html
<select ng-model="selectedValue"
        ng-options="option.value as option.label for option in myOptions"></select>
```

这个`<select>`的便会有两个选项：`Banana`和`Apple`，且默认选中`Banana`。当你选择`Apple`时，`$socpe.selectedValue`会被赋值为`1`。`option.value`指定了`<select>`下`<option>`的`value`，而`option.label`指定了`<option>`的内容。

> 事实上，因为`select`下拉项的样式不可通过CSS控制，`select`在追求视觉体验的网站不常使用。Bootstrap的`.dropdown`就是一个更好的替代品。Angular也有类似的Dropdown插件。

# 表单嵌套

多数浏览器不允许`form`嵌套，如果你出于自身的需求（例如：在账号表单中，头像表单需要单独提交）需要嵌套的表单，请使用`ng-form`标签：

```html
<ng-form name="outterForm">
  <ng-form name="innerForm" ng-repeat="file in doc.files">
    ...
    <button ng-disabled="innerForm.$invalid">Save Inner</button>
  </ng-form>
  <button ng-disabled="outterForm.$invalid || innerForm.$invalid">Save Outter</button>
</ng-form>
```

这里的`outterForm`下有一个动态的`innerForm`列表，

* 在`innerForm`下的元素`$scope`中是当前列表项的`innerForm`。因此Save Inner的状态会根据正确地绑定到当前表单的状态。
* 在`outterForm`下的Save Outter则会同时绑定`outterForm`和`innerForm`的状态，当所有`innerForm`合法且`outterForm`合法时，按钮被激活。

> 至于你自己的Directive希望通过属性的方式来启用还是通过标签的方式来启用，可以在你的Directive中设置`restrict`字段。

# 渐进呈现

在页面载入时，由于Angular的控制器仍为完成构造过程，表单会短暂地显示为原始的HTML，比如：

![](/assets/img/blog/angular/form-raw@2x.png)

当然你能想到最直接的解决方案是给表单加一个隐藏的样式，在载入后去掉它。然而Angular已经提供`ngCloak`Directive来完成这件事情，我们只需要在表单上加一个`ng-cloak`：

```html
<form ng-cloak>...</form>
```

`ng-cloak`可以直接加在`body`上，但在载入过程中，整个body都会隐藏。这与HTML的渐进呈现的原则是相悖的。建议在表单上单独地应用`ng-cloak`。

> HTML属于流式文档，已载入的部分的呈现方式总是已知的。在带宽小的情况下，HTML会逐步显示已载入的部分。

[angularjs]: https://docs.angularjs.org
