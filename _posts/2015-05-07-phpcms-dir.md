---
layout: blog
categories: web
title: PHPCMS 目录结构
tags: php
---

[phpcms](http://www.phpcms.cn/) 是国产cms建站工具，直接拷贝在php目录下打开，即可在网页向导进行安装。过程中需要更改本地目录权限、安装数据库和php插件（如php-mysql，php-gd，php-apache）。

> 本文讨论版本为 PHPCMS V9、PHP5.、Apache2.2。

其目录结构如下：

```
根目录
|  –  api  接口文件目录
|  –  caches 缓存文件目录
       |  – configs 系统配置文件目录
       |  – caches_* 系统缓存目录
|  –  phpcms  phpcms框架主目录
       |  – languages 框架语言包目录
       |  – libs 框架主类库、主函数库目录
       |  – model 框架数据库模型目录
       |  – modules 框架模块目录
       |  – templates 框架系统模板目录
|  –  phpsso_server  phpsso主目录
|  –  statics  系统附件包
       |  – css 系统css包
       |  – images 系统图片包
       |  – js 系统js包
|  –  uploadfile  网站附件目录
|  –  admin.php  后台管理入口
|  –  index.php  程序主入口
|  –  crossdomain.xml  FLASH跨域传输文件
|  –  robots.txt 搜索引擎蜘蛛限制配置文件
|  –  favicon.ico  系统icon图标
```

> CMS开发的主要工作包括模块开发和模板开发：模块开发在models下进行，模板开发在template下进行。
