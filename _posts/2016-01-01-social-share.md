---
layout: blog
title: jQuery社会化分享：支持微信、微博、Github...
tags: CSS Github HTML JavaScript jQuery 微信 二维码
---

一个既美观有支持微信的社会化分享工具：[harttle/social-share][sc]。
支持微信（二维码）、微博、Github、Google+、LinkedIn、Twitter、Facebook、RSS...，
支持四种大小设置。

* 在线Demo： https://harttle.land/social-share/

* 文档： https://github.com/harttle/social-share

> 最近在[天码营][tmy]和本博客中添加社会化分享，调研和尝试了不少第三方工具。
> 国内最方便的应当是[jiathis][jiathis]，然而并不美观。国外的工具基本都没有微信（二维码）的支持。
> 于是诞生了 [harttle/social-share][sc]。

<!--more-->

### 效果图

![social share@2x][sc-img]

### 第三方依赖

[harttle/social-share][sc]依赖于[Fontawesome][font]和[jQuery][jq]，
需要先引入这两个第三方库：

```html
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
```

### 使用方法

引入第三方依赖后，再加入[harttle/social-share][sc]：

```html
<link rel="stylesheet" href="path/to/social-share.min.css">
<script src="path/to/social-share.min.js"></script>
```
 
在页面脚本中加入如下代码即可：

```javascript
var links = {
    weibo: 'http://v.t.sina.com.cn/share/share.php?url=xxx&title=xxx&appid=xxx',
    wechat: location.href,
    github: 'https://github.com/harttle',
};

$('div').socialShare(links);
```

此时即可得到一个具有微博、微信、Github按钮的社会化分享栏。
你还可以调整它们的顺序、大小等，更多设置请参考文档：

https://github.com/harttle/social-share

[sc]: https://github.com/harttle/social-share
[jiathis]: http://www.jiathis.com/
[sc-img]: /assets/img/blog/social-share.png
[font]: http://fontawesome.io/
[jq]: http://jquery.com/
[tmy]: http://tianmaying.com/
