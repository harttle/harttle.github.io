---
title: 各种 Shell 的配置方法
tags: Shell Bash Linux Terminal
---

使用 Linux 的过程中少不了使用各种各样的 Shell，
而根据启动环境的不同，Shell 会读取不同的配置文件。
本文便来详细介绍这些不同名字的配置文件在何时会被 Shell 读取。

## 什么是 Shell

**Shell**(Unix Shell)是一种命令行解释器，是 Unix 操作系统下最传统的人机接口。
在 Shell 中，用户可以通过输入程序名称来执行某个程序，
最初计算机用户就是通过 Shell 来让计算机执行任务的。
今天在 Linux 和 Mac 中大量使用的 Shell 包括 CSH，Bash，ZSH 等。

第一个 Unix Shell 是贝尔实验室的 Ken Thompson 写的 sh，从 1971 年便开始使用了。
Ubuntu、RedHat 等 Linux 发行版中默认的 Shell 是 Bash（Bourne-Again Shell）。
Harttle 在使用的是 Z shell。

<!--more-->

## 什么是 Shell 命令

Shell 命令就是我们常说的 Linux 命令，这些命令可以分为两类：

* 一类是 Shell Builtin，这和 Shell 类型有关。例如 Bash 中有 `echo`, `pwd` 等。
* 一类是 `PATH` 下的软件，比如 `/usr/bin` 下的 `ls`, `mkdir` 等。

**Shell 编程** 是一系列 Shell（通常指 Bash）命令写在一个文件中，以批量地去执行。
这个文件便是 **Shell 脚本**，其中包含了要被顺序执行的 Shell 命令。

这些 Shell 脚本一般命名为 `*.sh` 来表示通过 Shell 来执行。
Shell 脚本第一行通常会包含当前脚本文件的解释器，比如 `#!/usr/bin/bash`
是指用户执行该脚本时，用 Bash 来解释执行。

## 什么是 Terminal

**Terminal**（终端）是指计算机的一台设备或一个软件，
它可以接受键盘输入传送给计算机，
并通过屏幕或打印机来显示计算机传送来的字符输出。
早期的终端就是一台打字机（teletypewritter，TTY），
因此 TTY 和 Terminal 是同义词。
至今 Linux 操作系统都会提供若干个 TTY 终端（按下 Ctrl+Alt+F1 即可进入）。

> 终端一词最初是指电缆末端的那台设备，是从电子学的角度上进行命名的。
> 在 Linux 术语中，TTY 其实是一个扩展的流设备。

除了系统内核外，**Terminal Emulators**（终端模拟器）也可以提供 Terminal，
这些由终端模拟器提供的 Terminal 通常称为 **Pseudo-TTY**。
使用终端模拟器来提供 Terminal 主要是为了方便使用，通常一个终端模拟器可以打开多个终端。
比如 X Windows 系统中常用的 [Xterm][xterm]，[GNU Screen][screen]，[SSH][ssh]，
GNome 中的 Terminal，KDE 中的 Konsole，Mac 下常用的 iTerm2 等。这些软件都属于 Terminal Emulator。

## 什么是 Console

**Console**（控制台）通常是指一台设备、一个软件或一个操作系统的 Primary Terminal。
Console 的叫法是从物理意义上来的，直接连在设备上的那个终端就叫 Console，每个设备通常只有一个 Console。
比如 Chrome 的控制台，交换机的管理终端。

## PTY, VT

在 /dev/tty{1-N} 可以看到 Linux 的 TTY 设备有多个。可以按下 Ctrl+Alt+数字 在不同的 TTY 之间切换。

它们都不是 Console 本身，其实准确地讲不叫 TTY。是为方便多用户使用而提供的虚拟设备，
叫做 [pseudotty](https://en.wikipedia.org/wiki/Pseudoterminal)（PTY），
也叫 [Virtual Terminal](https://en.wikipedia.org/wiki/Virtual_console)（VT），Virtual Console（VC）。

## 什么是交互式 Shell

Interactive Shell（交互式 Shell）与登录 Shell 都是指 Shell 所处的运行状态，
每个操作系统中可能会运行多个 Shell，这些 Shell 可能会处于下面的任何一种运行状态。

**Interactive Shell**（交互式 Shell）是指可以让用户通过键盘进行交互的 Shell。
我们在使用的 CLI 都是交互式 Shell。

**Non-interactive Shell**（非交互式 Shell）是指被自动执行的脚本，
通常不会请求用户输入，输出也一般会存储在日志文件中。
比如 [用 Cron 定时任务更新壁纸][cron] 一文中被 `crontab` 定时执行的脚本就运行在非交互式 Shell 中。

## 什么是登录 Shell

**Login Shell**（登录 Shell）是指该 Shell 被运行时用于用户登录，比如 TTY 中的 Shell 就是以登录 Shell 的状态在运行。

**Non-login Shell**（非登录 Shell）是指在用户已登录情况下启动的那些 Shell。
被自动执行的 Shell 也属于非登录 Shell，它们的执行通常与用户登录无关。

## Shell 配置文件

Shell **配置文件** 其实是一种特殊的 Shell 脚本，只不过没有用 `.sh` 来命名。
在 Shell 被启动时会选择性地执行配置文件中的 Shell 命令，
这些命令一般用于配置当前 Shell 下的工作环境，
通常包含一些别名（`alias`），`PATH`，编辑器（`EDITOR`）等配置。

Shell 配置文件可以分为系统级别的配置文件和用户级别的配置文件。
任何一种 Shell 都有用户级别的配置文件，以及对应的系统级别的配置文件。

* 系统级别的配置文件位于 `/etc` 下，这些配置会应用于所有用户。例如 `/etc/profile`，`/etc/bashrc`。
* 用户级别的配置文件位于用户目录 `~` 下，通常会加一个 `.` 来隐藏。例如 `~/.profile`，`~/.bashrc`。

在 Shell 启动时，会首先执行系统级别的配置文件（如果存在的话），再执行用户级别的配置文件。也就是说 `~/.bashrc` 中的配置会覆盖 `/etc/bashrc` 中的配置。

## 登录 Shell 的配置文件

登录 Shell 会读取登录相关的配置文件，一般可分为三类：

* `.profile` 配置登录 Shell 的行为。在作为登录 Shell 启动时读取。
* `.login` 登录时的读取。
* `.logout` 登出时读取。

* `.profile` 是 `/bin/sh` 的配置文件。Bash 兼容于 sh，因此 Bash 作为登录 Shell 时也会读取 `/etc/profile` 和 `~/.profile`（其实几乎所有 Shell 都会这样做）。
* `.login` 是登录 Shell 在用户登录后读取的配置文件，csh、tcsh 都会读取它。
* `.logout` 是登录 Shell 在用户退出时读取的配置文件，csh、tcsh 都会读取它。

每一种 Shell 在兼容上述配置文件的同时，也会有一些私有的配置文件。比如 Bash：

* `.bash_profile` 是 Bash 私有的登录 Shell 配置文件。
* `.bash_login` 是 Bash 作为登录 Shell，用户登录后读取的配置文件。
* `.bash_logout` 是 Bash 作为登录 Shell，用户退出时读取的配置文件。

比如 Zsh 的 `.zprofile`, `.zlogout`, `.zlogin` 等等，详见 <https://wiki.archlinux.org/index.php/zsh>

## 交互式 Shell 的配置文件

有一些配置文件是只会被交互式 Shell 读取的，包括：`.zshrc`，`.bashrc` 等。

其中 `.bashrc` 只会被交互式的、非登录 Bash 读取。
因此往往会在 `.bash_profile` 中调用 `~/.bashrc` 来让 Bash 作为登录 Shell 时也读取 `~/.bashrc`：

```bash
[[ -r ~/.bashrc ]] && . ~/.bashrc
```

`.zshrc` 会被任何交互式 Z Shell 读取，除非设置了 `-f` 参数。
C Shell, TCShell 启动时却总是会去读取 `cshrc`, `.tcshrc`，无论当前 Shell 是否为交互式的、或者登录 Shell。

## 参考阅读

* Unix Shell: <https://en.wikipedia.org/wiki/Unix_shell>
* Related Terms: <http://unix.stackexchange.com/questions/4126/what-is-the-exact-difference-between-a-terminal-a-shell-a-tty-and-a-con>
* Bash Startup Files: <http://www.linuxfromscratch.org/blfs/view/6.3/postlfs/profile.html>
* Unix-Frequently Asked Questions: <http://www.faqs.org/faqs/unix-faq/faq/part5/>

[xterm]: http://en.wikipedia.org/wiki/Xterm
[screen]: http://en.wikipedia.org/wiki/Gnu_screen
[ssh]: http://en.wikipedia.org/wiki/Secure_shell
[cron]: /2015/11/20/crontab-desktop.html
