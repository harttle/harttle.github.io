---
title: Shell的相关概念和配置方法
tags: Shell Bash GNU Linux SSH Unix crontab 操作系统
---

使用Linux的过程中少不了使用各种各样的Shell，
而根据启动环境的不同，Shell会读取不同的配置文件。
本文便来详细介绍这些不同名字的配置文件在何时会被Shell读取。

# 相关概念

## Shell（壳）

**Shell**(Unix Shell)是一种命令行解释器，是Unix操作系统下最传统的人机接口。
在Shell中，用户可以通过输入程序名称来执行某个程序，
最初计算机用户就是通过Shell来让计算机执行任务的。
今天在Linux和Mac中大量使用的Shell包括CSH，Bash，ZSH等。

第一个Unix Shell是贝尔实验室的Ken Thompson 写的sh，从1971年便开始使用了。
Ubuntu、RedHat等Linux发行版中默认的Shell是Bash（Bourne Shell），
作者是贝尔实验室的Stephen Bourne，因此得名。
Harttle在使用的是Z shell，这是一个非常现代的Shell，兼容于Bash。


<!--more-->

## Shell命令

Shell命令就是我们常说的Linux命令，这些命令可以分为两类：

* 一类是Shell Builtin，这和Shell类型有关。例如Bash中有`echo`, `pwd`等。
* 一类是`PATH`下的软件，比如`/usr/bin`下的`ls`, `mkdir`等。

**Shell编程**是一系列Shell（通常指Bash）命令写在一个文件中，以批量地去执行。
这个文件便是**Shell脚本**，其中包含了要被顺序执行的Shell命令。

这些Shell脚本一般命名为`*.sh`来表示通过Shell来执行。
Shell脚本第一行通常会包含当前脚本文件的解释器，比如`#!/usr/bin/bash`
是指用户执行该脚本时，用Bash来解释执行。

## Terminal（终端）

**Terminal**（终端）是指计算机的一台设备或一个软件，
它可以接受键盘输入传送给计算机，
并通过屏幕或打印机来显示计算机传送来的字符输出。
早期的终端就是一台打字机（teletypewritter，TTY），
因此TTY和Terminal是同义词。
至今Linux操作系统都会提供若干个TTY终端（按下Ctrl+Alt+F1即可进入）。

> 终端一词最初是指电缆末端的那台设备，是从电子学的角度上进行命名的。
> 在Linux术语中，TTY其实是一个扩展的流设备。

除了系统内核外，**Terminal Emulators**（终端模拟器）也可以提供Terminal，
这些由终端模拟器提供的Terminal通常称为**Pseudo-TTY**。
使用终端模拟器来提供Terminal主要是为了方便使用，通常一个终端模拟器可以打开多个终端。
比如X Windows系统中常用的[Xterm][xterm]，[GNU Screen][screen]，[SSH][ssh]，
GNome中的Terminal，KDE中的Konsole，Mac下常用的iTerm2等。这些软件都属于Terminal Emulator。

## Console（控制台）

**Console**（控制台）通常是指一台设备、一个软件或一个操作系统的Primary Terminal。
Console的叫法是从物理意义上来的，直接连在设备上的那个终端就叫Console。
比如Linux的TTY，Chrome的控制台，交换机的管理终端。

## Interactive Shell（交互式Shell）

交互式Shell与登录Shell是指某个Shell的运行状态，
每个操作系统中可能会运行多个Shell，这些Shell可能会处于下面的任何一种运行状态。

**Interactive Shell**（交互式Shell）是指可以让用户通过键盘进行交互的Shell。
我们在使用的CLI都是交互式Shell。

**Non-interactive Shell**（非交互式Shell）是指被自动执行的脚本，
通常不会请求用户输入，输出也一般会存储在日志文件中。
比如[用 Cron 定时任务更新壁纸][cron]一文中被`crontab`定时执行的脚本就运行在非交互式Shell中。

## Login Shell（登录Shell）

**Login Shell**（登录Shell）是指该Shell被运行时用于用户登录，比如TTY中的Shell就是以登录Shell的状态在运行。

**Non-login Shell**（非登录Shell）是指在用户已登录情况下启动的那些Shell。
被自动执行的Shell也属于非登录Shell，它们的执行通常与用户登录无关。

# 配置文件

Shell**配置文件**其实是一种特殊的Shell脚本，只不过没有用`.sh`来命名。
在Shell被启动时会选择性地执行配置文件中的Shell命令，
这些命令一般用于配置当前Shell下的工作环境，
通常包含一些别名（`alias`），`PATH`，编辑器（`EDITOR`）等配置。

## 读取顺序

Shell配置文件可以分为系统级别的配置文件和用户级别的配置文件。
任何一种Shell都有用户级别的配置文件，以及对应的系统级别的配置文件。

* 系统级别的配置文件位于`/etc`下，这些配置会应用于所有用户。例如`/etc/profile`，`/etc/bashrc`。
* 用户级别的配置文件位于用户目录`~`下，通常会加一个`.`来隐藏。例如`~/.profile`，`~/.bashrc`。

在Shell启动时，会首先执行系统级别的配置文件（如果存在的话），再执行用户级别的配置文件。也就是说`~/.bashrc`中的配置会覆盖`/etc/bashrc`中的配置。

## 登录Shell

有一些配置文件是只会被登录Shell读取的，包括：`.profile`，`.login`等。

* `.profile`是`/bin/sh`的配置文件。Bash兼容于sh，因此Bash作为登录Shell时也会读取`/etc/profile`和`~/.profile`（其实几乎所有Shell都会这样做）。
* `.login`是登录Shell在用户登录后读取的配置文件，csh、tcsh都会读取它。
* `.logout`是登录Shell在用户退出时读取的配置文件，csh、tcsh都会读取它。

每一种Shell在兼容上述配置文件的同时，也会有一些私有的配置文件。比如Bash：

* `.bash_profile`是Bash私有的登录Shell配置文件。
* `.bash_login`是Bash作为登录Shell，用户登录后读取的配置文件。
* `.bash_logout`是Bash作为登录Shell，用户退出时读取的配置文件。

比较特殊的是`.inputrc`，它是Readline的启动配置文件。Bash等众多Shell都用使用Readline来读取用户输入。该文件通常会定义键盘映射相关设置。

## 交互式Shell

有一些配置文件是只会被交互式Shell读取的，包括：`.zshrc`，`.bashrc`等。

其中`.bashrc`只会被交互式的、非登录Bash读取。
因此往往会在`.bash_profile`中调用`~/.bashrc`来让Bash作为登录Shell时也读取`~/.bashrc`：

```bash
[[ -r ~/.bashrc ]] && . ~/.bashrc
```

`.zshrc`会被任何交互式Z Shell读取，除非设置了`-f`参数。

C Shell, TCShell启动时却总是会去读取 `cshrc`, `.tcshrc`，无论当前Shell是否为交互式的、或者登录Shell。

# 参考阅读

* Unix Shell: <https://en.wikipedia.org/wiki/Unix_shell>
* Related Terms: <http://unix.stackexchange.com/questions/4126/what-is-the-exact-difference-between-a-terminal-a-shell-a-tty-and-a-con>
* Bash Startup Files: <http://www.linuxfromscratch.org/blfs/view/6.3/postlfs/profile.html>
* Unix-Frequently Asked Questions: <http://www.faqs.org/faqs/unix-faq/faq/part5/>

[xterm]: http://en.wikipedia.org/wiki/Xterm
[screen]: http://en.wikipedia.org/wiki/Gnu_screen
[ssh]: http://en.wikipedia.org/wiki/Secure_shell
[cron]: /2015/11/20/crontab-desktop.html
