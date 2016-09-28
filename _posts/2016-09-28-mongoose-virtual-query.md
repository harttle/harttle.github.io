---
title: Mongoose 中实现虚拟字段查询
tags: MongoDB mongoose Schema
---

[mongoose][mongoose]为数据模型提供了虚拟属性，
借此可以更加一致地、方便地读写模型属性，类似于C#或Java中的访问器。
我们知道虚拟属性在Query阶段一定是查不到的，因为事实上MongoDB并没有存储这些属性。
但是否可以通过一个拦截器来实现虚拟属性的查询呢？

这个问题很有趣，而且在很多场景下都相当方便。例如：

* 实现一个暴力的全文检索时，需要对多个字段匹配统一查询词，该查询词可抽象为虚拟属性；
* 多处都需要进行同一个复杂条件的查询时，可以用虚拟属性封装该查询条件。

事实上，虚拟属性查询和虚拟属性读写都是为了代码复用。

<!--more-->

# Mongoose 中的 Hook

Mongoose Schema几乎所有静态方法和对象方法都添加了
[`.pre`][schema-pre]和[`.post`][schema-post]钩子。
这些钩子其实就是函数钩子，采用[hooks-js][hooks-js]的实现。
来自官网的例子：

```javascript
var hooks = require('hooks')
  , Document = require('./path/to/some/document/constructor');
// Add hooks' methods: `hook`, `pre`, and `post`
for (var k in hooks) {
  Document[k] = hooks[k];
}
// Define a new method that is able to invoke pre and post middleware
Document.hook('save', Document.prototype.save);

// 上述代码在mongoose中实现
/////////////////////////////////////////////////////////////////////
// 下面的代码则是mongoose提供的Hook API

// Define a middleware function to be invoked before 'save'
Document.pre('save', function validate(next) {
    // ...
});
```

在`Document.save()`被调用时，上述`validate`函数就会被回调。

# 添加查询钩子

Mongoose没有对[hooks-js][hooks-js]进一步封装，这意味着我们不能对所有Query方法设置钩子，
只能一一枚举需要监视的方法。当然，这不影响我们进行代码复用。

```javascript
// 设置 findOne 和 find 钩子
CompanySchema.pre('findOne', preFind).pre('find', preFind);
```

接下来便着手实现`preFind`函数。

# 实现虚拟查询

在钩子（`preFind`）中，我们可以更改查询条件借此实现虚拟查询。
值得注意的是，完全可控的Query意味着我们可以实现任何形式的虚拟查询。
例如全文检索：

```javascript
function preFind() {
    var word = this.getQuery().word;
    if(word === undefined) return;

    // 从真实的Query中删掉虚拟属性
    delete this._conditions.word;
    // 构造正则表达式
    var regex = new RegExp(word);
    // 全文检索
    this.where({ $or: [{ title: regex }, { content: regex }, { author: regex }] });
}
```

[hooks-js]: https://github.com/bnoguchi/hooks-js
[schema-pre]: http://mongoosejs.com/docs/api.html#schema_Schema-pre
[schema-post]: http://mongoosejs.com/docs/api.html#schema_Schema-post
[mongoose]: http://mongoosejs.com/docs/
