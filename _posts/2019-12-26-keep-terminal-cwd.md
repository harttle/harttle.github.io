---
title: 从当前位置打开 Terminal
tags: Terminal Shell i3wm
---

我们有很多工作区时，每次打开一个 Terminal 都需要先 cd 到和上一个 Terminal 一样的位置再开始工作。
这个过程既然是固定的，那就一定能自动化。

我遇到的具体场景是，[i3wm][i3wm] 有 workspace（工作区）的概念，每个工作区可以打开任意多个 Terminal。
我希望同一个工作区的 Terminal 打开时都有一样的 CWD（Current Working Directory），
不同的工作区有不同的 CWD。即：**打开 Terminal 时，自动 cd 到当前工作区其他 Terminal 所在的位置**。

本文基于 Reddit 上的一个小脚本展开，这一思路适用所有 Terminal Emulator 和 Desktop Environment（尽管我只有 Window Manager 也是适用的）。

<!--more-->

## 实现思路

在 Reddit 上看到有不依赖具体 Terminal 和 DE/WM 的解决方案：

1. 记录。改掉 Shell 的 PS1，每次出命令提示符时都记录一下 `pwd`。
2. 恢复。在 .bashrc 或 .zshrc 或 .config/i3/config 中读取上次记录的位置并恢复。

上述方案只有一个问题：位置是全局唯一的。我们只需要小改一下，记录位置时获取当前的 workspace 编号或名字并记录，恢复时也先获取当前在哪个 workspace 并读取都应的 pwd。
下文就分别介绍这两个过程如何实现。

* 不限定具体的 Terminal Emulator。下文以 termite 为例，但我相信 Konsole，iTerm 应该是一样的。
* 不限定具体的桌面系统/窗口管理器。下文以 i3wm 为例，只要有工作区概念的 DE 都适用（好像 OSX 每个工作区只能有一个窗口）。

## 记录当前位置

用 i3-msg 可以拿到当前窗口所在的工作区，对于 i3wm 来讲拿 name 比 id 更实用因为 name 表达了这个工作区是做什么事情的。
我们只需要把它做文件名写入到文件里，比如 `/tmp/whereami-harttle-liquidjs` 里的内容是 `/home/harttle/src/liquidjs`。

```bash
NAME=$(i3-msg -t get_workspaces | jq --raw-output '.[] | select(.focused == true) | .name')
pwd > "/tmp/whereami-`whoami`-${NAME#*:}"
```

如果你用的不是 i3wm 也应该有类似的接口获得当前工作区，比如 Ubuntu 下 Unity 工作区可以这样获得（xprop 命令来自 xorg-xprop 软件包）：

```bash
xprop -root -notype _NET_DESKTOP_VIEWPORT
```

> 不需要担心 /tmp 目录频繁读写对硬盘的影响，`mount -l | grep /tmp` 可以看到 /tmp 所处文件系统类型是 tmpfs，读写 /tmp 和读写内存区别不大。

## 从记录的位置打开

获取当前所在 workspace 的方法同上。从记录的位置打开 Terminal 有两种方式：

1. 正常打开 Terminal，在 [Shell 配置文件][shell] 里去读取位置并 cd。比如 ~/.zshrc 中直接写一段脚本拿到 /tmp/whereami-harttle-xxx 里的位置并 cd。
2. 打开 Terminal 时传入目录参数。对于 termite 可以用 `--directory` 参数，其他 Terminal Emulator 应该有类似的。

以方式二例：

```bash
NAME=$(i3-msg -t get_workspaces | jq --raw-output '.[] | select(.focused == true) | .name')
FILE="/tmp/whereami-`whoami`-${NAME#*:}"
WHEREAMI=$HOME

if [ -f "$FILE" ]; then
    WHEREAMI=$(cat $FILE)
fi

termite --directory="$WHEREAMI"
```

[shell]: https://harttle.land/2016/06/08/shell-config-files.html
[i3wm]: http://i3wm.org/