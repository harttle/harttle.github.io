---
title: 安全地回滚远程分支
tags: Git Github
---

在 Git 中使用 [reset][branch] 可以让当前分支回滚（[reset][branch]）到任何一个历史版本，
直接移除那以后的所有提交。但这更改了 Git 的历史，Git 服务通常会禁止这样做。
这便需要一个更安全的方式将代码状态回到历史版本，同时不更改 Git 历史。

> 所谓 **保护分支**，就是指不允许改写 Git 历史的分支。在 Github 中对应的选项是 **Force Pushes**，该选项默认处于 Disallow 状态。

<!--more-->

# 找到历史版本

首先，通过 [git log][log] 确认你要回滚到的版本的 commit hash。
例如，我们有 4 个版本其中后两个是坏的，要回滚到 version 2，它对应的 commit hash 就是 `4a50c9f`：

```
* d4ccf59 (HEAD -> master) version 4 (harttle screwed it up, again)
* 5b7d48e version 3 (harttle screwed it up)
* 4a50c9f version 2
* 491c6e0 version 1
```

# 签出历史版本

为了便于操作，我们给这个版本一个分支名，比如 `v2`：

```bash
git checkout -b v2 4a50c9f
```

现在就已经位于 `v2` 分支啦，当前的 Git 记录如下，比上一步只是多了一个分支名：

```
* d4ccf59 (master) version 4 (harttle screwed it up, again)
* 5b7d48e version 3 (harttle screwed it up)
* 4a50c9f (HEAD -> v2) version 2
* 491c6e0 version 1
```

# 假合并 master

为了不更改 Git 记录，我们只能生成一个新的 Commit 让代码状态回到 v2。
这意味着必须在 version 4 的基础上进行，思路和手动操作无异。
但我们可以通过一个神奇的合并操作自动完成：

```bash
git merge -s ours master
```

`-s <strategy>` 用来指定合并策略，ours 是递归合并策略的一种，即直接使用当前分支的代码。
`-s ours` 合并的结果是产生了一个基于 master 的 Commit，但 **HEAD 中的代码与合并前完全相同**。
从 Git 记录可以看到 version 2 和 version 4 进行了合并：

```
*   94fa8a7 (HEAD -> v2) Merge branch 'master' into v2
|\
| * d4ccf59 (master) version 4 (harttle screwed it up, again)
| * 5b7d48e version 3 (harttle screwed it up)
|/
* 4a50c9f version 2
* 491c6e0 version 1
```

但合并中完全采用了 version 2 的代码，即合并前后 diff 为空：

```bash
git diff HEAD..4a50c9f
```

至此我们已经产生了一个 **代码状态与历史版本完全一致，但基于 master 的一个 Commit**。

# push 到远程

在产生可用的 Commit 后，可以从当前分支 v2 直接发往 origin/master：

```bash
git push origin master
# 等价于
git push origin v2:master
# 等价于
git push origin HEAD:master
```

更详细的远程仓库操作可以参考 [远程仓库](/2016/09/05/git-workflow-remote.html) 一文。

[branch]: /2016/09/02/git-workflow-branch.html
[log]: /2016/09/06/git-workflow-log.html
