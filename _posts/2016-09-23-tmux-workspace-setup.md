---
title: 恢复 TMUX 工作区
subtitle: The Hard Way
tags: Bash Session Tmux
---

我们知道使用 TMUX 后状态会保存在 Server 端，你的 Terminal 重启不会丢失任何东西。
但 Server 重启后 Session 会全部丢失，如果你像 Harttle 一样在开发 PC 本地运行 Tmux Server 的话，
每次开机后都需要重新建立各种会话和窗格。

但没有什么是不能自动化的，我们可以通过 Tmux 配置文件（即初始化脚本）来自动建立工作区。
本文便来手动编写一个初始化工作区的 TMUX 脚本。

* 如果你还不了解 Tmux，请先从 [优雅地使用命令行：Tmux 终端复用][tmux-startup] 一文开始阅读。
* 如果你更偏向插件，可以参考 [恢复 TMUX 工作区 - The Easy Way](/2017/11/24/tmux-workspace-plugin.html)，虽有一些限制但配置更加方便。

<!--more-->

# Bash脚本

我们可以写一个Bash脚本来完成初始化工作。
其实初始化工作区所需的命令甚少，无非是创建会话，分隔窗口，以及运行某些命令。

```bash
# 创建名为my-session的会话
tmux new-session -s 'my-session'
# 水平分隔窗口
tmux split-window -h
# 水平分隔窗口，并在新窗口运行mongod
tmux split-window -h 'mongod'
# 给my-session的1号窗格（第二个）发送ls+回车
tmux send-keys -t my-session.1 ls Enter
```

上述脚本是Bash语法，可以保存为`init-workspace.sh`，调用它即可建立my-session工作区。
命令详细用法请参考手册页：`man tmux`。

```bash
bash ./init-workspace.sh
```

> 在创建了一堆会话之后，如果希望把它们一起关掉可以直接`tmux kill-server`。

# TMUX 脚本

除了保存为Bash脚本，也可以将这些初始化命令放在`~/.tmux.conf`中。
这样在每次启动tmux服务时，这些命令都会得到执行。

```tmux
new-session -s 'my-session'
split-window -h
split-window -h 'mongod'
send-keys -t my-session.1 ls Enter
```

> 注意我们现在写的是TMUX脚本，比Bash脚本省略了前面的`tmux`命令。

如果你像我一样只使用本地的TMUX服务，那么采用这种方式非常合适。
这些命令会在每次运行`tmux`命令时执行，因此使用时直接挂载会话即可：

```bash
tmux attach -t my-session
# 也可以省略-t参数，挂载最后一次attach的会话
tmux attach
```

这行命令可以写在虚拟终端（如iTerm2）的启动配置中，
这样每次打开iTerm都会自动进入一个TMUX会话。

# 创建多个窗格

作为一个Web开发者，可能开机后第一件事就是启动MySql、Mongodb、redis等服务器。
我们可以为它们创建一个Session（比如就叫servers），并在其中的每个窗格运行一个服务器。

```tmux
new-session -s servers -c /tmp 'redis-server'
split-window -h 'mongod'
split-window -v '~/bin/goproxy.sh'
```

> 创建多个窗格后向移动光标怎么办？使用`select-pane`命令即可，详情见
> [优雅地使用命令行：Tmux 终端复用][tmux-startup]一文。

这一操作涉及两个命令，第一个是`new-session`：

* `-s`参数用来设置Session名。
* `-c`参数用来设置工作目录，从该Session打开的窗口都将继承这一目录。
* 紧接着是该Session打开后要执行的命令。

第二个是`split-window`，在[优雅地使用命令行：Tmux 终端复用][tmux-startup]中曾介绍过
如何配置分隔窗口的快捷键，使用的正是该命令。

* `-h`（horizontal）表示水平分隔，就是变成左右两个窗格（pane）。
* `-v`（vertical）表示垂直分隔。
* 同样地，后面跟的是新打开的窗格要执行的命令。

# 禁止命令结束关闭窗格

注意在`new-session`或`split-window`时指定的命令结束后，窗格会自动关闭。
当然如果不指定任何命令，那么窗格是保持打开的。

为了命令结束关闭窗格的行为，可以在要执行的命令后添加`read`命令，使它重新开始接受输入。例如：

```tmux
split-window -h 'mongod; read'
```

但如果是我们`Ctrl-C`手动结束进程那么后面的`read`也不会得到执行，窗格还是关闭了 :(
这时便只能使用键盘指令大法：

```tmux
new-session -s servers -c /tmp
send-keys -t servers.0 redis-server Enter
```

`-t`参数指定了键盘指令发往名为`servers`的会话，而`0`表示发往该会话的第一个窗格。

[tmux-startup]: /2015/11/06/tmux-startup.html
