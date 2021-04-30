---
title: 寻找并删除 Git 记录中的大文件
tags: Shell Git Github awk grep
---

最近发现 [HarttleLand 的 Git 仓库][harttle-git] 已经达到了 142M，严重影响 Fork 和 Clone。
今晨 Harttle 从 Git 记录中定位了数百个大文件并将其删除，现在仓库恢复了 27M 的大小。
借此机会，本文来介绍查找和重写 Git 记录的命令：`git rev-list`, `git filter-branch`。
本文用于学习用途，生产环境请考虑使用 [bfg][bfg] 等效率工具（感谢 oott123 的评论）。

<!--more-->

首先通过 `rev-list` 来找到仓库记录中的大文件：

```bash
git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -5 | awk '{print$1}')"
```

然后通过 `filter-branch` 来重写这些大文件涉及到的所有提交（重写历史记录）：

```bash
git filter-branch -f --prune-empty --index-filter 'git rm -rf --cached --ignore-unmatch your-file-name' --tag-name-filter cat -- --all
```

## Git 仓库的存储方式

> 如果你熟知 Git 的存储方式，跳过此节。

Git 仓库位于项目根目录的 `.git` 文件夹，其中保存了从仓库建立（`git init`）以来所有的代码增删。
每一个提交（Commit）相当于一个 Patch 应用在之前的项目上，借此一个项目可以回到任何一次提交时的文件状态。

于是在 Git 中删除一个文件时，Git 只是记录了该删除操作，该记录作为一个 Patch 存储在 `.git` 中。
删除前的文件仍然在 Git 仓库中保存着。直接删除文件并提交起不到给 Git 仓库瘦身的效果。

在 Git 仓库彻底删除一个文件只有一种办法：重写（Rewrite）涉及该文件的所有提交。
幸运的是借助 `git filter-branch` 便可以重写历史提交，当然这也是 Git 中最危险的操作。
可以说比 `rm -rf *` 危险一万倍。

## 从所有提交中删除一个文件

我清楚地记得曾提交过名为 `recent-badge.psd` 的文件。这是一个很大的 PhotoShop 文件，我要把它删掉。
`filter-branch` 命令可以用来重写 Git 仓库中的提交， 
利用 `filter-branch` 的 `--index-filter` 参数便能把它从所有 Git 提交中删除。

```
$ git filter-branch -f --prune-empty --index-filter 'git rm -rf --cached --ignore-unmatch assets/img/recent-badge.psd' --tag-name-filter cat -- --all
Rewrite 2771f50d45a0293668a30af77983d87886441640 (264/982)rm 'assets/img/recent-badge.psd'
Rewrite 1a98ecb3f39e1f200e31754714eec18bc92848ce (265/982)rm 'assets/img/recent-badge.psd'
Rewrite d4e61cfb1d88187b0561d283e663b81b738df2c7 (270/982)rm 'assets/img/recent-badge.psd'
Rewrite 4ba0df06b26cf86fd39c2cda6b012c521cbc4dc1 (271/982)rm 'assets/img/recent-badge.psd'
Rewrite 242ae98060c77863f5e826ba7e1ec47
```

`--index-filter` 参数用来指定一条 Bash 命令，然后 Git 会检出（checkout）所有的提交，
执行该命令，然后重新提交。我们在提交前移除了 `recent-badge.psd` 文件，
这个文件便从 Git 的所有记录中完全消失了。

> `--all` 参数告诉 Git 我们需要重写所有分支（或引用）。

## 寻找大文件的 ID

删掉了 `recent-badge.psd` 后我仍不满足，我要找到所有的大文件，并把它删掉。
`verify-pack` 命令用来验证 Git 打包的归档文件，我们用它来找到那些大文件。
例如：

```
$ git verify-pack -v .git/objects/pack/*.idx
8fa15d279de33ce28a3289fd33951374084231e4 tree   135 137 144088922
a44a50b2ffb1f8283c8e64aafb8e7628249d7453 tree   33 43 144089059
b57d99f38fe22491e4a2d30c2b081ecb7bbb329c tree   99 97 144089102
2d4ffaffc11758d561ea1a6d57dd8ee17ee1d836 blob   644952 644959 144089199
8cf81ebfeec409f19e7a47a76517317f3bfa268d blob   695898 695871 144734158
...
```

> `-v`（verbose）参数是打印详细信息。

输出的第一列是文件 ID，第二列表示文件（blob）或目录（tree），第三列是文件大小。
现在得到了所有的文件 ID 及其大小，需要写一点 Bash 了！

先按照第三列排序，并取最大的 5 条，然后打印出每项的第一列（这一列是文件 ID）：

```
$ git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -10 | awk '{print$1}'
f846f156d16f74243b67e3dabec58a3128744352 
4a1546e732b2e2a352b7bf220c1a22ad859abf89 
f72d04efe6d0b41b067f9fbbc62455f28d3670d2 
49bdf300ddf57d1946bc9c6570d94a38ac9d6a50 
9c073d4177af5d2e43ada41f92efb18d9462a536
```

现在变得到了最大的 5 个文件的 ID，而我需要文件名才能用 `filter-branch` 移除它。
我现在需要文件 ID 和文件名的映射关系。

## 文件名与 ID 映射

`rev-list` 命令用来列出 Git 仓库中的提交，我们用它来列出所有提交中涉及的文件名及其 ID。
该命令可以指定只显示某个引用（或分支）的上下游的提交。例如：

```bash
git rev-list foo bar ^baz
```

将会列出所有从 `foo` 和 `bar` 可到达，但从 `baz` 不可到达的提交。我们将会用到 `rev-list` 的两个参数：

* `--objects`：列出该提交涉及的所有文件 ID。
* `--all`：所有分支的提交，相当于指定了位于 `/refs` 下的所有引用。

我们看看这条命令的输出：

```
$ git rev-list --objects --all
c252878ac09a3979a80520b82a71dc2dae4529f9
7bc7d05c6097063f531580ba4c32921464a6c456 _drafts
dcce26ed53fbb869dc7d5b71742d2f9e523bfe42 _layouts
414186c794a0d58695abb75c548bdbfec1de2763 _layouts/default.html
1934eeffe3d242375510dff28cffa6de6b3de367 _layouts/post.html
5f14647875f2177a6d37b8bfbcdb4629af595b64 _posts
6cdbb293d453ced07e6a07e0aa6e580e6a5538f4 _posts/2013-10-12-2.md
...
```

现在就得到了文件名（如 `_posts/2013-10-12-2.md`）和 ID（如 `6cdbb293d453ced07e6a07e0aa6e580e6a5538f4 `）的映射关系。

## 得到文件名列表

前面我们通过 `rev-list` 得到了文件名-ID 的对应关系，通过 `verify-pack` 得到了最大的 5 个文件 ID。
用后者筛选前者便能得到最大的 5 个文件的文件名：

```
$ git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -5 | awk '{print$1}')"
f846f156d16f74243b67e3dabec58a3128744352 assets/img/recent-badge.psd
4a1546e732b2e2a352b7bf220c1a22ad859abf89 assets/img/album/me/IMG_0276.JPG
f72d04efe6d0b41b067f9fbbc62455f28d3670d2 assets/img/album/me/IMG_0389.JPG
49bdf300ddf57d1946bc9c6570d94a38ac9d6a50 assets/img/album/me/IMG_0813.JPG
9c073d4177af5d2e43ada41f92efb18d9462a536 assets/img/album/me/IMG_0891.JPG
```

先把上面输出存到 `large-files.txt` 中。还记得吗？`--tree-filter` 参数中我们需要给出一行的文件名列表。上述列表我们需要处理一下：

```
$ cat large-files.txt| awk '{print $2}' | tr '\n' ' '
assets/img/recent-badge.psd assets/img/album/me/IMG_0276.JPG assets/img/album/me/IMG_0389.JPG assets/img/album/me/IMG_0813.JPG assets/img/album/me/IMG_0891.JPG
```

现在便得到了一行的文件列表。把它存到 `large-files-inline.txt` 中。

## 删除所有大文件

现在得到了要删除的大文件列表 `large-files-inline.txt`，把它传入到 `--tree-filter` 中即可：

```bash
git filter-branch -f --prune-empty --index-filter "git rm -rf --cached --ignore-unmatch `cat large-files-inline.txt`" --tag-name-filter cat -- --all
```

> 注意这里 `--index-filter` 的参数要用双引号，因为 `cat large-files-inline.txt` 还需要 Bash 的解析。

至此已经干掉了那些大文件，来看看瘦身了多少吧！
注意 `filter-branch` 之后 `.git` 目录下会有大量的备份。
需要克隆一份当前仓库来看效果：

```bash
git clone --no-hardlinks file:///Users/harttle/harttle.land /tmp/harttle.land
```

仓库大小变为 25.76M 了！从原来的 142M！

> 也可以进入项目目录通过 `du -d 1 -h` 查看磁盘占用的大小。

当然到此为止我们更改的都是本地仓库，现在把这些改变 Push 到远程仓库中去！

```bash
git push origin --force --all
```

> 因为不是 fast forward，所以需要指定 `--force` 参数。

这里的 `--all` 会将所有分支都推送到 `origin` 上。当然你也可以只推送 `master` 分支：
`git push origin master --force`。但是！如果其它远程分支有那些大文件提交的话，仍然没有瘦身！

## 参考阅读

* [http://naleid.com/blog/2012/01/17/finding-and-purging-big-files-from-git-history](http://naleid.com/blog/2012/01/17/finding-and-purging-big-files-from-git-history)
* [http://stackoverflow.com/questions/6403601/purging-file-from-git-repo-failed-unable-to-create-new-backup](http://stackoverflow.com/questions/6403601/purging-file-from-git-repo-failed-unable-to-create-new-backup)
* [http://dalibornasevic.com/posts/2-permanently-remove-files-and-folders-from-git-repo](http://dalibornasevic.com/posts/2-permanently-remove-files-and-folders-from-git-repo)
* [https://git-scm.com/book/zh/v1/Git-内部原理-Git-References](https://git-scm.com/book/zh/v1/Git-内部原理-Git-References)

[harttle-git]: https://github.com/harttle/harttle.github.io
[bfg]: https://rtyley.github.io/bfg-repo-cleaner/
