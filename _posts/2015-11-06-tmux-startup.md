---
title: 优雅地使用命令行：Tmux 终端复用
tags: Bash GNU Linux Node.js Session Tmux Vim 快捷键
---

你是否曾经开过一大堆的 Terminal？有没有把它们都保存下来的冲动？[Tmux][tmux] 的Session就是做这件事情的！
你可以随时退出或者进入任何一个 Session。每个 Session 有若干个 Window，每个 Window 又可以分成多个窗格（Pane）。
极大地满足 Terminal 用户的需求。

此外即使 iTerm/Terminal/Konsole 意外关闭也没关系，因为 Session 完全保存在 Tmux Server 中。
再次打开 Terminal 时只需 `tmux attach` 便可回到你的工作区，就像从未退出过一样。
如果希望重启电脑后仍然生效，你可能需要 [动手写脚本](/2016/09/23/tmux-workspace-setup.html) 或者 [使用插件](/2017/11/24/tmux-workspace-plugin.html)。

<!--more-->

# 什么是 Tmux

[Tmux][tmux] 是一个 BSD 协议发布的终端复用软件，用来在服务器端托管同时运行的 Shell。那么 Tmux 用起来是怎样的呢？看图：

![tmux screen shot][tmux-shot]

Tmux 最经典的使用场景便是用 Tmux+Vim 来做一个IDE，其中Vim部分的配置过程记录在了[这里][vim-ide]。
本文介绍Tmux的安装配置，以及常见问题的解决方式。

## iTerm 的窗格和 Tmux 有什么区别？

iTerm是一个GUI软件，它的窗格只是窗格而已！而Tmux是终端复用，在一个命令行窗口中不仅可以显示多个Shell的内容，而且可以保持多个会话。
最重要的是：Tmux和Vim一样属于字符终端软件，不需要任何GUI的支持，在远程登录时尤其有用。

> 终端和 Shell 有什么区别？请参考 
> [Shell的相关概念和配置方法](/2016/06/08/shell-config-files.html)。

## Tmux 和 screen 有什么区别？

这两个都是做终端复用的，我在阿里云 ECS 上 [搭建Node.js API服务器][node-web] 时用过 `screen`，它是 GNU 软件，而 Tmux 是 BSD 的协议。
它们最主要的区别是 Tmux 支持 Vi/Emacs 风格的键盘映射，更好的接口和文档，以及更好的脚本控制。所以建议使用 Tmux！

# 安装使用

首先进行安装：

```bash
brew install tmux       # OSX
pacman -S tmux          # archlinux
apt-get install tmux    # Ubuntu
yum install tmux        # Centos
```

安装好后就可以启用一个Tmux Session了：（通过 `tmux new -s myname` 可以指定Session名）

    tmux

在Tmux Session中，通过`<prefix>$`可以重命名当前Session。其中`<prefix>`指的是tmux的前缀键，所有tmux快捷键都需要先按前缀键。它的默认值是`Ctrl+b`。

`<prefix>c`可以创建新的窗口（Window），`<prefix>%`水平分割窗口（形成两个Pane），`<prefix>"`垂直分割窗口。退出当前Session的快捷键是`<prefix>d`。然后在Bash中可以查看当前的tmux服务中有哪些Session：

    tmux ls

然后根据Session的名字可以再回去：

    tmux a -t myname  (or at, or attach)

# 基本配置

默认的`<prefix>`是`Ctrl+b`，如果你觉得不好按可以调整为`Ctrl+a`，只需要在配置文件`~/.tmux.conf`中加入：

    unbind ^b
    set -g prefix 'C-a'

## 载入配置

为了能让Tmux动态载入配置而不是重启，我们设一个快捷键`<prefix>r`来重新载入配置：

    bind r source-file ~/.tmux.conf \; display-message "Config reloaded"

> 注意，通过`<prefix>r`重新载入配置并不等同于重启，只是增量地执行了配置文件中的所有命令而已。如果配置未生效，可以通过`tmux kill-server`来强行关闭Tmux。

## 导出配置

如果你想知道当前tmux的设置，可通过`tmux show -g`来查看（该命令需要tmux正在运行）。
你可能会需要把这些设置导出为文件：

```bash
tmux show -g >> current.tmux.conf
```

# 拷贝粘贴

在Tmux中通过`[`进入拷贝模式，按下`<space>`开始拷贝。然后用Vim/Emacs快捷键选择文本，按下`<Enter>`拷贝所选内容。然后通过`]`进行粘贴。

> 上述所有快捷键中，只有`[`和`]`需要先按下`<prefix>`。

我们可以让上述拷贝快捷键符合Vi风格：

    bind Escape copy-mode
    bind-key -Tcopy-mode-vi 'v' send -X begin-selection
    bind-key -Tcopy-mode-vi 'y' send -X copy-selection
    unbind p
    bind p pasteb
    setw -g mode-keys vi      # Vi风格选择文本

这样，按下`<Escape>`进入拷贝模式，`v`进行选择，`y`拷贝所选内容，`p`进行粘贴。
另外只要开启鼠标模式（见下文），还可以用鼠标选取拷贝文字。

> 旧版本中开始选择和复制选中快捷键绑定方式不同，请参考 <https://github.com/tmux/tmux/issues/592>

# 快捷键

下面列出了在 Tmux 中经常使用的快捷键，在下面给出的按键之前需要先按下 `<prefix>`，
如果你没有设置过它，默认是 `Ctrl+b`。

```
:new<CR> # 创建新的 Session，其中 : 是进入 Tmux 命令行的快捷键
s        # 列出所有 Session，可通过 j, k, 回车切换
$        # 为当前 Session 命名
c        # 创建 Window
<n>      # 切换到第 n 个 Window
,        # 为当前 Window 命名
%        # 垂直切分 Pane
"        # 水平切分 Pane
<space>  # 切换 Pane 布局
d        # detach，退出 Tmux Session，回到父级 Shell
t        # 显示一个时钟，:)
?        # 快捷键帮助列表
```

在 Pane 之间切换，或者改变 Pane 大小，建议自己配置快捷键。比如把它配置成 Vim 风格：

```
bind h select-pane -L       # 切换到左边的 Pane
bind j select-pane -D       # 切换到下边的 Pane
bind k select-pane -U       # 切换到上边的 Pane
bind l select-pane -R       # 切换到右边的 Pane
bind L resize-pane -L 10    # 向左扩展
bind R resize-pane -R 10    # 向右扩展
bind K resize-pane -U 5     # 向上扩展
bind J resize-pane -D 5     # 向下扩展
```

> 完整的快捷键列表可以参考： <https://gist.github.com/MohamedAlaa/2961058>

# Unicode 显示问题

Tmux 通过 `LC_ALL`, `LC_CTYPE`, `LANG` 环境变量来判断是否终端支持 UTF-8。
这样的判断有时是不准确的，导致 Tmux 中无法显示 Unicode。解决思路有两个：

* 在启动 `tmux` 或 `tmux attach` 所在的 Shell 中添加 `LC_ALL` 环境变量。
* 启动 Tmux 时增加 `-u` 参数可以显式地通知 tmux 终端支持 UTF-8（`man tmux`）。

    ```bash
    tmux -u
    ```

# 启用鼠标

Tmux 和 Vim 风格非常像，也可以设置鼠标模式。下面的设置开启了所有鼠标功能：
点击选择窗格/窗口，拖动窗格大小，以及拖动鼠标复制文字。

    set -g mouse on

> 2.1 之前的版本(发布于 2015.10.18) 需要设置 `mode-mouse`, `mouse-select-pane`, `mouse-resize-pane`, `mouse-select-window`
> 等4 个选项来开启所有鼠标功能，现在只需要设置 `mouse` 选项了。
> 使用 `tmux -V` 可以查看当前安装的 tmux 版本，版本更新日志见 [Tmux Changelog][changelog]。

# Attach 到用户空间

有写童鞋会发现在 Tmux 中执行 `open`, `sudo` 等命令会有错误如下：

```
The window server could not be contacted. open must be run with a user logged in at the console, either as that user or as root.
```

或者 Vim [匿名寄存器][vim-registers] 也访问不到系统剪切板，比如粘贴时报错：

```
Nothing in register *
```

这是因为 Tmux 中的 Shell 没有运行在 Mac 的 GUI Session 中，
可以使用 [`reattach-to-user-namespace`][reattach] 工具来进行 Attach。
首先安装这一工具：

```bash
brew update
brew install reattach-to-user-namespace
```

然后在 `.tmux.conf` 中配置默认命令：

```
set -g default-command "reattach-to-user-namespace -l /usr/local/bin/zsh"
```

> 这里的 `/usr/local/bin/zsh` 要对应于你的默认 Shell 的路径，如果你没做过手脚的话，应该在`/usr/bin/bash`。
> 可以通过 `echo $SHELL` 查看当前 Shell 的路径。

# Session 偶尔丢失

Tmux 中 Session 或 Window 丢失可能的原因有很多，需要仔细排查。检查 `tmux` 日志，以及检查 [Shell 的各级配置][shell]。

* 比如 Shell 的 `TMOUT` 环境变量会让超时后的 Shell 自动退出，最终导致 Session 关闭。
* 比如临时文件夹被清空导致 socket 丢失，参考：<https://community.webfaction.com/questions/9462/tmux-session-lost-in-unknown-pts-cause-and-possible-solution>

## 新 Shell 的工作目录

我们发现当打开新窗格时 Shell 仍然在Home目录。
这是 Tmux 的默认行为，可以在配置文件中设置为当前 Shell 所在目录：

```
bind '"' split-window -c '#{pane_current_path}'
bind '%' split-window -h -c '#{pane_current_path}'
```

# 扩展阅读

* TMUX 与 Screen 的区别：<http://unix.stackexchange.com/questions/549/tmux-vs-gnu-screen>
* Cheetsheet: <https://gist.github.com/MohamedAlaa/2961058>
* Wikipedia：<https://en.wikipedia.org/wiki/Tmux>
* Vim 控制 Tmux：<https://github.com/benmills/vimux>

[Harttle][harttle] 的 Mac 下 Tmux 配置在这里，供参考：<https://github.com/harttle/unix-home/blob/macos/.tmux.conf>

[harttle]: https://harttle.land
[node-web]: /2015/02/24/node-web-api.html
[tmux-shot]: /assets/img/blog/tmux-concept.png
[vim-ide]: /2015/11/04/vim-ide.html
[changelog]: https://raw.githubusercontent.com/tmux/tmux/master/CHANGES
[vim-registers]: /2016/07/25/vim-registers.html
[reattach]: https://github.com/ChrisJohnsen/tmux-MacOSX-pasteboard
[shell]: /2016/06/08/shell-config-files.html
[tmux]: https://wiki.archlinux.org/index.php/tmux
