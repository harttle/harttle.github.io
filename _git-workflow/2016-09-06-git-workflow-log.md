---
title: 日志与回滚
tags: Git Github
---

Git已经成为当今版本控制工具的主流，而分布式的结构和日志型的存储让Git不那么容易理解。
本文以实际的案例，总结了日志相关的操作步骤以及涉及到的Git命令。

<!--more-->

## 提交记录

**场景**：希望查看仓库的中所有提交的信息，比如提交人、提交时间、代码增删、Commit ID等。

**步骤**：通过`git status`和`git log`可查询这些信息。

```bash
# 查看Git提交的元信息
git log
# 查看Git提交，以及对应的代码增删
git log -p
# 查看app.js的Git提交日志
git log -p app.js
```

## Git Blame

**场景**：查看每一行代码的最后改动时间，以及提交人。例如，追溯`app.js`文件中某一行是被谁改坏的。

**步骤**：通过`git blame`来查询。

```bash
git blame app.js
```

> 更多参数请查询`git blame --help`

## 检出历史版本

**场景**：希望将当前项目回到某个历史版本。例如：希望从某个历史版本建立分支时。

**步骤**：`git checkout`

```bash
# 检出到某个commit，可通过git log得到Commit ID
git checkout 5304f1bd...b4d4
# 检出到某个分支或Tag
git checkout gh-pages
```

> 原则上讲Git历史是不允许更改的，这方面Git很像
> [日志结构的文件系统][log-fs]（Log-Structured File Systems）。
> 但也有办法可以更改日志，例如：[寻找并删除Git记录中的大文件][purge-in-git]

[log-fs]: /2014/01/03/morden-os-fs.html
[purge-in-git]: /2016/03/22/purge-large-files-in-gitrepo.html

