---
layout: blog
title: LAMP 搭建
tags: Apache Linux PHP kill 数据库
---

听说PHP是世界上最好的编程语言，小编也试了一把。暂作记录在此。
万一小编以后转向PHP了呢？

# 下载安装

[php](http://www.php.net)
[mysql](http://httpd.apache.org)
[apache](http://www.mysql.com/)

# 配置apache

设置apache的配置文件`httpd.conf`，更改后要`restart httpd`

* web目录：更改 DocumentRoot

    ```
    DocumentRoot "E:/web"
    ```

* 默认页面：找到 DirectoryIndex 并改成

    ```
    DirectoryIndex index.html index.php test.php hello.php
    ```

* php支持：找到loadmodule部分添加

    ```
    #这里dll在php安装路径，并且要对应apache版本，这里是2.2.22
    LoadModule php5_module "D:/Program Files (x86)/php-5.4.8/php5apache2_2.dll"
    ```

* 添加对.php文件支持

    ```
    AddType application/x-httpd-php .php
    ```

* 路径访问权限，更改要与 DocumentRoot 一致

# Apache使用

以下关注Debian兼容的操作系统。文档：http://man.ddvip.com/linux/debian/apache2/

```bash
#启动
sudo /etc/init.d/apache2 start
#停止
sudo /etc/init.d/apache2 stop
#或者直接结束进程
sudo killall apache2
#配置文件
ls /etc/apache2
```
