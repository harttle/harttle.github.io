---
title: 常用 MongoDB 命令手册
tags: JavaScript MongoDB 数据库
---

MongoDB与JavaScript天然的兼容性使得在Node.js下使用MongoDB及其舒服。
我们通常会使用类似[mongoose][mongoose]的ORM工具来操作MongoDB。
然而手动查看数据库在很多场景下仍然很有用，例如Debug模型间关系，清空用户表，重置数据库。

本文列举了这些常用的[MongoDB][mongodb]命令。MongoDB文档：<https://docs.mongodb.com/>

<!--more-->

## 数据库操作

```javascript
# 查看数据库
show dbs
# 切换数据库
use mydatabase
# 查看当前数据库
db
# 删除当前数据库
db.dropDatabase()
```

## 集合操作

```javascript
# 查看集合
show collections
# 删除集合
db.users.drop()
```

## 文档操作

### 插入文档

```javascript
db.users.insert({
    name: 'harttle',
    url: 'https://harttle.land'
})
```

### 查询文档

```javascript
# 查询所有
db.users.find()
# 条件查询
db.users.find({
    name: 'harttle'
})
# 有缩进的输出
db.users.find().pretty()
```

### 更新文档

```javascript
db.users.update({
    name: 'harttle'
}, {
    url: 'https://harttle.land'    
})
```

### 删除文档

```javascript
# 删除所有
db.users.remove({})
# 条件删除
db.users.remove({
    url: 'https://harttle.land'
})
```

[mongoose]: http://mongoosejs.com/
[mongodb]: https://mongodb.com
