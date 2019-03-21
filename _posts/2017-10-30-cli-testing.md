---
title: CLI 测试：文件与标准输出
tags: BDD Mocha Node.js 测试 Ramdisk
---

在 [利用 Mocha 进行 BDD 风格测试](/2016/06/23/mocha-chai-bdd.html) 中介绍了
Node.js 下如何做单元测试，要确保软件的质量我们还需要 e2e 测试，
确保整个系统在真实场景下能够正常工作。

> End-to-end testing involves ensuring that the integrated components of an application function as expected. The entire application is tested in a real-world scenario such as communicating with the database, network, hardware and other applications. -- [techopedia][techopedia]

本文 Node.js 的命令行程序（CLI）为例，介绍如何测试一个可执行程序的输入输出以及文件修改。
样例代码可参考 [APM 的 e2e 测试代码][apm]。

<!--more-->

## 输入输出

测试一个 cli 程序的输入输出很容易，几乎不需要借助任何工具。
使用内置的 `child_process` 模块就足够了：

```javascript
import {exec} from 'child_process'

it('should print author', function (done) {
  exec('./bin/cli --author',
    (err, stdout, stderr) => err ? done(err) : expect(stdout).to.equal('https://harttle.land')
  )
})
```

如果希望注入环境变量，修改要执行的命令即可：

```javascript
exec('PORT=8080 ./bin/cli --start')
```

为了测试代码更加可读，可以引入 `chai-as-promise`。上述测试项可以重写为：

```javascript
import Promise from 'bluebird'

it('should print author', function () {
  var p = Promise.fromCallback(cb => exec('./bin/cli --author', cb))
  return expect(p).to.eventually.equal('https://harttle.land')
})
```

> 更多细节请参考：[Mocha 下测试异步代码](/2016/07/12/async-test-with-chai-as-promised.html) 一文。

## 文件系统

在单元测试中，我们可以 [修改内置的 `fs` 模块][mock-fs] 达到测试的目的。
其实文件并没有真正被读写，只是测试了调用读写的逻辑是否正确。
但 e2e 测试中命令行程序在不同的进程启动，无法修改其中的 `fs` 模块。
当然你可以 `require` 进来去执行，但那就不是 e2e 测试了。

在此 [Harttle](https://harttle.land) 介绍两种方式来初始化用于测试的工作区。

### 临时目录

如果文件读写较少，可以在测试开始前初始化一个临时目录，测试完成时删除。
使用 [fs-extra][fs-extra] 会让这个工作变得非常简单：

```javascript
import fs from 'fs-extra'
import os from 'os'

beforeEach(() => fs.emptyDir(os.tmpdir() + '/test'))
```

### Ramdisk

也可以把一部分内存挂载到文件系统，有大量文件读写时比较快，同时可以保护 SSD（是这样吗？）。
Node 下有一个不错的 [node-ramdisk][ramdisk] 工具来创建内存虚拟磁盘。

```javascript
const ramdisk = require('node-ramdisk')
var mountpoint
var disk

before(done => {
  disk = ramdisk(this.dirname)
  disk.create(10, function (err, mount) { // 创建 10MB 的虚拟磁盘
    mountpoint = mount
  })
})
after(done => disk.delete(mountpoint, cb))
```

创建 ramdisk 系统调用比较耗时，建议在 `before()` 时完成，`beforeEach()` 时清空目录。
此外，因为设备根目录存在权限较高的隐藏文件，建议在 `mountpoint` 下创建一个子目录来进行测试。

## 网络

在单元测试中可以使用 [Sinon fakeXHR][fakeXHR] 或 [nock][nock] 来 Mock 掉 http 模块，
但 e2e 测试中则需要启动真实的服务器。

```javascript
var server

before(done => {
  server = http.createServer(requestHandler)
  server.listen(8080, done))
})

after(done => server.close(done))

function requestHandler (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('ok')
}
```

由于不同机器的环境可能不同，端口应该在置默认值的同时读取环境变量。
如果只需要静态文件服务，可以直接引入 [http-server][http-server] 模块。

[mock-fs]: /2016/08/01/javascript-mock-fs.html
[techopedia]: https://www.techopedia.com/definition/7035/end-to-end-test
[apm]: https://github.com/apmjs/apmjs/tree/master/test/e2e
[fs-extra]: https://github.com/jprichardson/node-fs-extra
[ramdisk]: https://www.npmjs.com/package/node-ramdisk
[fakeXHR]: http://sinonjs.org/releases/v4.0.2/fake-xhr-and-server/
[nock]: https://github.com/node-nock/nock
[http-server]: https://github.com/indexzero/http-server
