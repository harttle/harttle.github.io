---
title: JavaScript 中常见的反模式
tags: AMD JavaScript 注释 重构 模块化 全局变量 设计模式
---

[反模式][anti] 是指对反复出现的设计问题的常见的无力而低效的设计模式，俗话说就是重蹈覆辙。
这篇文章描述了 JavaScript 中常见的一些反模式，以及避免它们的办法。

> 本文中的例子都是根据真实故事改编。

<!--more-->

## 硬编码

**硬编码**（Hard-Coding）的字符串、数字、日期…… 所有能写死的东西都会被人写死。
这是一个妇孺皆知的反模式，同时也是最广泛使用的反模式。
硬编码中最为典型的大概是 **平台相关代码**（Platform-Related），
这是指特定的机器或环境下才可以正常运行的代码，
可能是只在你的机器上可以运行，也可能是只在 Windows 下可以运行。

例如在 npm script 中写死脚本路径 `/Users/harttle/bin/fis3`，
原因可能是安装一次非常困难，可能是为了避免重复安装，也可能仅仅是因为这样好使。
不管怎样，这会让所有同事来找你问“为什么我这里会报错”。
解决办法就是把它放到依赖管理，如果有特定的版本要求可以使用 [package-lock][lock]，如果实在搞不定可以视为外部依赖可以放到本地配置文件并从版本控制（比如 Git） 移除。

例如在 cli 工具中写死特殊文件夹 `/tmp`, `~/.cache`，或者路径分隔符 `\\` 或 `/`。
这类字符串一般可以通过 Node.js 内置模块（或其他运行时 API）来得到，
比如使用 `os.homedir`, `os.tmpdir`, `path.sep` 等。

## 重复代码

**重复代码**（Duplication）在业务代码中尤为常见，初衷几乎都是维护业务的稳定性。
举个例子：在页面 A 中需要一个漂亮的搜索框，而页面 B 中恰好有一个。
这时程序员小哥面临一个艰难的选择（如果直接拷贝还会有些许感到不安的话）：

1. 把 B 拷贝一份，改成 A 想要的样子。
2. 把 B 中的搜索框重构到 C，B 和 A 引用这份代码。

由于时间紧迫希望早点下班，或者由于改坏 B 需要承担责任
（PM：让你做 A 为啥 B 坏了？回答这个问题比较复杂，这里先跳过），
经过一番思考后决定采取方案 2。

至此整个故事进行地很自然也很顺利，这大概就是重复代码被广泛使用的原因。
这个故事中有几点需要质疑：

1. B 这么容易被改坏，说明 B 的作者 **并未考虑复用**。这时不应复用 B 的代码，除非决定接手维护它。
2. B 改坏的责任不止程序员小哥：B 的作者是否有 **编写测试**，测试人员是否 **回归测试** B 页面？
3. 时间紧迫不必然导致反模式的出现，不可作为说服自己的原因。短期方案也存在优雅实现。

解决办法就是：抽取 B 的代码重新开发形成搜索框组件 C，在 A 页面使用它。
同时提供给日后的小伙伴使用，包括敦促 B 的作者也迁移到 C 统一维护。

## 假 AMD

模块化本意是指把软件的各功能分离到独立的模块中，每个模块包含完整的一个细分功能。
在 JavaScript 中则是特指把脚本切分为独立上下文的，可复用的代码单元。

由于 JavaScript 最初作为页面脚本，存在很多引用全局作用域的语法，以及不少基于全局变量的实践方式。
比如 jQuery 的 `$`, BOM 提供的 `window`，省略 `var` 来定义变量等。
[AMD][amd] 是 JavaScript 社区较早的模块化规范。这是一个君子协定，问题就出在这里。
有无数种方式写出假的 AMD 模块：

* **没有返回值**。对，要的就是副作用。
* define 后直接 require。对，要的就是立即执行。
* **产生副作用**。修改 window 或其他共享变量，比如其他模块的静态属性。
* 并发问题。依赖关系不明容易引发并发问题。

全局副作用的影响完全等同于全局变量，几乎有全局变量的所有缺点：
执行逻辑不容易理解；隐式的耦合关系；编写测试困难。下面来一个具体的例子：

```javascript
// file: login.js
define('login', function () {
    fetch('/account/login').then(x => {
        window.login = true
    })
})
require(['login'])
```

这个 AMD 模块与直接写在一个 `<script>` 并无区别，准确地说是更不可控（requirejs 实现是异步的）。
也无法被其他模块使用（比如要实现注销后再次登录），因为它没返回任何接口。
此外这个模块存在并发问题（Race Condition）：使用 `window.login` 判断是否登录不靠谱。

解决办法就是把它抽象为模块，由外部来控制它的执行并获得登录结果。
在一个模块化良好的项目中，所有状态最终由 APP 入口产生，
模块间共享的状态都被抽取到最近的公共上级。

```javascript
define(function () {
    return fetch('/account/login')
    .then(() => true)
    .catch(e => {
        console.error(e)
        return false
    }
})
```

## 注释膨胀

注释的初衷是让读者更好的理解代码意图，但实践中可能恰好相反。直接举一个生活中的例子：

```javascript
// 判断手机百度版本大于 15
if (navigator.userAgent.match(/Chrome:(\d+))[1] < 15) {
    // ...
}
```

哈哈当你读到这一段时，相信上述注释已经成功地消耗了你的时间。
如果你第一次看到这样的注释可能会不可思议，但真实的项目中多数注释都是这个状态。
因为维护代码不一定总是记得维护注释，况且维护代码的通常不止一人。
C 语言课程的后遗症不止变量命名，“常写注释”也是一个很坏的教导。

解决办法就是用清晰的逻辑来代替注释，
在 [谨慎使用代码注释](/2016/10/08/code-comments.html) 一文中已经很详细了，这里不再赘述。
上述例子重新编写后的代码如下：

```javascript
if (isHttpsSupported()) {
    // 通过函数抽取 + 命名，避免了添加注释
}
function isHttpsSupported() {
    return navigator.userAgent.match(/Chrome:(\d+))[1] < 15
}
```

## 函数体膨胀

“通常”认为函数体膨胀和全局变量都是算法课的后遗症。
但复杂的业务和算法的场景确实不同，前者有更多的概念和操作需要解释和整理。
整理业务逻辑最有效的手段莫过于变量命名和方法抽取（当然，还要有相应的闭包或对象）。

但在真实的业务维护中，保持理性并不容易。
**当你几十次进入同一个文件添加业务逻辑后**，你的函数一定会像懒婆娘的裹脚布一样又臭又长：

```javascript
function submitForm() {
    var username = $('form input#username').val()
    if (username === 'harttle') {
        username =  'God'
    } else {
        username = 'Mortal'
        if ($('form input#words').val().indexOf('harttle')) {
            username = 'prophet'
        }
    }
    $('form input#username').val(username)
    $('form').submit()
}
```

这只是用来示例，十几行还远远没有达到“又臭又长”的地步。
但已经可以看到各种目的的修改让 `submitForm()` 的职责远不止提交一个表单。
一个可能的重构方案是这样的：

```javascript
function submitForm() {
    normalize()
    $('form').submit()
}
function normalize() {
    var username = parseUsername(
        $('form input#username').val(),
        $('form input#words').val()
    )
    $('form input#username').val(username)
}
function parseUsername(username, words)
    if (username === 'harttle') {
        return 'God'
    }
    return words.indexOf('harttle') ? 'prophet' : 'Mortal'
}
```

在重构后的版本中，我们把原始输入解析、数据归一化等操作分离到了不同的函数，
这些抽离不仅让 `submitForm()` 更容易理解，也让进一步扩展业务更为方便。
比如在 `normalize()` 方法中对 `input#password` 字段也进行检查，
比如新增一个 `parseWords()` 方法对 `input#words` 字段进行解析等等。

## 总结

常见的反模式还有许多，比如 `==` 和 `!=` 的使用；扩展原生对象；还有
[Promise 相关的](/2017/06/27/promise-anti-patterns.html) 等等。

> `==` 要提一下。这是语言的设计缺陷通常使用 Lint 工具来避免使用。与其他 Lint 错误不同的是一旦开始大面积使用后续改正十分困难（因为与 `===` 确实不等价）。因此强烈建议项目初始化时就添加 Lint。

这些反模式的流行背后都存在很有说服力的原因，
但反模式对可维护性和软件的长期发展有着更为严重的影响。
按照 [技术债务][tech-dept] 的说法，
每次选择捷径都会产生隐含的代价，而这些代价在将来的某一时刻总要偿还。
那些推迟的重构不仅会影响下一次变更，而且会像经济债务一样持续地叠加利息。

虽然不存在一种具体的考核方法来计算债务大小，
但可以肯定的是如果你能熟练使用 Harttle 博客中总结的各种反模式，
一定能达到每次代码提交债务大于收益的境界。

[tech-dept]: https://en.wikipedia.org/wiki/Technical_debt
[anti]: https://en.wikipedia.org/wiki/Anti-pattern
[lock]: https://docs.npmjs.com/files/package-lock.json
[amd]: http://requirejs.org/docs/whyamd.html
