---
layout: blog
title: Django 搭建过程记录
tags: Bash Django Github Python SQL 数据库
---

2011年小编第一次想做Web开发于是找到了Django，因为完全不懂数据库而以失败告终。
2013年小班再次拿出Django，终于开发了小编的第一个Web站点（多用户博客：God Notes）。
最初部署在BAE上，现在已经打包封存在Github了：https://github.com/harttle/godnotes
本文记录了小编的第一个Django应用是如何开始的。

<!--more-->

## 安装

django

```bash
cd my_django_file
sudo python setup.py install
```

mysql

```bash
apt-get install python-mysqldb mysql-server mysql-client libmysqld-dev
```

## 配置数据库

1. 在数据库中创建一个database

    ```sql
    create database database_name default charset utf8
    ```
    
2. 在settings.py中设置数据库

    ```
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql', 
            'NAME': 'imgapi',  
            'USER': 'harttle',
            'PASSWORD': 'idonttellyou',
            'HOST': 'localhost',  
            'PORT': '',    
        }
    }
    ```

## 常用命令

开启服务

```bash
python manage.py runserver [8080]
```

创建应用

```bash
python manage.py startapp appname
```

验证模型

```bash	
python manage.py validate
```

查看数据库语句

```bash	
python manage.py sqlall [appname]
```
			
同步数据库
	
```bash	
python manage.py syncdb
```

> 只会同步原来没有的table，已有table的改动不会同步。

