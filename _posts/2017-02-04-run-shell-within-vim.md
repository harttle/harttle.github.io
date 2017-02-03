---
title: 在 Vim 中执行 Shell 命令
tags: Shell Tmux Vim 进程 快捷键
---

刚开始使用终端和 Vim 工作时，桌面上总是铺满了执行各种任务的终端窗口，任务切换极其困难。
尤其在使用 Vim 编辑文件时每次想执行一些 Shell 命令就会新开一个窗口。
虽然[搭建终端工作环境][tmux]的终极方式是终端复用，但有一些更加轻巧的办法可以在 Vim 中快速执行 Shell 命令。

比如 `:!cmd` Vim 命令和 `:sh` Vim 命令，以及 `Ctrl+Z` Shell 快捷键。
除此之外还可以使用 [benmills/vimux][benmills/vimux] 来在 Vim 中操作 Tmux，
这可以达到类似 IDE 的效果：按下编译快捷键打开命令窗格并开始编译，
编译过程中 Vim 不会失去焦点，编译成功后自动关闭命令窗格。

<!--more-->

# :!cmd

`:!{cmd}` 是 Vim 命令，用来执行一条 Shell 命令，命令完成后按任意键回到 Vim。
可通过`:!zsh ls`来指定不同的 Shell。适合只执行一条命令的场景，比如编译、运行测试、查看 IP 等，例如：

```vim
:!ifconfig en0
:!!
```

`:!!` 为重复执行上一条命令（就像`@@`重复执行上一个宏一样），这在重复地编辑/编译时很方便。

# c-z

`<Ctrl+Z>` 是最基础的 Shell 快捷键，用来立即挂起当前进程（比如当前的 Vim）并进入 Shell。
在完成一系列的命令后，使用`fg`来切换回 Vim。适合暂时离开 Vim 但需要执行多条命令的场景。
例如暂时挂起 Vim 去创建一个新的文件：

```bash
vim index.html
<Ctrl-Z>
touch index.js
fg
```

如果使用`<Ctrl+Z>`挂起了多个任务怎么办？可以 `fg %1` 来恢复第一个，`fg %2` 来恢复第二个，以此类推。
如果你配置了[oh my zsh][omz]，在输入 `fg ` 后按下 `<Tab>` 便会提示当前所有的挂起任务。

> 如果只是操作文件和目录，在 Vim 也可以做到。
> 详见：[在 Vim 中进行文件目录操作](/2016/10/14/vim-file-and-directory.html)

# :shell

`:sh[ell]` 是 Vim 命令，可以从 Vim 中运行一个 Shell 出来。在完成一系列的命令后，
按下`Ctrl-D`来结束当前 Shell 并回到 Vim。其行为相当于`<Ctrl-Z>`，但由于是 Vim 主动地启动 Shell 进程，
可以通过 `shell` 选项来设置不同的 Shell：

```vim
:set shell=\"c:\program\ files\unix\sh.exe\"\ -f
```

在 [StackOverflow上提到][stackoverflow] 可以将 `Ctrl+D` 映射到 `:sh`，
这样可以使用 `Ctrl+D` 来切换 Vim/Shell：

```vim
:noremap <c-d> :sh<cr>
```

[stackoverflow]: http://stackoverflow.com/questions/1236563/how-do-i-run-a-terminal-inside-of-vim
[tmux]: /2015/11/06/tmux-startup.html
[omz]: https://github.com/robbyrussell/oh-my-zsh
[benmills/vimux]: https://github.com/benmills/vimux 
