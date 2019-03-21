---
title: 实现 Mongoose Schema 间继承
tags: JavaScript mongoose 继承 数据库 原型继承 Schema
---

在创建数据库模型时我们希望这些模型能够互相继承或扩展，
例如一个银行网站可能所有模型都需要实现逻辑删除、
都需要记录创建人、最后修改人，以及删除人的信息。
通常可以通过扩展（比如mixin）和继承（inherit）两种方式来实现。

对于小规模网站（比如20个模型以下）来讲，
继承的方式已经足够通用而且继承的代码复用方式编写代码更加方便。
Mongoose并未直接地提供改选项，本文实现一个基本的模型间继承关系。

<!--more-->

## 实现机制

在Mongoose中，Schema实例是通过`mongoose.Schema`建立的。
因此为了Schema间的继承关系，我们需要一个`BaseSchema`先继承自`mongoose.Schema`，
再让其他Schema例如`UserSchema`继承自`BaseSchema`。

本文采取传统的JavaScript原型继承方式来实现模型的继承关系。
我们希望`UserSchema`拥有`BaseSchema`的全部属性和方法，
同时`UserSchema`的构造参数仍然可以直接传递给`mongoose.Schema`。

### util.inherits

使用`util.inherits(constructor, superConstructor)`实现父子模型的继承关系：

```javascript
util.inherits(BaseSchema, mongoose.Schema);
```

其中`util.inherits`的实现方式就是原型继承：
将当前对象`constructor`的`prototype`属性设置为`superConstructor`创建的一个实例。
即：

```javascript
constructor.prototype = Object.create(superConstructor.prototype);
// 事实上情况要复杂得多，目前 Node.js 中以 Object.setPrototypeOf 实现..
```

> 注意，`util.inherits`已经不赞成使用了，应使用`class`和`extend`来代替。
> 且[两者的语义并不兼容][semantic-diff]。
> 但为了兼容目前的代码，本文仍然借助`util.inherits`来实现继承。

### Schema.apply

`UserSchema`除了继承`BaseSchema`，还需要将它的构造参数通过`BaseSchema`传递给`mongoose.Schema`。这一过程尤为简单：

```javascript
function BaseSchema(){
    mongoose.Schema.apply(this, arguments);
}
```

## 基类模型代码

这里给出完整的`BaseSchema`声明，由于[mongoose.Schema][schema]只有两个参数因此
我们用`call`来更方便地完成任务。

```javascript
// file: models/base.js
const _ = require('lodash');
const mongoose = require('mongoose');
const util = require('util');

const defaultOptions = ;
function BaseSchema(properties, options) {
    properties = _.defaults(properties, {
        // Base Properties
        createdBy: {
            type: String,
            ref: 'User'
        },
        updatedBy: {
            type: String,
            ref: 'User'
        },
        deletedBy: {
            type: String,
            ref: 'User'
        }
    });
    options = _.defaults(options, {
        // Base Options
            timestamps: true
        });

    mongoose.Schema.call(this, properties, options);

    // Base Plugins and Virtuals
    this.plugin(...);
    this.virtual('...');
}
util.inherits(BaseSchema, mongoose.Schema);
module.exports = BaseSchema;
```

## 子类模型代码

```javascript
// models/user.js
const BaseSchema = require('./base.js');

var UserSchema = new BaseSchema({
    name: String,
    role: {
        type: String,
        default: 'user',
        enum: ['admin', 'user']
    }
    }, {
        autoIndex: false
    });
// User Plugins
UserSchema.plugin(...);
module.exports = mongoose.model('User', UserSchema);
```

[semantic-diff]: https://github.com/nodejs/node/issues/4179
[schema]: http://mongoosejs.com/docs/api.html#schema_Schema
