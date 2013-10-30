---
layout: article
title:  "GitHub 个人主页开发记录"
categories: 日志
tags: 工作记录
excerpt: 本文记录了开发进度、时间节点，以及任务列表。
---

2013年10月采用jekyll静态站点工具开始了github个人主页的开发。这里记录了各时间结点完成的工作，以及未来的工作列表。

### 2013-10-12

基本完成了个人主页在 github 的部署。

* 主要页面
    * 首页
    * 博文
    * 关于
    * 链接
* 识别文章目录，生成博文分类


### 2013-10-16

* 社会化评论

### 2013-10-17

* 照片展示
    * 延迟载入
    * gallery浏览

### 2013-10-25

* 博客、相册、资源的category模板
  * 页面布局：header、side-nav、content
  * affix 滚动导航
* 相册图片缩略图的自动更新（make+imageMagick）

### 2013-10-28

* 404页面

### 2013-10-29

* latex显示：采用mathJax
* 添加 CDN
* 添加文章列表动态导航

### 2013-10-30

* 解决 affix-bottom 失效

    > 问题出自 sticky footer 中的 `body{height:100%}`，解决：
    > Replace `document.body.offsetHeight` with `document.body.scrollHeight` in bootstrap.min.js

### 未来的工作

* 首页完善：简历时间线
