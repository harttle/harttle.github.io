---
title: 在mongoose中填充外键
tags: JavaScript MongoDB NoSQL 引用 数组 集合 数据库 mongoose
---

[MongoDB][mongo]是典型的NoSQL数据库，因此不提供JOIN操作。
但有时我们仍然希望引用其他集合中的文档。此时便需要外键填充（population）。
[mongoose][mongoose]是极具JavaScript特点的程序库，提供了极其简单和强大的填充功能。
[mongoose][mongoose]不仅支持填充单个文档，也支持多文档，甚至直接填充某个对象。

> 本文中部分代码来自[mongoose文档][mongoose-doc]。

# 外键引用

在Schema字段的定义中，可以添加`ref`属性来指向另一个Schema。
该`ref`属性在此后被填充（[`populate`][populate]）时将被[mongoose][mongoose]读取。
下面是存在互相引用的`Person`与`Story`的Schema定义。

```javascript
var mongoose = require('mongoose'), Schema = mongoose.Schema
  
var personSchema = Schema({
  // _id默认为Schema.Types.ObjectId类型
  _id     : Number,
  name    : String
});

var storySchema = Schema({
  creator : { type: Number, ref: 'Person' },
  title    : String,
  // 可以看到外键引用可以定义在嵌套的属性中。
  fans     : [{ type: Number, ref: 'Person' }]
});

var Story  = mongoose.model('Story', storySchema);
var Person = mongoose.model('Person', personSchema);
```

<!--more-->

外键的类型可以是`ObjectId`, `Number`, `String`, `Buffer`中任何一种，在赋值与填充时保持一致即可（见下文）。

# 保存与填充

`Story`中保存`Person`对象的`_id`，此后在Query上调用`.populate()`即可用`Person`的文档来替换掉原来的字段。

```javascript
var alice = new Person({ _id: 0, name: 'Alice'});
# 保存其ID即可
var story = new Story({ title: 'xx', creator: alice._id });

Story.findOne({title: 'yy'})
    .populate('creator')
    .exec(function(err, story){
        if(err) throw err;
        console.log(story.creator.name);
    });
```

# 填充指定的字段

有时我们只想要很少的几个字段，这可以用[字段名语法][fieldname]来指定它们。

```javascript
Story.findOne({title: 'xx'})
    .populate('creator', 'name')  // 只返回Person的name字段
    .exec(function(err, story){
        if(err) throw err;
        console.log(story.creator.name);
    });
```

# 填充多个属性

有时我们需要填充多个字段，这时可以多次调用`.populate()`，
也可以在一次调用中指定多个字段：

```javascript
Story.find(...)
    .populate('creator fans')
    .exec();
Story.find(...)
    .populate('creator')
    .populate('fans')
    .exec();
```

填充引用数组与填充单个引用的语法没有区别，[mongoose][mongoose]会识别字段类型的不同。

# 填充选项

在`.populate()`的同时，还可以指定过滤器以及限制大小。
将`.populate()`的参数换为一个对象即可。

```javascript
Story.find(...)
    .populate({
        path: 'fans',
        match: { age: { $gte: 21 }},
        select: 'name',
        options: { limit: 5 }
    });
    .exec();
```

上述查询只会选择年龄大于`21`的`fans`，只返回其`name`字段，且最多返回`5`个。

> 完整的选项请访问：<http://mongoosejs.com/docs/api.html#model_Model.populate>

# 多级填充

想填充引用的引用怎么办？给`.populate()`传入嵌套的参数即可。
比如填充用户的朋友的朋友（两级）：

```javascript
var userSchema = new Schema({
    name: String,
    friends: [{ type: ObjectId, ref: 'User' }]
});
User.
    findOne({ name: 'Val' }).
    populate({
        path: 'friends',
        populate: { path: 'friends' }
    });
```

注意多级填充和嵌套属性填充的区别。如果是填充属性的属性（都在当前模型中保存）
则只需要用`.`分隔，比如：`.populate('relations.mother')`。

# 动态引用

上文中调用`.populate()`之前有一个条件：被填充的字段已被设置过`ref`选项。
[mongoose][mongoose]会去`ref`指定的集合中去查找对应ID。
如果是动态字段怎么办？可以在填充的同时指定其`ref`：

```javascript
var userSchema = new Schema({
    _id: Number,
    name: String,
    teacher: Number
});
User.
    findOne({ name: 'Val' }).
    populate({
        path: 'teacher',
        model: 'User'   // 在User集合中查找该ID
    })
```

# 任意对象填充

[mongoose][mongoose]不仅可以填充Query中的对象，还可以填充任何对象。
当然这时就需要指定用哪个模型来填充，有两种方式来指定填充模型。

## 设置populate的model参数

与动态填充类似，填充时可以直接设置`model`参数。
这时用任意一个Schema都可以操作，比如`User`：

```javascript
var user = { name: 'Indiana Jones', weapon: 389 };
User.populate(user, { path: 'weapon', model: 'Weapon' }, function (err, users) {
    console.log(user.weapon.name);
});
```

## 直接使用对应Schema

直接使用`Weapon`来填充该类型的属性，则不需要设置`model`字段：

```javascript
var user = { name: 'Indiana Jones', weapon: 389 };
Weapon.populate(user, { path: 'weapon' }, function (err, users) {
    console.log(user.weapon.name);
});
```

> [mongoose][mongoose]会默认使用当前Schema对应的[MongoDB][mongo]的集合。

[mongo]: https://docs.mongodb.com/
[mongoose]: http://mongoosejs.com/
[mongoose-doc]: http://mongoosejs.com/docs/populate.html
[fieldname]: http://mongoosejs.com/docs/api.html#query_Query-select
[populate]: http://mongoosejs.com/docs/api.html#model_Model.populate
