---
title: 用 jQuery 实现实时的表单验证
tags: CSS HTML jQuery 事件 表单
---

Web2.0以来用户的广泛参与使得表单在Web中无处不在，实时的表单验证可以带来非常酷的用户体验。
本文介绍在jQuery中如何进行声明式的、可定制的、实时的表单验证！

**表单验证**在Web中用来验证和提取用户输入，其目的在于保证数据的有效性和提升用户体验。
表单验证分为服务器端验证和浏览器端验证，出于安全性考虑服务器端验证是不可缺少的；
因此浏览器端表单验证的唯一目的便是提升用户体验。

## 引入 jQuery Validation

[jQuery Validation](https://jqueryvalidation.org/)是由jQuery团队成员开发和维护的jQuery表单验证插件。
我们利用它来实现实时表单验证。

> Jörn Zaefferer, a member of the jQuery team, lead developer on the jQuery UI team and maintainer of QUnit.

<!--more-->

在这里下载jQuery Validation插件: <https://jqueryvalidation.org/>。
然后在HTML中加以引入，其中`messages_zh.min.js`是中文汉化：

```html
<script src="/lib/jquery-validation/jquery.validate.min.js"></script>
<script src="/lib/jquery-validation/localization/messages_zh.min.js"></script>
```

## 开始使用

本节简单介绍jQuery Validation插件如何使用。

> jQuery Validation文档：<https://jqueryvalidation.org/documentation/>

```html
<form id="comment-form">
  <input type="email" id="email" name="email" required>
  <textarea id="content" name="content" minlength="2" required></textarea>
  <button type="submit">提交</button>
</form>

<script>
$("#comment-form").validate();
$('#comment-form button').click(function(){
  if(!$("#comment-form").valid()) return false;
  // do your logic
});
</script>
```

调用`.validate()`进行表单验证初始化，
在提交表单时调用`.valid()`进行一次表单验证，这时
jQuery Validator会根据HTML标准进行表单验证：

* 不合法的`<input>`（或`<textarea>`）会被添加`"error"`类；
* 紧接着该`<input>`会出现一个`<label>`表示错误信息。

例如，`#email`留空时HTML会变成这样：

```html
<form id="comment-form">
  <input type="email" id="email" name="email" required class="error">
  <label id="email-error" class="error" for="email">该字段为必填项</label>
  <textarea id="content" name="content" minlength="2" required></textarea>
  <button type="submit">提交</button>
</form>
```

> 实际使用时为了实现较好的效果，需要自定义`.error`的CSS；以及在合适的时候调用`.validate()`进行验证。

## 实时验证

实时验证其实很简单，通过输入事件触发`.valid()`即可。
在[页面载入][dom-ready]时，执行下面的脚本：

```javascript
$('form').each(function(i, el) {
    var $this = $(el);
    $this
        .data('validator', $this.validate())
        .delegate('input, select, textarea', 'input propertychange', function(e) {
            $(e.target).valid();
        });
});
```

这段脚本遍历了当前页面的所有`form`，为每一个`form`初始化一个表单验证并存储在`data-validator`中。

通过[jQuery事件][jquery-event]进行实时表单验证：在`input`, `select`, `textarea`中内容发生变化时，调用`.valid()`。

## 自定义 validator

有时我们需要根据自身的业务逻辑进行特殊的表单验证，这时HTML标准提供的表单验证可能不够了。
可以注册自己的验证项，例如手机号：

```javascript
jQuery.validator.addMethod("phone", function(value, element) {
    return /^1[3|4|5|8]\d{9}$/.test(value);
}, '手机号不合法');
```

在HTML中使用时：

```html
<input name="phone" data-rule-phone="true" data-msg-phone="手机号不对哦！">
```

* `data-rule-phone`用来启用一个叫`"phone"`的Validator，
* `data-msg-phone`用来定义该validator验证失败时的信息。

验证失败信息的默认值为注册validator时给出的第三个参数`'手机号不合法'`，如果未设置第三个参数则默认值为当前表单控件的`title`属性。

## validator 参数

为了实现更强大的validator，还可以给他传参。在控件之间存在关联的表单中非常有用，比如重复输入密码。将上述的`"true"`替换为参数即可。

```html
<input id="passwd" name="passwd" type="password" data-rule-regex="^\w{8,12}$">
<input id="repeat" name="repeat" type="password" data-rule-equal="#passwd">
```

* 第一个密码控件`#passwd`设置了密码必须为8-12位的数字、字母或下划线；
* 第二个密码控件`#repeat`设置了必须和`#passwd`输入一致。

这里需要两个自动以validator（`regex`和`equal`），它们的实现如下：

```javascript
jQuery.validator.addMethod("equal", function(value, element, selector) {
    return this.optional(element) || $(selector).val() === value;
}, '两次输入不一致');

jQuery.validator.addMethod("regex", function(value, element, regexp) {
    var re = new RegExp(regexp);
    return this.optional(element) || re.test(value);
}, '输入不合法');
```

> 需要先调用`optional`是因为当前控件可能并非`required`，用户不填写时应当返回`true`。

## 几点提示

* 调用`.valid()`之前需要调用`.validate()`进行初始化。见文档：<https://jqueryvalidation.org/category/plugin/#-valid()>

* 调用`validator.resetForm()`可以重设表单验证信息，当表单提交成功可能会用到。下面代码提供了`.reset()`方法来同时重设表单内容和验证信息：

  ```javascript
  jQuery.fn.reset = function() {
      var validator = this.data('validator');
      if (!validator) return false;

      validator.resetForm();
      this.get(0).reset();
  };
  ```

  > 其中`this.data('validator')`的值是我们在实时验证表单时设置的。

* 对于`required`这种内置validator，也可以通过`data-msg-require`来自定义错误提示信息。

* 在这里给出了内置的validator列表：<https://jqueryvalidation.org/documentation/#link-list-of-built-in-validation-methods>

[dom-ready]: /2016/05/14/binding-document-ready-event.html
[jquery-event]: /2015/06/26/jquery-event.html
