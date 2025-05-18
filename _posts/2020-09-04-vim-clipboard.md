---
title: Vim 使用系统剪贴板
tags: Vim 剪贴板 寄存器
---

Vim 是运行在 Terminal 里的 Shell 程序，所以要把内容拷贝出来可以通过 Terminal，也可以通过 Vim 自己。不配置 Vim 剪贴板时只能通过 Shell 来拷贝粘贴：

- 通过 Shell 拷贝（比如在 iTerm 里按住 Alt 选取内容）会有问题：比如会包含 Vim 左侧行号、折行变成了换行。
- 通过 Shell 粘贴有类似的问题：相比于 `p` 命令，在插入模式下 Ctrl+V 时 Vim 会把内容当作字符键入，触发 Vim 的所有处理键入的插件，比如自动补全、语法检查等。不仅会很慢，而且可能会破坏你的内容（比如粘贴一对括号，可能 Vim 会再帮你自动补全一个多余的右括号）。

所以完美的拷贝粘贴一定要通过 Vim 本身。Vim 中 `p`（paste）、`d`（delete）、`y`（yank）等拷贝粘贴操作使用的是 **匿名寄存器** `""`（unnamed register），本文就来解释怎么在 Mac/Windows/Linux 上把 Vim 的 **匿名寄存器** 映射到操作系统的剪贴板。

**TL; DR**

1. 确保你的 vim 支持剪贴板，通过 `vim --version | grep clipboard` 检查。
2. 确定你的剪贴板寄存器是 `"+`（XA\_SECONDARY）还是 `"*`（XA\_PRIMARY）。
3. 同步剪贴板和匿名寄存器，在 `~/.vimrc` 添加配置比如 `set clipboard=unnamed`。

<!--more-->

## 确保你的 Vim 支持剪贴板

你的 Vim Build 没有支持 clipboard，那么无论怎样配置都不会生效。
可以用如下命令检查：

```bash
vim --version | grep clipboard
```

如果输出包含 `+clipboard` 或 `+xterm_clipboard` 就支持，如果这两项都是 `-` 则不支持。例如我的 Vim 输出为（MacOS 上的 macvim）：

```
+clipboard         +keymap            +printer           +vertsplit
+emacs_tags        -mouse_gpm         -sun_workshop      -xterm_clipboard
```

如果你的 Vim 不支持剪贴板，则需要重新安装一个带 clipboard 的 Vim：

- MacOS 下可以直接用 [brew](https://brew.sh/) 安装 macvim，它是支持剪贴板的。
- Linux 下，如果是 Debian 或 Ubuntu 可以安装 vim-gtk、vim-gnome，Redhat/CentOS 则可以安装 vim-X11。
- Windows 下比较复杂，可以参考 <https://vim.fandom.com/wiki/Using_the_Windows_clipboard_in_Cygwin_Vim>。

重新安装后再执行 `vim --version` 来查看 clipboard 是否支持。注意：如果安装到了其他路径你需要改 PATH 或重启 Terminal。

## 确定你的剪贴板寄存器

Vim 有 48 个寄存器，`y`, `d`, `p` 等命令一般使用匿名寄存器 `""`，
支持剪贴板的 Vim 会支持额外的选区寄存器 `"*` 和 `"+`。
更多 Vim 寄存器的信息，可以参考这篇文章：[Vim 寄存器完全手册](https://harttle.land/2016/07/25/vim-registers.html)。

`"*` 和 `"+` 在 Mac 和 Windows 中，都是指系统剪贴板（clipboard），例如 `"*yy` 即可复制当前行到剪贴板。
其他程序中复制的内容也会被存储到这两个寄存器中。
在 X11 系统中（绝大多数带有桌面环境的 Linux 发行版），二者是有区别的：

* `"*` 指 X11 中的 PRIMARY 选区，即鼠标选中区域。在桌面系统中可按鼠标中键粘贴。
* `"+` 指 X11 中的 CLIPBOARD 选区，即系统剪贴板。在桌面系统中可按 Ctrl+V 粘贴。

上述哪个寄存器对应于你的剪贴板和 Linux 发行版有关，在配置 Vim 前可以测试一下。
比如用 Vim 打开一个文件，在 normal 模式下（进入 Vim 后默认的模式）键入 `gg"*yG`，
来把当前文件内容拷贝到 `"*` 寄存器。键入 `gg"+yG` 拷贝到 `"+` 寄存器。

到目前为止，你已经可以通过命令来拷贝粘贴内容了。接下来我们希望通过 Vim 配置，
让匿名寄存器和系统剪贴板同步。

## 同步剪贴板和匿名寄存器

以下配置可以让主选区寄存器 `"*` 和匿名寄存器 `""` 保持同步（即共享剪贴板），
一般适用于 Windows 和 MacOS，Linux 下的表现是共享 X11 剪贴板、PRIMARY 选区（鼠标中键粘贴）。

```vim
set clipboard=unnamed
```

Vim 7.3.74 及以上支持了 unnamedplus：

```vim
set clipboard=unnamedplus
```

即让剪贴板寄存器 `"+` 和匿名寄存器 `""` 保持同步，
Linux 下一般对应于桌面系统的剪贴板，比如 GNOME 的系统剪贴板、以及 SECONDARY 选区（Ctrl+V 粘贴）。

## 不支持 clipboard 的情况

如果你的 Vim 不支持 clipboard 且没法升级或其他 clipboard 选项不好使的情况，
可以调用外部命令来实现拷贝粘贴，在 Vim 里直接调用，或设置快捷键调用。
比如 [让 Tmux 远程 Vim 使用本地系统的剪贴板][tmux-clip]。

如果在 MacOS 下，可以用 pbcopy/pbpaste 命令来实现。

- 拷贝一段文本：先按 v 进入 visual 模式选中后执行 `:w !pbcopy`。拷贝整个文件可以 `:%w !pbcopy`
- 粘贴一段文本：把光标移动到要插入的行，执行 `:r !pbpaste`

如果在 Linux 下，可以借由 xclip 来实现。用 `xclip -i -sel c` 代替上面的 `pbcopy`，用 `xclip -o -sel -c` 代替上面的 `pbpaste`。

[tmux-clip]: /2017/06/23/vim-tmux-clipboard.html
