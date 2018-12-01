---
layout: blog
title: Socket.IO 订阅 Redis Channel
tags: Node.js Redis Socket.IO NPM
---

在Node.js程序中，可以借助[Socket.IO][Socket.IO]来构建实时应用。
然而有时候后台与Socket.IO是异构的，比如Java、Python的Web后台。
这时可以利用[Redis][redis]的订阅/发布机制作为中转，连接异构的后台和Socket.IO服务。
本文介绍如何在Socket.IO中订阅Redis Channel。

> 至于如何在Java/Python/C#中发布消息到Redis Channel，请参照对应语言的Redis SDK。

<!--more-->

# 安装软件

1. [Redis][redis]。可以参照官网 <http://redis.io/> 来安装，在[这里][redis-down]可以下载。
2. [Node.js][node]。也可以在官网 <https://nodejs.org/> 直接下载。

然后创建一个文件夹作为Socket.IO服务器项目，在其中安装`Socket.IO`和Node.js的`redis`客户端。

```bash
npm install Socket.IO redis --save
```

# 简单的Socket.IO服务

创建`app.js`文件，写一个基于Node.js HTTP模块的Socket.IO服务器。
我们创建两个命名空间，一个`notification`，一个`chatting`。

```javascript
var server = require('http').createServer();
var io = require('Socket.IO')(server);
io
    .of('/notification')
    .on('connection', socket => {
        console.log('user connected to notification');
        socket.on('disconnect', () => console.log('user disconnected'));
    });

io
    .of('/chatting')
    .on('connection', socket => console.log('user connected to message'));

server.listen(3001, () => console.log('Socket.IO listen to port 3001'));
```

不同的浏览器端可以连接到不同的命名空间，例如连接到`notificaiton`：

```javascript
var socket = io('/notification');
socket.on('message', function (msg) {
    console.log(msg);
});
```

> 需要在HTML中引入`<script src="/path/to/Socket.IO.js"></script>`，见<http://Socket.IO/download/>。更多Socket.IO的例子，请参考： <http://Socket.IO/docs/#how-to-use>

# 订阅Redis Channel

在上述服务器文件中引入`redis`并创建一个客户端，可以收到所有频道的信息。
可以通过`switch-case`来分发各频道的消息。

```javascript
var redis = require('redis');
var redisClient = redis.createClient();
var NOTIFICATION_CHANNEL = 'notification_channel', CHATTING_CHANNEL = 'chatting_channel';

redisClient.on('message', function(channel, message) {
    switch (channle){
        case NOTIFICATION_CHANNEL:
            console.log('notification received:', message);
            io.of('/notification').emit('message', message);
            break;
        case CHATTING_CHANNEL:
            console.log('chatting received:', message);
            io.of('/chatting').emit('message', message);
            break;
    }
});
redisClient.subscribe(NOTIFICATION_CHANNEL);
redisClient.subscribe(CHATTING_CHANNEL);
```

在`redis.createClient()`的参数中可以设置Redis服务器的主机名、端口、密码等信息，
参见对应的[文档][npm-redis]。

# 测试执行

启动Socket.IO服务器：

```
$ node app.js
Socket.IO listen to port 3001
```

在命令行（Bash、Zsh...）中打开`redis-cli`，并发布一条消息：

```
$ redis-cli
127.0.0.1:6379> publish notification "love you!"
```

然后Socket.IO便会输出`notification received: love you!`，同时所有连接到`/message`命名空间的浏览器端也会收到消息并输出到控制台。

[npm-redis]: https://www.npmjs.com/package/redis
[Socket.IO]: http://Socket.IO/
[tmy]: http://www.tianmaying.com/
[redis-down]: http://redis.io/download
[redis]: http://redis.io/
[node]: https://nodejs.org/
