---
title: 远程仓库
tags: Git Github
---

Git已经成为当今版本控制工具的主流，而分布式的结构和日志型的存储让Git不那么容易理解。
Git的一个分支相当于一个commit节点的命名指针。分支之间可互相merge。
本文以实际的案例，总结了Git远程仓库的操作步骤以及涉及到的Git命令。

<!--more-->

## 显示远程仓库

**场景**：需要查看远程仓库地址（比如想把它拷贝给别人）。

**步骤**：使用`git remote`相关命令。

```bash
# 查看所有远程仓库
git remote -v
# 查看一个远程仓库（比如origin）的详细信息（包括Fetch、Push地址）
git remote show origin
# -n 参数禁止联系远程仓库，可大大加快速度
git remote show origin -n
```

## 管理远程仓库

**场景**：需要添加、更改或删除远程仓库时。例如远程仓库从Github迁移到Coding.net时需要更改远程仓库URL（不需重新clone）。

**步骤**：使用`git remote`系列命令操作。

```bash
# 添加远程仓库bar.git并命名为bar
git remote add bar bar.git
# 更改远程仓库URL
git remote set-url origin new.xxx.git
```

> 更多命令请查询`git remote --help`

## 同步远程仓库

**场景**：将远程仓库同步到本地，或将本地仓库同步到远程。

**步骤**：使用`git fetch`和`git push`系列命令。

**文档**：<https://git-scm.com/docs/git-push>

```bash
# 同步默认的remote仓库（通常叫origin）到本地
# 工作区文件并不会发生改变，只同步仓库内容，即`.git/`目录
git fetch
# 同步所有remote仓库到本地
git fetch --all
```

## 多个远程仓库

**场景**：一个本地仓库需要与多个远程仓库同步，或需要merge其他远程仓库时。
例如Github Pages博客同时Push到Github和Coding.net。

**步骤**：逐个添加远程仓库到`remote`，逐一Push。

```bash
# 将coding仓库添加到remote
git remote add coding git@coding.net:bar.git
# 将master分支Push到origin的master分支
git push origin master
# 将master分支Push到coding的coding-pages分支
git push coding master:coding-pages
```

## checkout一个远程分支

**场景**：现有一个本地仓库不存在的远程分支，希望让当前工作区进入这个分支。

**步骤**：可以先同步本地仓库，再切换到该分支。也可以先切换到该分支再同步远程代码。

```bash
# 方法一：同步本地仓库
git fetch
# 切换到远程分支
git checkout feature-x

# 方法二：切换到新的分支
git checkout -b feature-x
git branch --set-upstream remote/feature-x
# 等效于
git branch -u remote/feature-x
git pull

# 方法三：先创建分支以及track关系，再切换分支
git branch feature-x
git branch -u remote/feature-x feature-x
git checkout feature-x
git pull
```

## 删除远程分支

**场景**：不小心把一个分支名Push上去了，需要在远程删除一个分支。

**步骤**：直接push，添加--delete参数即可。

**文档**：<https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E8%BF%9C%E7%A8%8B%E5%88%86%E6%94%AF>

```bash
# 删除远程origin上的serverfix分支
git push origin --delete serverfix
```

## 删除远程Tag

**场景**：Tag命名错误，或者需要统一命名风格。

**步骤**：在本地删除Tag，然后Push到服务器。

```bash
git tag -d some-tag
git push origin :refs/tags/some-tags
```

## Push 到不同的分支

**场景**：同样的改动出现在本地和远程的不同分支，例如远程分支只用来部署时。

**步骤**：Push到远程时，指定本地分支与对应的远程分支。

```bash
git push origin branch-with-changes:another-branch
```
