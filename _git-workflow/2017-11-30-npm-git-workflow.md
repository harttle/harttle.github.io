---
title: 基于 Git/npm 的开发流程实践
tags: Git Github NPM 测试 编译 版本
---

如果说 SVN 改变了人们同步代码的方式，那么 Git 改变了人们写代码的方式。
在 [Harttle](/) 看来 Git 基于 commit 的管理机制让开发者可以管理每一份代码变更，
而分支、合并、衍合等 Git 操作则使得这些变更可以随意拼接，
甚至可以把昨天的一个改动拼接到今天的改动之后。

这透露了 Git 对开发过程是有观点的，而非仅仅是同步代码。要遵循这些观点才能用得顺手，
比如明确地细分每个特性（Commit）、组织这些特性所在的线条（Branch）、合入功能或版本（Merge）。
本文以开发一个 NPM 的包的场景来介绍如何高效地使用 Git。

<!--more-->

# 项目初始化

`npm init` 会根据当前目录、Git 等信息来生成 [package.json][package.json]。
因此建议先建立目录和 Git，再初始化 `package.json`：

```bash
mkdir hello-world
git init
git remote add origin xxx
npm init
```

都搞定后目录结构会是这样的：

```
hello-world/
  - .git/
  - package.json
```

> 关于初始化 Git 的细节可以看这里 [仓库初始化](/2016/08/29/git-workflow-init.html)

# 合入协作分支

典型地主干分支（master）往往用来保存当前的稳定版本。
由于主流的 Github CI 都不会阻止 Push，主干分支的合入建议通过 PR 的方式，
这样可以在合入前检查代码风格和测试覆盖等情况。
即便如此，Harttle 下面介绍如何完美地把代码合入到一个协作分支，仍然以合入主干为例。

多人协作分支的合入和分支最好保持线性，这样方便 cherrypick 以及回滚。尤其是用来发布代码的分支。
为了做到这一点需要每次合入时 rebase 到最新的 origin/master（毕竟开发总是并行的）。
先获取最新的变化：

```bash
git fetch origin
```

让本地的所有 commit 基于最新的代码重新演绎一次：

```bash
git rebase origin/master
```

这时可能有东西坏了，因为你写代码时是基于旧代码的。
所以要重新跑测试、风格检查等 pre-commit 要做的事情，比如：

```bash
npm lint
npm test
```

一切 OK 后就可以 `git push origin master` 了。
是的，我承认正确地使用 Git 协作需要掌握很多的分支操作命令。
但我们相信这些命令是在帮我们更好地协作，不是么？

> 在这里整理了 [分支管理](/2016/09/02/git-workflow-branch.html) 的一些常见操作。

# 如何同步上游

PR 是 Github 协作的重要环节，也是很多 Git 工具链的基础。通过发送 PR 而不是直接合入，
可以通过 CI 工具发现测试情况、代码风格情况等。
更重要的是通过 PR 使你的代码在合入前经过 Review。

在 Fork + PR 的开发模式中，最重要的问题是如何同步两个仓库。
Harttle 建议所有特性都在本地的分支上进行，从分支向上游 master 提 PR。
从而保持本地 master 与上游 master 的同步。首先获取上游改动：

```bash
git remote add upstream <your upstream git url>
git fetch upstream
```

更多远程仓库的操作参考 [远程仓库](/2016/09/05/git-workflow-remote.html) 一文。
然后将上游改动同步到本地 master：

```bash
git checkout master
git reset --hard upstream/master # 注意本地 master 的所有改动（提交过的，未提交过的）将会消失
```

需要的话，rebase 或 merge 你正在开发的分支：

```bash
git checkout feature-xxx
git rebase master
git push origin feature-xxx
```

现在就可以从你仓库的 `feature-xxx` 分支向上游仓库的 master 发 PR 了。

# 版本发布

[NPM 仓库][npm] 中会保存每个版本的软件，但我们希望能够方便地查看每个版本对应的源码。
还希望 Github 的 [Release 页面][release] 与 npm 保持同步。
这些统统可以使用 [npm version][version] 机制来完成。

`npm version patch` 即可升级一个小版本，相应地还有 `minor` 和 `major`。
文档：<https://docs.npmjs.com/cli/version>

与此同时 `npm version` 自动会打一个 Git Tag（例如 `v2.0.2`），
这个 Tag 会被 Github 识别并产生一个 Release 版本，例如：
<https://github.com/harttle/liquidjs/releases/tag/v2.0.2>
有了 Tag 之后还可以方便地查看 npm 版本之间的 Diff：

```bash
git log v2.0.1..v2.0.2
```

> 注意需要 `git push --tags` 才能 Push Tag 到远端仓库，我们可以把它加到 `postversion` 脚本中。

# 发版脚本

类似地，编译构建、单元测试等流程都可以加到 `preversion` 脚本中，这样单元测试挂了就会终止发布。
一个 `package.json` 例子如下：

```json
{
  "name": "hello-world",
  "author": "harttle<harttle@harttle.com>"
  "scripts": {
    "test": "mocha",
    "dist": "gulp dist",
    "preversion": "npm test",
    "version": "npm run dist && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

在 [Liquidjs][liquidjs] 项目 Harttle 就是使用 npm version 来发布版本的。
配置文件在此： <https://github.com/harttle/liquidjs/blob/master/package.json>

[package.json]: https://docs.npmjs.com/files/package.json
[npm]: https://npmjs.com
[release]: https://github.com/harttle/liquidjs/releases
[version]: https://docs.npmjs.com/cli/version
[liquidjs]: https://github.com/harttle/liquidjs
