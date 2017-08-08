---
title: Liquid 是世界上最好的模板引擎
tags: AngularJS Django Github HTML NPM Node.js Ruby 模板 Liquid
---

[模板引擎][ts]是Web应用中用来生成动态HTML的工具，
它负责将数据模型与HTML模板结合（*模板渲染*），生成最终的HTML。
编写HTML模板的语法称为模板语法，模板语法的表达能力和可扩展性决定了模板引擎的易用性。
在转战不同的模板引擎后， Harttle 决定坚决支持Liquid，并在Node.JS下实现[liquidjs][sl]模板引擎。
此前用这篇文章来讨论模板引擎的用途及其优劣。

<!--more-->

> 模板引擎常常被作为Web应用框架的一部分，但也可以作为预处理器或过滤器单独运行（比如在Gulp中）。
> Harttle 正在实现的[harttle/liquidjs][hsl]也应当提供命令行接口和编程接口来支持不同的使用方式。

如果你还不确定什么是模板引擎，这里做一个简单的类比：

在C++的`printf("Name: %s", str)`中，`printf()`函数便是模板引擎，
它负责将格式化字符串与上下文数据结合生成最终的字符串。
其中`"Name: %s"`是模板，`%s`是一种模板语法。而`str`则为上下文数据。
这里有一个Live Demo：<http://harttle.com/liquidjs/>

# 历数那些著名的模板引擎

在讨论谁是最好的模板引擎之前，先来历数一下 Harttle 经历过的那些模板引擎，来讨论它们的优缺点。

## Shopify Liquid

[Shopify Liquid][sl]是Liquid引擎的Ruby实现，Jekyll中的模板引擎即是Shipify Liquid。
提供控制流、变量定义、迭代功能、继承和引入。不支持通用的表达式求值，但可以自定义过滤器和标签。

{% raw %}
使用`{{ }}`输出变量，`{% %}`标记块：

```liquid
{% if user %}
  Hello {{ user.name }}!
{% endif %}

{% for product in collection.products %}
  {{ product.title }}
{% endfor %}
```

> [Django Templates][dt]也采用Liquid兼容的模板语法。

## CodeCharge Studio

[CodeCharge Studio][cs]是C#、JSP的默认模板引擎。

支持控制流、变量定义、迭代功能、函数调用、继承和引入。功能很强大，只是它的模板语言太繁琐，例如：

```jsp
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:genericpage>
    <jsp:attribute name="header">
      <h1>Welcome</h1>
    </jsp:attribute>
    <jsp:body>
      <p>Hi I'm the heart of the message</p>
    </jsp:body>
</t:genericpage>
```

## Thymeleaf

[Thymeleaf][Thymeleaf]是Java平台下的模板引擎，其特征包括：产生良构的HTML或XML，基于标签属性的、声明式的、HTML兼容的模板语法（这意味着Thymeleaf模板可以直接用浏览器打开）。
不提供模板继承，其他特性同CodeCharge Studio。

```html
<table>
  <thead>
    <tr>
      <th th:text="#{msgs.headers.name}">Name</th>
      <th th:text="#{msgs.headers.price}">Price</th>
    </tr>
  </thead>
  <tbody>
    <tr th:each="prod : ${allProducts}">
      <td th:text="${prod.name}">Oranges</td>
      <td th:text="${#numbers.formatDecimal(prod.price,1,2)}">0.99</td>
    </tr>
  </tbody>
</table>
```

> 为了产生良构的HTML默认采取Strict文档模式，这使得很多Copy来的代码会报错。

## Handlebars

[Handlebars][hbs]提倡无逻辑（logicless）的模板语法，致力于创建语义模板。只提供基本的控制流和迭代，不支持函数和通用表达式。Handlebars提出了一种新颖的上下文进入的语法。

```hbs
<div class="entry">
  <h1>{{title}}</h1>
  <div class="body">
    {{body}}
  </div>
</div>
```
Harttle 不再使用Handlebars的原因包括：上下文进入的语法使得代码维护困难，无逻辑的语法使得扩展标签变成常事，然而扩展一个标签并不容易。

## AngularJS Template

[AngularJS Template][ngt]是前端模板引擎。与[Thymeleaft][Thymeleaf]一样采用基于标签属性的、声明式的、HTML兼容的模板语法。这使得后端Thymeleaf前端AngularJS时会产生冲突。

AngularJS Template的强大之处在于完全的声明式语法、数据双向绑定，很容易创建实时交互的Web应用。

```angularjs
<html ng-app>
 <!-- Body tag augmented with ngController directive  -->
 <body ng-controller="MyController">
   <input ng-model="foo" value="bar">
   <!-- Button tag with ng-click directive, and
          string expression 'buttonText'
          wrapped in "{{ }}" markup -->
   <button ng-click="changeFoo()">{{buttonText}}</button>
   <script src="angular.js">
 </body>
</html>
```

## Jade

[Jade][jade]一度成为ExpressJS的默认模板引擎，致力于生成良构的HTML。提供了极其简洁的Emmet风格的模板语法，不兼容HTML，于是上手也有一些困难。

```jade
doctype html
html(lang="en")
  head
    title= pageTitle
  body
    h1 Jade - node template engine
    #container.col
      p.
        Jade is a terse and simple templating language with a strong focus on performance and powerful features.
```

从上面的代码可以看到，从网上Copy来的HTML不能直接作为Jade模板使用。

## EJS

[EJS][ejs]和PHP语法及其相似，采用HTML内嵌脚本语言的方式。Harttle不会喜欢这种方式，毕竟JavaScript是JavaScript，HTML是HTML。况且直接内嵌JavaScript还会增加安全风险。

```ejs
<ul>
  <% users.forEach(function(user){ %>
    <% include user/show %>
  <% }) %>
</ul>
```

# 理想的模板引擎

介绍了这么多模板引擎，我们来分析一下理想的模板引擎应该有哪些功能。
一些必不可少的功能就不展开了，比如控制流、迭代、变量定义等，下文主要介绍那些可选的优秀特性。

## 布局和片段

布局（layout）和片段（partial）这是模块化开发的基础。

片段（partial）使得一个页面模板可以引入其他的模板，这对于一些通用组件的复用是很有效的。
比如列表页底部的分页器、边栏的公告等信息、站点公用的导航栏等。

布局（layout）是指一个页面模板可以继承一个布局框架模板。比如，在布局框架中可以写好`<head>`部分、导航栏，以及底栏。
其他页面模板通过继承该布局框架来填充其中的内容部分。

## 布尔运算

对于是否提供表达式求值或函数调用，不同的模板引擎有着不同的观点。

* 有些认为模板不应提供运算逻辑，以提高易读性和容错性（毕竟模板引擎有时是给设计师用的）。
  Handlebars是典型的logicless模板引擎。
* 有些则认为模板应当提供足够的运算能力，以此来简化复杂逻辑的实现。
  比如EJS、PHP等，在模板中几乎可以完成所有业务逻辑。

Harttle认为模板应尽量避免运算以提高易读性，但布尔运算仍然是必要的。例如：

```liquid
{% if user.login and page > 1 %}
  foo
{% endif %}
```

如果用完全不提供逻辑运算的Handlebars实现则会繁琐很多：

```hbs
{{# if user.login }}
  {{# if page > 1}}
    foo
  {{/if}}
{{/if}}
```

## 数据格式化

模板引擎的作用在于将数据注入到模板中，于是到处都需要将数据模型中的值转换为用户可见的字符串。
这个过程可以在控制器中完成，可以在数据模型中完成，也可以在模板中完成。
Harttle认为模板引擎更加了解如何进行数据的表示，这一过程最好在模板引擎中加以实现。
例如Liquid中的`date`过滤器：

```liquid
{{ article.date | date: '%Y-%m-%d' }}   <!-- 2016-06-21 -->
```

除`date`以外，Liquidjs 还提供了很多其他的过滤器，比如`upcase`, `capitalize`, `size`等。
用户可根据业务逻辑定义自己的过滤器。

> Liquid过滤器是可以级联的，例如：`{{ list | split: ',' | join: '-' }}`。
{% endraw %}

# liquidjs 项目

最近Harttle发起了[harttle/liquidjs][hsl]项目，这是Node.JS下的Liquid实现，符合Shopify Liquid文档的要求。
因此该模板引擎是与Jekyll或Github Pages兼容的。

当前Node.js下有[liquid-node][liquid-node]作为Liquid实现，Harttle已经在长期使用。
可惜它的实现不够完整，扩展Tag较为困难。
liquid-node在进一步开发之前还需要CoffeeScript到ES6的整体迁移，因此很多Issue都处于Open状态。
所以Harttle决定发起一个Node.JS下的Liquid项目，将容易扩展作为首要特性。
意在提供最强的功能特性，现已实现[Shopify Liquid][sl]文档中的所有标签和过滤器。

* Github：<https://github.com/harttle/liquidjs>
* NPM: <https://www.npmjs.org/package/liquidjs>

> 欢迎大家提供意见、提供Tag或Filter的PR、开发其他框架下的插件包装。

[ts]: https://en.wikipedia.org/wiki/Web_template_system
[sl]: https://shopify.github.io/liquid/
[liquid-node]: https://github.com/sirlantis/liquid-node
[hsl]: https://github.com/harttle/liquidjs
[dt]: https://docs.djangoproject.com/en/1.9/ref/templates/
[cs]: https://en.wikipedia.org/wiki/CodeCharge_Studio
[Thymeleaf]: https://en.wikipedia.org/wiki/Thymeleaf
[hbs]: http://handlebarsjs.com/
[ngt]: https://docs.angularjs.org/guide/templates
[jade]: http://jade-lang.com/
[ejs]: https://github.com/tj/ejs
