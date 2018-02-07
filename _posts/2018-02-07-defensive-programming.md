---
title: 适当地引入防卫性编程
tags: JavaScript 封装 接口 重构 弱类型
---

> Anything that can go wrong will go wrong. -- Edward Murphy

**防卫性编程（Defensive Programming）** 是指限制对程序的不可预见的使用，增加软件的安全性。
防卫性编程在程序鲁棒性、可维护性上都有帮助，尤其是在你不幸地选择弱类型语言编写源码时。

在 C++ STL 程序设计中，我们称函数模板和类模板为 [隐式接口][cpp-41]，这些接口描述了编译期多态。
在 JavaScript 中，接受一个对象时也不需要声明其类型，只有后续对它的使用方式描述了它的接口。
[Harttle](/) 把 JavaScript 中的这一现象称为 **隐式接口**。

**隐式接口调试困难**。顾名思义隐式接口是无法使用工具检查的，因此只能依赖运行时调试。
那么当 `page.controller` 为空时，抛出的错误会包含有用信息吗？

```javascript
function init(page) {
    page.controller();
}
```

具体的错误消息取决于你的JavaScript引擎，可能是 "page.controller is not a function"，
可能是 "undefined is not a function"。
如果是 uglify 后的代码，那就更难定位问题了。

**隐式接口容错困难**。因为接受的对象没有类型保证，但我们可以进行容错。
思路很简单：为了避免被调用接口为空，我们事先判断它。

```javascript
function init(page) {
    page && page.view && page.view.start && page.view.start()
    page && page.controller && page.controller.start && page.controller.start()
}
```

这样的 Duck Test 其实在 JavaScript 中随处可见，然而这样正确性就不明显了：

* 如果 `view.controller` 为空，应该吞掉这个错误吗？假设我们都认为随处吞掉错误是很烂的实践。
* 即使 `view.start` 存在，那么它是一个 `function` 么？
* 即使 `view.start` 是一个 `function`，那么它是想要的那个 `function` 么？

**隐式接口重构困难**。因为没有限制接受的输入范围，可能会有很多作者预期之外的使用方式，
这些使用方式会让重构变得困难，例如：

我们有一个发送 HTTP 请求的接口，我们只想让它发送 POST/PUT 请求，
并对这两种请求做了特殊处理，比如加了时间戳或者安全性封装等等：

```javascript
function writeRequest(url, method) {
    let req = construct(url, method)
    return req.send()
}
```

有一天可能需要对 POST 和 PUT 做单独的逻辑，我们把它重构成如下形式：

```javascript
function writeRequest(url, method) {
    let req
    if (method === 'POST') {
        req = construct(url, 'POST')
        // do some thing here ...
    } else {
        // WHAT IF method != 'PUT' ?
        req = construct(url, 'PUT')
    }
    req.send()
}
```

在 ELSE 分支中，如果 `method !== "PUT"` 怎么办？一搜代码库，发现真有地方 `method` 就是 `GET`。
重构前的代码无意中支持了 `GET`？！
现在如果不再支持 GET 则会不兼容地挂掉客户代码，
如果转向支持 GET 则会与设计初衷，甚至函数名 `writeRequest` 相违背。

> 这里虽然是取值范围引起的重构困难，而根据定义，数据的取值范围就是类型（比如把它做成一个枚举类型就可以等价）。

在 JavaScript 中我们确实无法编译期检查类型（甚至没有编译阶段），
你可以选择类似 TypeScript 之类的语言。或者在设计接口时引入 **防卫性编程的思想**：

1. 确定可接受的输入范围
2. 在入口处检查这一范围是否得到了满足
3. 对所有输入都产出符合预期的输出（行为/返回值），最好再配一项测试

例如：

```javascript
function writeRequest(url, method) {
    assert(url, 'cannot POST to malformed url')
    assert(/^POST|PUT$/.test(method), `method not supported: ${method}`)

    let req = construct(url, method)
    return req.send()
}
```

这样上文中提到的隐式接口的各种问题都可以得到不同程度的解决：

* 调试困难。现在可以抛出具有足够信息的错误，便于调试。上述例子中 `assert` 的第二个参数可以极尽详细地描述错误。
* 容错困难。实现应满足一切合法输入，不再需要在实现的过程中进行容错，减少容错也让正确性更加明显。
* 重构困难。防卫性的接口描述可以做到足够清晰，接口描述不再影响重构。上述例子中，只需要继续支持 `POST`, `PUT` 即可保持接口的向后兼容。

[cpp-41]: /2015/09/08/effective-cpp-41.html
