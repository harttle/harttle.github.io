---
title: Electron 中的 IPC
tags: Github IPC Node.js 事件 Electron
---

[Electron][electron]是 Github 为了打造一款纯 JavaScript 开发的代码编辑器而编写的 
JavaScript 跨平台桌面应用框架。
Electron 中的 Node.js 是一个后台进程的运行时（注意不是 Web 服务器），
使用 Chromium （其实是[libchromiumcontent][libchromiumcontent]库）作为用户接口。
碉堡了有木有！

其中后台进程（Main Process）与渲染进程（Render Process）
之间的通信便需要借助于 Electron 提供的 IPC 机制
（该机制需要跨平台，可能是通过[libuv][libuv]这样的跨平台 IO 库实现的）。
在这样的架构中 IPC API 会在开发中经常用到，本文介绍这些 API 的使用场景。

<!--more-->

# 通信模型

Electron IPC 提供基于事件的 API，在渲染进程和后台进程中都可以向对方发送事件。
也可以在事件处理函数中通过发送新的事件来回复向对方。

* 通过`EventEmitter`实例向对方发送事件。
* 发送事件需要指定对方句柄，不支持全局广播。
* 支持同步事件来获得同步的返回值。

# 发送与回复

[`IPCRender`][ipcrender]是渲染进程中的 [`EventEmitter`][event-emitter] 实例，通过它可以像后台进程发送事件。
比如发送一个`create`事件并传递一个字符串参数`"harttle"`：

```javascript
// 后台进程
const {ipcMain} = require('electron')
ipcMain.on('create', (event, person) => {
  console.log('creating', person)    // 输出："creating harttle"
  event.sender.send('born', person)
});

// 渲染进程
const {ipcRenderer} = require('electron')
ipcRenderer.on('born', (event, person) => {
  console.log(person, 'born')       // 输出 "harttle born"
});
ipcRenderer.send('create', 'harttle')
```

在收到事件时，可以通过[`event.sender`][event.sender]来得到对方[`webContents`][web-content]并回复消息。
此外，[`webContents.send`][webContents.send]接受任意个参数，这些都会被依次传递给处理函数。

# 同步事件

事件也可以同步回复，可以通过[`sendSync`][ipcrender-sendsync]方法来做到：

```javascript
ipcMain.on('create-sync', (event, arg) => {
  console.log(arg)      // prints "harttle"
  event.returnValue = 'created'
});
console.log(ipcRenderer.sendSync('create-sync', 'harttle')) // 输出 "created"
```

虽然 Electron 提供了此类 API，使用时仍然需要注意同步 IPC 会阻塞当前进程。

# 指定窗口

因为[BrowserWindow][browser-window]都是由后台进程创建的，后台进程是可以把窗口都记录下来的。
此后便可以向每个窗口发送事件。

```javascript
var win = new BrowserWindow();
win.webContents.send('born', 'harttle');
```

# 寻找窗口

如果没有窗口的实例，可以通过[`BrowserWindow.getFocusedWindow()`][browser-window]获取焦点窗口：

```JavaScript
var focusedWindow = BrowserWindow.getFocusedWindow();
focusedWindow.webContents.send('born', 'harttle');
```

也可以通过[webContents][web-content]来获取焦点窗口`webContents`：


```javascript
var focusedWindowContents = webContents.getFocusedWebContents()
focusedWindowContents.send('born', 'harttle');
```

> 甚至可以通过`webContents.getAllWebContents()`API 来获得对所有窗口进行事件广播。

[ipcrender]: http://electron.atom.io/docs/api/ipc-renderer/
[web-content]: https://github.com/electron/electron/blob/master/docs/api/web-contents.md
[browser-window]: https://github.com/electron/electron/blob/master/docs/api/browser-window.md
[electron]: http://electron.atom.io/
[libuv]: https://github.com/libuv/libuv
[libchromiumcontent]: https://github.com/brightray/libchromiumcontent
[event.sender]: http://electron.atom.io/docs/api/ipc-main/#eventsender
[webContents.send]: http://electron.atom.io/docs/api/web-contents#webcontentssendchannel-arg1-arg2-
[ipcrender-sendsync]: http://electron.atom.io/docs/api/ipc-renderer/#ipcrenderersendsyncchannel-arg1-arg2-
[event-emitter]: https://nodejs.org/api/events.html#events_class_eventemitter
