---
title: 如何编写 Commit Message
tags: Git 重构
---

在 [基于 Git/npm 的开发流程实践](/2017/11/30/npm-git-workflow.html) 中提到，
Git 所做的不仅仅是同步文件，它更是一种编写和组织代码的方式。
我们知道 Commit Message 是每次 [提交代码][commit] 时的附加信息，
为什么 Harttle 觉得 Commit Message 是一个问题呢？

设想这样一个场景：你发现一个最近上的功能有 Bug，
现在要马上回滚到上那个功能之前。但当你打开 [git log][log] 时看到了这样一幅场景：

![git log](/assets/img/blog/git/commit-message@2x.png)

<!--more-->

# 一个失败案例

不难想象当你埋头改了一天的代码后，突然 Git 让你填写 Commit Message。头脑一片空白。
于是出现了这些常见的 Commit 信息：

```
fix
fix bugs
bug 修改
by harttle
```

这些信息有的说修复了bug，有的说更改了文件，有的说作者是谁，但它们有一个共同点：
完全没提到底改了些啥。上面描述的是一个很常见很合理的场景，但不难看到这里的问题：

1. 写代码 **没有目标**。埋头写，最后不知做了些啥。
2. 写代码 **没有计划**。没有把一个大的功能切分成多次独立的变更。

维护者很难从这样难以描述的一坨代码中抽取（比如 cherrypick）有用的变更，
合入后也很难从中剔除某个不需要的（或有缺陷的）变更。
没有意义的 Message 在之后的维护和 Review 中也很难了解这个人（或这次提交）到底做了什么。
下文集中地介绍如何编写有用的 Commit Message。

# 描述变更

**Commit Message 是用来描述变更的，不要说废话**。
尤其不要填写改了哪些文件，作者是谁，这些 Git 会自动记录并关联。
只需要填写做了哪些变化，比如是 fix，还是 feature，还是 update 等等。
先举坏的例子：

```
change: 为在线活动做准备
fix: 昨晚的线上 Bug
refactor: Harttle 的挫代码
```

Commit Message 写成下面的方式一定会更有用：

```
change: support backup database
fix: cache invalidation for message list
refactor: account related models
```

# 统一的格式

一致的格式会带来很多好处，比如便于阅读和自动化（比如自动生成 Changelog），
就像我们 [使用一致的代码风格][vim-lint] 一样。
**Commit Message 的格式可以自行选择，重点是较为统一的格式**，下面是最普通的一种：

```
Fix: account page scroll in iOS browsers
Feature: profile page
Feature: user login/logout
Feature: user registration
Refactor: user service & model
```

甚至有人用统一的 Emoji 来标识每个 Commit Message，也有相当多的 Commit Message 生成软件。
此外，如果写中文会让你的团队更舒服，完全可以用中文的消息。

# 注意上下文

有没有发现没有上下文时完全听不懂别人说话，Commit Message 也是一样的。
你在刚刚完成编写代码时，按照当时的上下文编写的 Commit Message 别人可能完全无法理解。
例如：

```
Fix: 不能打开的 Bug
```

不必别人，一周后可能你也忘了是什么不能打开。因此编写 Commit Message 时，
**不要假设任何上下文，试图从你当前的上下文跳出来**。比如：

```
Fix: 账户设置页面无数据内容
```

# 解释和例子

对于复杂的 Commit，尤其是新机制或者重构 Commit，建议增加一些描述以便理解。
在一些大型的在线协作项目中，这种 Commit 会很常见。比如这个
来自 [linux 项目][linux] 的一个最近的提交（[1bcab125][commit-eg]），它不仅列出了具体的改动，还描述了解决的问题。

```
afs: Fix permit refcounting
Fix four refcount bugs in afs_cache_permit():

 (1) When checking the result of the kzalloc(), we can't just return, but
     must put 'permits'.

 (2) We shouldn't put permits immediately after hashing a new permit as we
     need to keep the pointer stable so that we can check to see if
     vnode->permit_cache has changed before we decide whether to assign to
     it.

 (3) 'permits' is being put twice.

 (4) We need to put either the replacement or the thing replaced after the
     assignment to vnode->permit_cache.

Without this, lots of the following are seen:

  Kernel BUG at ffffffffa039857b [verbose debug info unavailable]
  ------------[ cut here ]------------
  Kernel BUG at ffffffffa039858a [verbose debug info unavailable]
  ------------[ cut here ]------------

The addresses are in the .text..refcount section of the kafs.ko module.
Following the relocation records for the __ex_table section shows one to be
due to the decrement in afs_put_permits() and the other to be key_get() in
afs_cache_permit().
```

> 如果你使用 `git commit -m` 是很难输入这么多字的，需要为 Git 设置编辑器。参考 [Git Workflow - 代码提交][commit] 一文。

[vim-lint]: /2017/03/12/vim-eslint.html
[commit]: /2016/09/01/git-workflow-commit.html
[log]: /2016/09/06/git-workflow-log.html
[linux]: https://github.com/torvalds/linux/commit/1bcab12521d9b23dbaa22ac71184778dcc43e2f6
[commit-eg]: https://github.com/torvalds/linux/commit/1bcab12521d9b23dbaa22ac71184778dcc43e2f6
