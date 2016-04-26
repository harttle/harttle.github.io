---
layout: blog
title: 跟踪Github项目的持续集成状态
tags: 持续集成 Github NPM Mocha
---

不知从什么时候开始，Github项目的`README`中到处都能看到绿色的小徽章。
通过这些徽章可以获知项目的最新版本号、构建状态、测试覆盖率，
以及依赖软件包的过期情况。请看这个[Brick.JS][brick]项目的首页：

![brick.js](/assets/img/blog/brick.jpg)

项目标题Brick.JS下是一排徽章，它们分别表示着：
该项目在npm的最新版本是2.0.2，构建和测试状态是通过（还可能是failing），
测试程序的覆盖率为92%，该项目的依赖软件包都处于最新状态。
每次Push一些提交到Github仓库，测试和构建都会自动执行，这些徽章都会更新。

<!--more-->

这些是怎么做到的呢？本文便来详述这些依托于Github的持续集成工具。
就以上图的项目为例。

# NPM Version

[![NPM version](https://img.shields.io/npm/v/brick.js.svg?style=flat)](https://www.npmjs.org/package/brick.js)

多数Github上的JavaScript都会在[NPM][npm]上发布对应的软件包来方便使用。
先上代码！在[README.md][brick-readme]中是这样写的：

```markdown
[![NPM version](https://img.shields.io/npm/v/brick.js.svg?style=flat)](https://www.npmjs.org/package/brick.js)
```

首先最外层是一个超链接，链接到该项目的NPM地址：<https://www.npmjs.org/package/brick.js>

内层是一个图片，图片源为：<https://img.shields.io/npm/v/brick.js.svg?style=flat>。
很显然该图片是Shields.IO提供的，其实它的功能远远不止于此，请看：
<http://shields.io/>，还包括下载统计、Issue统计、社会化、License、技术债务等等。

# Travis CI

[![Build Status](https://travis-ci.org/brick-js/brick.js.svg?branch=master)](https://travis-ci.org/brick-js/brick.js)

```markdown
[![Build Status](https://travis-ci.org/brick-js/brick.js.svg?branch=master)](https://travis-ci.org/brick-js/brick.js)
```

构建状态徽章是由Travis CI提供的：

> [Travis CI][travis]是一个在线的分布式持续集成服务，用来构建及测试在GitHub托管的代码。
> 这个软件的代码同时也是开源的，可以在GitHub上下载到。 -- Wikipedia

直接使用这个图标会显示`build:unknown`，需要去[travis.ci][travis]开通服务。
打开<https://travis-ci.org/>，允许Github仓库的访问权限即可。
此后每次Push到Github，Travis都会自动运行构建，构建结果会发送到你的邮箱。

![travis mail](/assets/img/blog/travis-mail.png)

Travis CI需要一点配置，请参考：<https://docs.travis-ci.com/user/getting-started/>。
这是我的配置文件（Github仓库根目录下的`.travis.yml`）：

```yml
language: node_js
node_js:
  - "4"
before_script:
  - npm install -g mocha
```

下图是一次构建过程，可访问<https://travis-ci.org/brick-js/brick.js>来查看：

![travis-build](/assets/img/blog/travis.jpg)

**小技巧**

Github会对这些图标进行缓存这会导致这些徽章显示不正确，
可以改变一下URL使缓存失效，但同时不影响图片获取。
比如在`?branch=master`后面再加一个无用的参数`?branch=master&foo=bar`。

# Coveralls

[![Coverage Status](https://coveralls.io/repos/github/brick-js/brick.js/badge.svg?branch=master)](https://coveralls.io/github/brick-js/brick.js?branch=master)

```markdown
[![Coverage Status](https://coveralls.io/repos/github/brick-js/brick.js/badge.svg?branch=master)](https://coveralls.io/github/brick-js/brick.js?branch=master)
```

[Coveralls][coveralls]是测试覆盖工具，为代码质量提供信心！
它会计算测试覆盖率，包括语句覆盖率、行覆盖率、分支条件覆盖率、函数覆盖率等。
开源仓库是免费的！

和Travis CI一样需要去开通服务：<https://coveralls.io/>。
但Coveralls不会直接运行你的测试，需要你在测试完成后进行测试覆盖计算，
然后报告给Coveralls，别担心有工具！
如果你也是用`mocha`测试的，那么请按照下列流程：

1. 安装`coveralls`和`istanbul`：
    ```bash
    npm install --save-dev coveralls istanbul
    ```
2. 配置Travis CI：将测试覆盖报告给Coveralls

    ```yml
    language: node_js
    node_js:
      - "4"
    after_script: 
      - NODE_ENV=test ./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage
    ```

这是Coveralls的一次测试覆盖统计，可访问<https://coveralls.io/github/brick-js/brick.js?branch=master>来查看：

![coveralls status](/assets/img/blog/coveralls.jpg)

# David DM

NPM包往往会依赖于其他很多的包，当它们的维护状态发生改变时我们应当及时更新。
忽略这一点往往会造成技术债务，毕竟新版本已经发布了而你还在写老代码。

[David DM][david]提供了一个依赖管理徽章，可以把它放在项目README中时时提醒自己。
不需开通任何服务，David DM会直接去NPM下载并分析你的NPM包。

这是David DM对Brick.JS 2.0.2的依赖分析，可访问<https://david-dm.org/brick-js/brick.js>来查看：

![david dm status](/assets/img/blog/david.jpg)

[travis]: https://travis-ci.org/
[brick]: https://github.com/brick-js/brick.js
[brick-readme]: https://github.com/brick-js/brick.js/blob/master/README.md
[npm]: http://npmjs.org
[coveralls]: https://coveralls.io/
[david]: https://david-dm.org/
