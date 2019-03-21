---
title: 表单提交：button input submit 的区别
tags: HTML JavaScript jQuery 事件 表单
excerpt: 建议使用`button[type=submit]`来提交表单，而不是`input`；只有单行文本控件时，回车会引发表单提交；通过`onsubmit`事件可阻止表单提交
---

最近项目代码中的表单提交的方式已经百花齐放了，现在用这篇文章来整理一下不同表单提交方式的区别，给出最佳实践。先给结论：

* 建议使用`button[type=submit]`来提交表单，而不是`input`；
* 只有单行文本控件时，回车会引发表单提交；
* 通过`onsubmit`事件可阻止表单提交。

## input[type=submit]

这是最常见的提交方式。不多说了，看图：

![input element](/assets/img/blog/html/input@2x.png)

图中可以看到点击提交按钮后的URL是`/?key=foo`。代码如下：

```html
<form>
  <input name='key'>
  <input value='ok' type='submit'>
</form>
```

其中有些值得注意的细节：

* 设置`type=submit`后，输入控件会变成一个按钮，显示的文字为其`value`值，默认值是`Submit`。
* `form[method]`默认值为GET，所以提交后会使用GET方式进行页面跳转。
* `input[type]`默认值为`text`，所以第一个`input`显示为文本框。

`input`其实是一个由输入控件改装过来的按钮，这源于Web早期的简陋设计。我们给它设置`name`便可以验证这一点：

```
<input name='btn' value='ok' type='submit'>
```

提交后的结果为：

![input with name](/assets/img/blog/html/input-with-name@2x.png)

注意其中的URL为`/?key=foo&btn=ok`。作为按钮的`input`控件同时被当做一个表单输入提交给了服务器。
它到底是交互控件还是数据控件呢？定位是有些不清晰。再加上它的样式难以定制、不可作为其他标签的容器，
所以**建议不要用`input`作为表单提交按钮**。

> `input`的`type`属性还可以是`button`，这时它只是一个按钮，不会引发表单提交。

<!--more-->

## button[type=submit]

`button`的语义很明确，就是一个按钮不含数据，作用就是用户交互。但它也有`type`和`value`属性。
`type`的默认值是`submit`，所以点击一个`button`会引起表单提交：

```html
<form>
  <input name='key'>
  <button>确定</button>
</form>
```

> 注意！如果你在做IE浏览器的兼容，请记住`button[type]`在IE中的默认值是`button`，这意味着它只是一个按钮而不会引发表单提交。

另外你可能已经注意到了，我们通过设置元素内容的方式来指定`button`的文字。这意味着`button`是一个容器控件，
其中可以包含任意的HTML标签，同时样式更容易定制。这也是为什么[Bootstrap 文档][bootstrap]中大量使用`button`作为示例的原因之一。

不幸的是，`button`居然也可以设置`name`和`value`。提交表单时，`value`会被作为表单数据提交给服务器。
在IE中，甚至会把`button`开始与结束标签之间的内容作为`name`对应的值提交给服务器。种种乱象。。
`button`和`input`的相似还不止于此，`button`也可以设置`type=reset`，此时点击按钮会导致表单被重置（这还挺有用的）。
w3school给出了如下的示例：

```html
<form action="form_action.asp" method="get">
  First name: <input type="text" name="fname" />
  Last name: <input type="text" name="lname" />
  <button type="submit" value="Submit">Submit</button>
  <button type="reset" value="Reset">Reset</button>
</form>
```

对于`button`就不多说了，**建议用`button`作为交互用的按钮，来提交表单**。同时请注意设置`type=submit`来兼容IE。

> IE 中`button`标签的`type`属性默认为`button`。

## Enter 键提交表单

Enter键是可以提交表单的！但是你可能已经注意到了，并非所有的表单都可以用Enter键来提交。来看[HTML2.0 标准][html2]：

> When there is only one single-line text input field in a form, the user agent should accept Enter in that field as a request to submit the form.
> 
> 当表单中只有一个单行的文本输入控件时，用户代理应当接受回车键来提交表单。

“单行”指的是`type`为`text`而非`textarea`，显然在`textarea`中回车提交表单是怎样的难以接受！
其实在实践中，有多个单行的`input`也可以用Enter提交，比如登录页面（太典型了，不仅是这样开发的，而且是这样使用的）。
要知道HTML2.0标准制定于1995，可以说这一句不起眼的条文影响着我的每次网站登录。W3C的这批人是有怎样的远见和智慧！

## 阻止表单提交

阻止表单提交也是一个常见的话题，通常用于客户端的表单验证。通用的办法是设置`onsubmit`：

```html
<form onsubmit="return false;">
  <input name='key'>
  <input value='ok' type='submit'>
</form>
```

只需要在`onsubmit`的一系列语句最后返回`false`，便可以阻止它提交。
如果你希望调用一个方法来决定是否阻止提交，记得在此处返回方法的返回值：

```html
<form onsubmit="return doValidation();">
  <input name='key'>
  <input value='ok' type='submit'>
</form>
```

> 上述代码只是为了示例，你可能更希望通过jQuery来绑定事件处理函数。

[html2]: http://www.w3.org/MarkUp/html-spec/html-spec_toc.html
[bootstrap]: http://v3.bootcss.com
