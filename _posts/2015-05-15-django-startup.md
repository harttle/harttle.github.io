---
layout: blog
categories: web
title: Django Startup
tags: Linux Python Django Web
redirect_from:
  - /web/django-startup.html
  - /2015/05/15/django-startup/
---

# 安装

django

```bash
cd my_django_file
sudo python setup.py install
```
        
mysql

```bash
apt-get install python-mysqldb mysql-server mysql-client libmysqld-dev
```

# 配置数据库

1. 在数据库中创建一个database

    ```sql
    create database database_name default charset utf8
    ```
    
2. 在settings.py中设置数据库

    ```json
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

# 常用命令

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
	
