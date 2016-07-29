---
title: jQuery 利用 FormData 上传文件
tags: FormData HTML HTTP IE JavaScript jQuery 表单 异步
---

文件上传是Web开发中的重要话题，最直接和简单的方式是通过表单直接提交文件。
Harttle认为，我们引入jQuery来进行异步上传可以获得更好的用户体验。
一方面，在JavaScript中进行异步操作比表单更加灵活；
另一方面，异步上传也避免了上传大文件时的页面长时间卡死。

<!--more-->

# HTML 

一个`type=file`的`<input>`就可以让用户来浏览并选择文件，
一般会把输入控件放到一个`<form>`中，下面的一个简单的表单：

```html
<form>
  <input type="file" id="avatar" name="avatar">
  <button type="button">保存</button>
</form>
```

但为什么我只能选择一个文件？？给`<input>`添加一个`multiple`属性就可以多选了！

```html
<input type="file" id="avatar" name="avatar" multiple>
```

# 获取文件列表

上述的`<input>`将会拥有一个叫`files`的DOM属性，包含了所选的文件列表（`Array`）。

```javascript
$('button').click(function(){
  var $input = $('#avatar');
  // 相当于： $input[0].files, $input.get(0).files
  var files = $input.prop('files');
  console.log(files);
});
```

这个`Array`中的每一项都是一个`File`对象，它有下面几个主要属性：

* `name`: 文件名,只读字符串,不包含任何路径信息.
* `size`: 文件大小,单位为字节,只读的64位整数.
* `type`: MIME类型,只读字符串,如果类型未知,则返回空字符串.

> 见：<https://developer.mozilla.org/zh-CN/docs/Using_files_from_web_applications>

# multipart/form-data

上传文件比较特殊，其内容是二进制数据，而HTTP提供的是基于文本的通信协议。
这时需要采用`multipart/form-data`编码的HTTP表单。其HTTP消息体格式如下所示：

```
------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="title"

harttle
------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="avatar"; filename="harttle.png"
Content-Type: image/png

 ... content of harttle.png ...
------WebKitFormBoundaryrGKCBY7qhFd3TrwA--
```

每个字段由一段boundary string来分隔，浏览器保证该boundary string不与内容重复，
因而`multipart/form-data`能够成功编码二进制数据。

> 更多关于HTTP表单编码的细节，请参考：[HTTP 表单编码 enctype][form-enc]。

# jQuery上传文件

这是XMLHttpRequest Level 2提供的`FormData`对象可以帮助我们进行二进制文件的
`multipart/form-data`编码：

```javascript
$('button').click(function(){
  var files = $('#avatar').prop('files');

  var data = new FormData();
  data.append('avatar', files[0]);

  $.ajax({
      url: '/api/upload',
      type: 'POST',
      data: data,
      cache: false,
      processData: false,
      contentType: false
  });
});
```

`url`, `type`, `data`想必做前端的都很熟悉了，介绍其余三个参数：

## cache

`cache`设为`false`可以禁止浏览器对该URL（以及对应的HTTP方法）的缓存。
jQuery通过为URL添加一个冗余参数来实现。

该方法只对GET和HEAD起作用，然而IE8会缓存之前的GET结果来响应POST请求。
这里设置`cache: false`是为了兼容IE8。

> 参考：<http://api.jquery.com/jquery.ajax/>

## contentType

jQuery中`content-type`默认值为`application/x-www-form-urlencoded`，
因此传给`data`参数的对象会默认被转换为query string（见[HTTP 表单编码 enctype][form-enc]）。

我们不需要jQuery做这个转换，否则会破坏掉`multipart/form-data`的编码格式。
因此设置`contentType: false`来禁止jQuery的转换操作。

## processData

jQuery会将`data`对象转换为字符串来发送HTTP请求，默认情况下会用
`application/x-www-form-urlencoded`编码来进行转换。
我们设置`contentType: false`后该转换会失败，因此设置`processData: false`来禁止该转换过程。

> 我们给的`data`就是已经用`FormData`编码好的数据，不需要jQuery进行字符串转换。

# 兼容性与其他选择

本文介绍的jQuery文件上传方式依赖于[`FormData`][formdata]对象， 
这是XMLHttpRequest Level 2接口，
需要 IE 10+, Firefox 4.0+, Chrome 7+, Safari 5+, Opera 12+

这意味着对于低版本浏览器只能使用直接提交文件表单的形式，
但提交大文件表单页面会长时间不响应，如果希望在低版本浏览器中解决该问题，
就只能使用别的方式来实现了，比如很多支持多文件和上传进度的Flash插件。

[formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[form-enc]: /2016/04/11/http-form-endoding
