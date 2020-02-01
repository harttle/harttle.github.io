---
title: 保存和恢复 TMUX 工作区 —— The Easy Way
tags: Bash Session Tmux
---

Harttle 此前介绍过 [Tmux 的使用][tmux-startup]，我们知道 [Tmux][tmux] 可以把所有打开的 Shell 都保存在服务器。
你的 Terminal 重启不会丢失任何东西，但 Server 重启后 Session 会全部丢失。
如果你像 Harttle 一样在开发 PC 本地运行 Tmux Server 的话，每次开机后都需要重新建立各种会话和窗格。

本文介绍一个 Tmux 插件：[tmux-resurrect](https://github.com/tmux-plugins/tmux-resurrect)，
可以一键保存当前 Tmux 状态，包括 Session、Window、Pane 布局，甚至 Vim 状态也可以恢复。

> 如果你更偏向 The Hard Way，可以参考 [恢复 TMUX 工作区 - The Hard Way](/2016/09/23/tmux-workspace-setup.html)，手动完成一切初始化工作。

<!--more-->

## 安装插件

[官方文档][tmux-resurrect] 给出了完整的介绍，Harttle 推荐使用 [tpm][tpm] (Tmux Plugin Manager) 来安装。
首先安装 tpm：

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

把下面的 tpm 启动配置加入 `~/.tmux.conf`：

```
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-resurrect'
run '~/.tmux/plugins/tpm/tpm'
```

进入 Tmux 后加载上述配置，并安装插件：

```bash
:source-file ~/.tmux.conf
<prefix> + I
```

`I` 是 Install 的简写，用来安装前述 `@plugin` 声明的插件。安装成功后你会看到 Tmux 的成功提示。

## 保存和恢复

安装完成后，在 Tmux 中可以随时保存状态，快捷键：

```
<prefix> Ctrl+s
```

下次打开 Tmux 后可以一键恢复：

```
<prefix> Ctrl+r
```

这样所有的 Session，Window，Pane 都会恢复到上次保存的状态，关键在于关机前一定要记住保存。

## 恢复程序状态

我们可能还需要保存当前每个窗格运行的程序。类似 `vim`, `less`, `man` 这些程序 tmux-resurrect 会自动恢复，其他的则需要配置：

```
set -g @resurrect-processes 'ssh mysql redis-server npm'
```

恢复 npm 有一些问题，可以尝试 [这里的][restore-doc] 有替代方案。或者直接尝试 [The Hard Way][the-hard-way] :)

[tmux-startup]: /2015/11/06/tmux-startup.html
[tmux-resurrect]: https://github.com/tmux-plugins/tmux-resurrect
[tpm]: https://github.com/tmux-plugins/tpm
[tmux]: https://wiki.archlinux.org/index.php/tmux
[the-hard-way]: /2016/09/23/tmux-workspace-setup.html
[restore-doc]: https://github.com/tmux-plugins/tmux-resurrect/blob/master/docs/restoring_programs.md
