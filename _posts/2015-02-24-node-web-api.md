---
title:  API 服务器搭建笔记：CentOS + Node.js + MongoDB
tags: CentOS JavaScript MongoDB Node.js SQL 内存 数据库 内存数据库 JSON NPM mongoose
---

本文尝试在CentOS服务器上，使用js来构建整个web服务，包括nodejs运行时、MongoDB json风格数据库、redis内存数据库。首先安装这些软件：

```bash
# centos
yum install git nodejs npm mongodb mongodb-server redis

# Mac OSX
brew install mongodb nodejs redis
```

<!--more-->

# Node

## 运行服务器

本文只是使用`screen`完成服务器软件的运行，并未完整地部署。实际的生产环境部署中，需要完整的日志记录、服务器性能监控等。

启动redis：

```bash
screen -dmS redis   # 建立一个detach的screen窗口
screen -list        # 查看redis窗口的号
screen -r <number>  # attach redis窗口
redis-server        # 启动node
<C-a-d>             # detach当前任务
```

启动node服务器：

```bash
screen -dmS node    # 建立一个detach的screen窗口
screen -list        # 查看node窗口的号
screen -r <number>  # attach node窗口
sudo npm start      # 启动node
<C-a-d>             # detach当前任务
```

## API Token

Web API中的权限一般通过Token来识别。不同于 web page，API不方便使用 cookie 而通常通过 Token 来验证用户：

1. 首先用户发送其用户名与密码；
2. 服务器验证
    * 若失败返回错误
    * 成功则返回一个Token，用于身份标识。
3. 之后的API访问，用户需发送该Token给服务器以提供身份。

```js
// 引入jwt
var jwt = require('jwt-simple');

// 设置一个客户端不知道的secret
var secret = 'hehe'

// username -> Token
User.methods.getToken = function(){
      return jwt.encode(this.username, secret);
}

// Token -> username
User.statics.findByToken = function(token, callback){
      this.findOne({ username: jwt.decode(token, secret)}, callback);
}
```

# MongoDB

MongoDB是一种非关系型数据库（NoSQL），相比于SQL更为灵活。不同于SQL，每条记录是一个文档，而不是表中的一行。文档的概念很好的实现了面向对象思想。参见：[官网文档](http://docs.mongodb.org/)

在MongoDB的数据模型中，每个document有一个表示字段`_id:ObjectId`。可以通过该字段实现文档关联，当然也可以直接使用JSON格式的嵌套。

> 在`mongoose`中，`_id`包括引号，用户后台判断；`id`不包括引号，用于前台显示。

## 运行

```bash
# 创建数据目录，否则需要设置运行目录
mkdir -p /data/db

# 运行数据库，默认端口：27017
mongod
# centOS可以启动其init.d脚本
service mongod start

# 进入MongoDB终端
mongo

# 查看与切换数据库
show dbs
use <db_name>

# 集合操作
show collections
db.<collection_name>.drop()

# 帮助
help
db.help()
db.<collection_name>.help()
```


## CRUD

MongoDB中的document为BSON格式，即二进制的JSON表示加上类型信息，所有的document存储在collection中。每个查询将得到一个目标collection，查询需指定criteria来得到符号条件的collection，再通过modifier对集合元素进行处理（比如排序）。

![@2x](/assets/img/blog/crud-query-stages.png)

除了查询，还有`insert`,`update`,`remove`操作，它们均作用于单个collection：

![@2x](/assets/img/blog/crud-insert-stages.png)

> CRUD即增伤改查：create，read，update，delete

## 备份与恢复

可以直接将数据文件`/data/db`备份。而`mongodump`和`mongorestore`可以在`mongod`运行时完成备份和恢复。

```bash
mongodump
--db <database>, -d
# 指定数据库，默认全部备份

--collection <collection>, -c
# 指定集合，默认全部备份

--out <path>, -o
# 输出目录，默认当前目录
```
