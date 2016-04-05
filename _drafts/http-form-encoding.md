---
layout: blog
title: HTTP 表单编码 enctype
tags: HTML HTTP JSON XML 表单
---

在web开发中最常见的莫过于GET和POST，其中GET一般将参数编码在url中（HTTP header）来传递数据；
而POST或PUT数据必须放在消息主体（entity-body）中，这样的数据便是HTTP表单，表单数据的编码方式应在HTTP头中进行设置（Content-Type header字段），常见的编码方式有（HTTP采用MIME框架，编码方式可以是任何MIME类型）：

1. URLencoded: `application/x-www-form-urlencoded`
2. Multipart: `multipart/form-data`
3. JSON: `application/json`
4. XML: `text/xml`
5. 纯文本: `text/plain`

在Web开发中，前三种格式非常常见。HTML中`<form>`支持`urlencoded`,`multipart`,`plain text`，通过`enctype`属性来进行设置。AJAX中默认的则是JSON编码格式。

<!--more-->

# URLencoded

HTML中`<form>`标签的`enctype`属性用来指定表单编码格式，默认为`application/x-www-form-urlencoded`，即以下两个表单完全等价。

```html
<form method='post'>
  <input type="text" name='title'>
  <input type="text" name='subtitle'>
  <input type="submit">
</form>
```

```html
<form  method='post' enctype='application/x-www-form-urlencoded'>
  <input type="text" name='title'>
  <input type="text" name='subtitle'>
  <input type="submit">
</form>
```

上述表单将会显示为两个文本框和一个提交按钮。我们在文本框中分别写入`test`和`中国`后，点击提交按钮。产生的HTTP请求可能是这样的：

> 可以打开Chrome控制台的Network标签，找到这次请求，便可以看到下面的信息。

请求头（这里只给出了`Content-Type`字段）：

```
POST http://www.example.com HTTP/1.1
Content-Type: application/x-www-form-urlencoded
```

请求体：

```
title=test&subtitle=%E4%B8%AD%E5%9B%BD
```

> 这里你看到的`%E4%B8%AD%E5%9B%BD`即是`中国`按照base64编码（url通用的编码方式）后的结果。可以在Chrome Console中通过`decodeURI('%E4%B8%AD%E5%9B%BD')`来解码。


# Multipart

multipart编码方式则需要设置`enctype`为`multipart/form-data`。

```html
<form method="post" enctype="multipart/form-data">
    <input type="text" name="title" value="harttle">
    <input type="file" name="avatar">
    <input type="submit">
</form>
```

> 这里我们还设置了`<input type='text'>`的默认值为`harttle`。

该表单将会显示为一个文本框、一个文件按钮、一个提交按钮。然后我们选择一个文件：`chrome.png`，点击表单提交后产生的请求可能是这样的：

请求头：

```
POST http://www.example.com HTTP/1.1
Content-Type:multipart/form-data; boundary=----WebKitFormBoundaryrGKCBY7qhFd3TrwA
```

请求体：

```
------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="title"

harttle
------WebKitFormBoundaryrGKCBY7qhFd3TrwA
Content-Disposition: form-data; name="avatar"; filename="chrome.png"
Content-Type: image/png

 ... content of chrome.png ...
------WebKitFormBoundaryrGKCBY7qhFd3TrwA--
```

这便是一个multipart编码的表单。`Content-Type`中还包含了`boundary`的定义，它用来分隔请求体中的每个字段。正是这一机制，使得请求体中可以包含二进制文件（当然文件中不能包含`boundary`）。

> 除了`application/x-www-form-urlencoded`和`multipart/form-data`，HTML的`<form>`还支持`text/plain`。此外，如果想提交其他编码类型的表单，必须通过AJAX技术，接下来我们介绍一个常用的JSON数据的提交。

# JSON

从JavaScript中提交JSON数据真是再方便不过了，jquery、angularJS等框架都封装了更好用的AJAX方法。例如：

```javascript
$.post('/xxx', {
        title: 'test',
        content: [1,2,3]
    });
```

该JavaScript执行后可能生成如下的HTTP请求：

请求头：

```
POST http://www.example.com HTTP/1.1
Content-Type: application/json;charset=utf-8
```

请求体：

```json
{"title":"test","content":[1,2,3]}
```

# XML

请求头：

```bash
POST http://www.example.com HTTP/1.1
Content-Type: text/xml
```

请求体：

```xml
<!--?xml version="1.0"?-->
<methodcall>
    <methodname>examples.getStateName</methodname>
    <params>
        <param>
            <value><i4>41</i4></value>
    </params>
</methodcall>
```



