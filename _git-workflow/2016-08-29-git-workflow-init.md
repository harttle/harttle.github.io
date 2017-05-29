---
title: 仓库初始化
tags: Git Github
---

Git已经成为当今版本控制工具的主流，而分布式的结构和日志型的存储让Git不那么容易理解。
本文以实际的案例，总结了仓库初始化的操作步骤以及涉及到的Git命令。

<!--more-->

## 从既有远程仓库建立

**场景**：加入一个项目，或创建一个项目副本。

**步骤**：远程仓库已经存在的情况下，直接克隆即可得到一个仓库副本。

```bash
git clone git@foo.com:bar.git
cd bar/
```

## 从空的远程仓库建立

**场景**：初始化一个远程仓库，例如建立一个Github仓库后。

**步骤**：新建目录并将其初始化为Git仓库，然后添加远程仓库到`remote`。

```bash
mkdir bar && cd bar
git init --bare
git remote add origin git@foo.com:bar.git
touch README.md
git add README.md && git commit -m 'init'
# 初次Push需指定远程分支
git push -u origin master
```

