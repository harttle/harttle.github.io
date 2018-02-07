---
title: 分支管理
tags: Git Github
---

Git已经成为当今版本控制工具的主流，而分布式的结构和日志型的存储让Git不那么容易理解。
Git的一个分支相当于一个commit节点的命名指针。分支之间可互相merge。
本文以实际的案例，总结了Git分支管理的操作步骤以及涉及到的Git命令。

<!--more-->

## 查看分支

**场景**：查看当前位于哪个分支，以及本地和远程各有什么分支。

**步骤**：使用`git branch`系列命令。

```bash
# 查看本地分支
git branch 
# 查看所有分支
git branch -a
```

## 分支增删

**场景**：删除某个分支，分支只是Commit的指针，删除分支不会影响Git中的Commit树。

**步骤**：使用`git branch -D`命令。

```bash
# 创建一个名为`test`的分支并切换到该分支：
git checkout -b test
# 切换回`master`分支：
git checkout master
# 删除`test`分支：
git branch -D test
# 从远程仓库删除
git push --delete origin test
```

## 分支重命名

**场景**：分支名写错了，或者找到了更合适的分支名。可能也会需要更改服务器上的分支名。

**步骤**：使用`git branch -m`重命名，`git push --set-upstream`来重新映射track关系（以及将新分支Push到远程）。

```bash
# 在本地仓库重命名
git branch -m old_branch new_branch
# 在远程删除旧分支
git push origin :old_branch
# 新分支Push到远程
git push --set-upstream origin new_branch
```

如果要重命名的是当前分支，可以直接`git branch -m new_branch`。

## 分支合并

**场景**：需要将某个分支合并到`master`，或任意两个分支间希望合并。

**步骤**：使用`git merge`系列命令，merge成功会产生一次commit。

**文档**：<https://git-scm.com/docs/git-merge>

```bash
# 将feature-1分支合并到当前分支
git merge feature-1 -m 'merge feature 1'
```

> 注意merge前必须commit工作区的更改，否则merge后无法回到当前工作区的状态。

## 查看分支图

**场景**：需要了解当前分支的父分支，或者仓库中分支之间的关系。

**步骤**：使用`git log`系列命令。

```bash
# --graph 画图，--decorate 标明分支名（而不只是ID）
git log --graph --decorate
```

## 冲突解决

**场景**：你的commit修改了某个文件，希望merge另一个commit。然而你们修改了同一文件的同一行。

**步骤**：1. 先解决冲突，打开Git提示有冲突的每个文件（其中有Git给出的冲突信息），更改文件内容为你想要的最终内容并删除Git的冲突信息。2. `git add`相应的冲突文件。3. `git commit`本次合并。

```bash
# 假设合并发生了冲突，文件a.txt
git merge feature-2
# 修改冲突的文件
vim a.txt
# 添加到暂存区
git add a.txt
# 提交本次合并
git commit -a 'merged feature 2'
```

## 新建 Tag

**场景**：新建某个Tag。

**步骤**：使用`-a`（annotated），`-d`（delete）参数运行`git tag`，最后更新到远程仓库。

```bash
# 创建
git tag -a v1.4 -m 'my version 1.4'
# Push 到远程
git push --tags
```

## 删除

**场景**：有一个错误的Tag。

**步骤**：先在本地仓库删除，然后 push 到远程仓库。

```bash
git tag -d old
git push origin :refs/tags/old
```

## 重命名Tag

**场景**：当然是Tag名字起错了。

**步骤**：先从旧的Tag创建新的，删除Tag，push到远程。

```bash
git tag new old
git tag -d old
git push origin :refs/tags/old
git push --tags
```

## 列出所有Tag

**场景**：需要列出所有Tag。

**步骤**：`git tag`即可。

```bash
# 列出所有
git tag
# 同时列出message
git tag -n
# 过滤
git tag -l 'v1.2.*'
```

## 列出Tag之间的Commit日志

**场景**：需要知道版本之间有哪些改动，以生成Chnagelog或ReleaseNote。

**步骤**：查询Git日志，使用`..`来选择一段区间。

```bash
git log v1.1..v1.2
```

## 衍合

**场景**：开发者从主分支（`master`）checkout一个分支（如`feature-x`）进行开发，
当要合并入主分支时发现主分支已经改变。
仓库维护者合并`feature-x`到`master`时需要解决冲突并回归测试。
为了减少维护者的工作，开发者可以将`feature-x` Rebase（衍合）到`master`。
这样在`master`合并`feature-x`就是Fast Forward了。

**步骤**：切换到`feature-x`，进行衍合，Push代码。

**文档**：<https://git-scm.com/book/zh/v1/Git-%E5%88%86%E6%94%AF-%E5%88%86%E6%94%AF%E7%9A%84%E8%A1%8D%E5%90%88>

```bash
git checkout feature-x
git rebase master
git push origin feature-x
```

## 重置分支指针

**场景**：当前的工作（可以包括若干commit，也可以只是工作区）不想要了，或者希望将的当前工作弄到别的分支。
需要恢复当前分支到之前的某个状态。

**步骤**：如果要保存当前工作，首先commit掉并从当前分支checkout出来。
然后`git reset`当前分支到某个历史状态（通过`git log`可以看到当前分支的所有历史状态）。

**文档**：<https://git-scm.com/docs/git-reset>

```bash
# 保存当前工作到 current-work 分支
git commit -m 'current work'
git checkout current-work
# 重置当前分支指针
git reset --hard xxxxx
# 典型地，重置到远程分支
git reset --hard origin/master
```

> 当我找[睿智的罗总][ricky]请教这个问题时，罗总淡然地答道：『这样啊，你XXX，YYY，ZZZ』
> 于是我就懂了。

[log-fs]: /2014/01/03/morden-os-fs.html
[purge-in-git]: /2016/03/22/purge-large-files-in-gitrepo.html
[ricky]: http://www.tianmaying.com/user/luoruici
