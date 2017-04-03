---
title: Shell 中的变量作用域
tags: Shell 进程 作用域
---

# TL;DR

Shell 中的变量只作用于当前进程。如需在子进程中创建副本可使用 `export` 内建命令。
有时使用临时变量语法可以非常方便。

<!--more-->

# 变量使用

* 任何地方都可以**定义** Shell 变量，使用 `=` 分隔变量名和变量值。`=` 前后不可出现空格，但变量的值可以留空。
* **读取**变量需要添加`$`前缀。
* 变量作用域为当前进程。

例如：

```bash
url=http://harttle.com
echo $url
```

# export 到子进程

通常变量是不需要 `export` 的，但是当你需要把一个工作分割成若个小的任务，
分别用一个脚本来实现的时候，就需要把变量名传递给它们。
比如有一个 `spider.sh` 来获下载任意 URL 到临时目录：

```bash
#!/usr/bin/env bash
curl $url > $TMPDIR/$RANDOM.html
```

我们需要将当前脚本中的 `url` 传递给`spider.sh`：

```bash
export url=http://harttle.com
bash ./spider.sh
# 等价于（如果该文件有可执行权限的话）
./spider.sh
```

值得注意的是`export`只会在子进程中创建变量的副本，即`spider.sh`对它的改动不会体现在当前进程。

# 在当前进程执行脚本

使用 [`source`][source] 或 `.` 内建命令可以在当前进程执行另一个脚本，因此当前上下文的变量对该脚本是可见的。

```bash
url=http://harttle.com

source ./spider.sh
# 等价于
. ./spider.sh
```

# 临时设置环境变量

根据 Shell 语法，在一个简单命令前可以包含任意个赋值语句。这些变量赋值将会在执行命令前展开，等效于临时的环境变量。

> A "simple command" is a sequence of optional variable assignments and redirections, in any sequence, optionally followed by words and redirections, terminated by a control operator. -- [Simple Commands][sc], Shell Commands

例如下面命令可以把`url`变量传递给`spider.sh`：

```bash
url=http://harttle.com bash ./spider.sh
```

这是一条 [简单命令][sc]，下面的多条命令或 [组合命令][cc]：

```bash
url=http://harttle.com; bash ./spider.sh         # 两条命令，只作用于当前进程
url=http://harttle.com && bash ./spider.sh       # 组合命令，只作用于当前进程
export url=http://harttle.com; bash ./spider.sh  # 两条命令，作用于父子进程
```

简单命令中的变量赋值也不作用于当前进程。例如下面的代码将会输出空行：

```bash
url=http://harttle.com echo $url
```

[sc]: http://pubs.opengroup.org/onlinepubs/009695399/utilities/xcu_chap02.html#tag_02_09_01
[cc]: http://pubs.opengroup.org/onlinepubs/009695399/utilities/xcu_chap02.html#tag_02_09_04
[source]: /2015/05/17/linux-cmd.html
