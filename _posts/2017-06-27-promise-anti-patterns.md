---
title: 注意那些 Promise 反模式
tags: JavaScript Promise 异步 回调函数 设计模式
---

JavaScript 作为天生的客户端脚本，编写异步逻辑有着天然的优势，
比如嵌套函数（很自然的闭包机制），事件模型（多数宿主都有提供），回调函数（函数是一等公民）。
[Promise](/2016/08/10/promise.html) 用来更好地组织异步代码，
与其他设计模式类似，未能理解其设计意图之前容易误用和滥用。本文列举其中常见的反模式。

> 读者有更精彩的反模式例子，欢迎评论或者邮件。本文中的代码仅用于示例，未必存在这样的接口。

# 莫须有的嵌套

Promise 模式意在 Flatten 异步代码（参考 [Callback Hell][callbackhell]），
所以在你嵌套很深时就要反思了。

```javascript
// 反模式
Posts
.find({ author: 'harttle' })
.then(posts => {
    return posts.populate('comments')
    .then(posts => {
        render(posts)
        .then(html => res.end(html))
        .catch(err => res.status(500).end(err.message))
    })
    .catch(err => res.status(500).end(err.message))
})
.catch(err => res.status(500).end(err.message))

// 正常的写法
Posts
.find({ author: 'harttle' })
.then(posts => posts.populate('comments'))
.then(posts => render(posts))
.then(html => res.end(html))
.catch(err => res.status(500).end(err.message))
```

一般情况下 Promise 都不需要嵌套在另一个 Promise 中。
除非你需要多个 Promise 的解析值，这时可以使用 `.all()` API：

```javascript
Promise
.all([getPosts(), getComments()])
.spread((posts, comments) => {
    // 处理文章和评论
})
```

# Promisify 一个 Promise

用 Promise 封装一个已经是 Promise 的异步接口。比如：

```javascript
// 反模式
function getPosts() {
    return new Promise((resolve, reject) => {
        doGetPosts()
        .then(posts => resolve(posts))
        .catch(err => reject(err))
    })
}

// 正常的写法
function getPosts() {
    return doGetPosts()
}
```

这一写法虽然看起来不可思议，但写起来确实容易掉进去。
尤其是在一个 Promise 实现的系统（比如 [Bluebird][bluebird]）
中返回另一个 Promise 实现（比如 jQuery）的实例时。这时可以简单地用 `.resolve()` 来转换：

```javascript
var Promise = require('bluebird')
function getPosts() {
    return Promise.resolve($.get('http://harttle.com'))
}
```

# 随意吞掉错误

Promise 托管异步代码返回的同时也托管了异步错误。
不添加错误处理会吞掉错误，丢掉一个 Promise 的返回值也会直接吞掉错误。
这里要格外小心，消失的错误可能会要你一夜来找到它。比如：

```javascript
// 反模式
function commentToPost(postId) {
    Posts
    .findOne({ id: postId })
    .then(post => {
        // 如果这里出错了，任何人都不知道
        post.addComment("Great idea! but I dont't care", 'Alice')
    })
    .then(() => res.end('ok'))
    // 这里收不到 addComment 的错误
    .catch(err => res.status(500).end('wow'))
}

// 正常的写法
function commentToPost(postId) {
    Posts
    .findOne({ id: postId })
    .then(post => post.addComment("Great idea! but I dont't care", 'Alice'))
    .then(() => res.end('ok'))
    .catch(err => res.status(500).end('wow'))
}
```

幸好像 Eslint 这样的工具已经可以在你编写代码的同时检查出丢掉的 Promise 返回值。
对于 Eslint，Harttle 有 [一份很好的 Vim 配置][eslint-vim]。

# Promise 数组

在 for 循环中创建 Promise 会非常难以理解，许多 Promise 实现都为此提供了
`.map()`, `.reduce()` 等 API，好好利用它们！

```javascript
// 反模式
function getSites(authors) {
    return new Promise((resolve, reject) => {
        var sites = []
        for (var i=0; i<authors.length; i++) {
            Site
            .findOne({ author: authors[i] })
            .then(site => {
                sites.push(site)
                if (sites.length === authors.length) {
                    resolve(sites)
                }
            })
            .catch(err => reject(err))
        }
    })
}

// 正常的写法
function getSites(authors) {
    return Promise
    .resolve(authors)
    .map(author => Site.findOne({ author }))
    .catch(err => reject(err))
}
```

此外，有些 API 还提供了更精细的控制，比如 `.any()`, `.some()`, `.all()` 等。

> 为方便表达文中使用了大量的 Arrow Function，但 ES6 中更推荐使用 await/async 模式。

[bluebird]: https://www.npmjs.com/package/bluebird
[callbackhell]: http://callbackhell.com/
[eslint-vim]: /2017/03/12/vim-eslint.html
