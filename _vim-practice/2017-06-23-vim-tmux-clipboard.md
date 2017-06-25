---
title: Vim、Tmux、系统共用剪切板
tags: SSH Tmux Vim 剪切板 寄存器
---

在 [Tmux 终端复用](/2015/11/06/tmux-startup.html) 中介绍过 Tmux 的使用，
当你同时有系统剪切板、Tmux Clipboard、Vim Yank Buffer 时互相拷贝是不是很困难？
本文介绍如何让它们共用一个剪切板。

<!--more-->

# Vim 与 Tmux Buffer 共享

[vim-tmux-clipboard][vim-tmux-clipboard] 提供了 Vim 和 Tmux 的剪切板共享，
它有一个依赖的插件 [vim-tmux-focus-events][vim-tmux-focus-events] 需要一起安装。
在 `~/.vimrc` 中加入：

```vim
Plugin 'tmux-plugins/vim-tmux-focus-events'
Plugin 'roxma/vim-tmux-clipboard'
```

在 `~/.tmux.conf` 加入对应配置：

```
set -g focus-events on
```

使用 Vundle 安装插件，如果你还不了解 Vundle，[这是官网][vundle]。

```
vim +PluginInstall
```

# Tmux 与系统剪切板共享

最新版本的 Tmux（其实只要支持 -C 参数）可以把操作上交给 iTerm2，这时剪切板和操作系统是互通的，甚至 Tmux 运行在 ssh 中。

但远程的 Vim 与本地剪切板仍不互通，即使使用 vim-tmux-clipboard 也不能。
**本小节给出远程与本地（以 Mac 为例）公用剪切板的通用方案**。

首先，在连接 SSH 时指定反向隧道（需要在 Mac 设置中允许远程访问）：

```bash
ssh -R 8234:localhost:22 harttle@harttle.com
```

> 上述 Reverse Tunnel 在配置文件中对应 RemoteForward 参数：`RemoteForward 8234 localhost:22`。

其中 `harttle@harttle.com` 是目标服务器的用户名和主机名，远端的 8234
连接到本地的 localhost:22 端口。

然后，在远程执行如下命令将当前 Tmux Buffer 发给本地的 `pbcopy`（系统剪切板）：

```bash
tmux save-buffer - | ssh -p 8234 localhost pbcopy
```

## 快捷方式

如果上述 `tmux save-buffer` 命令好使的话，事实上可以把任何东西发送给本地剪切板。

比如把上述命令设为 Tmux 快捷键（Ctrl+C），在 `~/.tmux.conf` 中：

```
bind C-c run "tmux save-buffer - | ssh -p 8234 localhost pbcopy"
```

比如把上述命令设为 Vim 快捷键（`<leader>cp`），在 `~/.vimrc` 中：

```vim
map <leader>cp :redir! > /tmp/vimbuffer \| echo @" \| redir END \| !cat /tmp/vimbuffer \| ssh -p 8234 localhost 2>/dev/null<cr>
```

> 上述代码大意如下：将剪切板寄存器写入 `/tmp/vimbuffer`，将该文件读出，重定向到 `ssh`，由 SSH 发送到 Mac。这里谁有更好的写法。。。求教。

## 安全考虑

上述两个 `ssh` 命令可能会询问 SSH 密码，可以
[配置 SSH 自动登录](/2016/09/14/ssh-auto-login.html)
来避免重复输入（注意如果当前用户不同需要在 ssh 命令中添加用户字段）。

这其实会允许服务器在本地执行任何命令，为了限制这一点可以在对应的 Public Key
中配置默认命令，以及禁止端口转发等功能。

```
command="pbcopy",no-port-forwarding,no-x11-forwarding,no-agent-forwarding ssh-rsa XXXXXX(你的 SSH Key)
```

由于 `pbcopy` 被设为默认命令，远程执行的命令中就不必写 `pbcopy` 了：

```bash
tmux save-buffer - | ssh -p 8234 localhost
```

本地/远程共享剪切板一般都通过远程调用本地 `pbcopy` 来完成。
在本地起一个服务来执行 pbcopy 会比远程调用更加安全，
可参考：<https://seancoates.com/blogs/remote-pbcopy/>

# Vim 与系统剪切板共享

在 [Vim 寄存器](/2016/07/25/vim-registers.html) 中介绍过系统剪切板映射在 Vim
中称为寄存器，包括主选区 `"*` 寄存器和剪切板 `"+` 寄存器（这是 X11 中的概念，
在 Mac 和 Windows 中这两个没有区别）。为使 Vim 与系统剪切板同步，可以简单地设置：

```vim
set clipboard=unnamed
```

[vim-tmux-focus-events]: https://github.com/tmux-plugins/vim-tmux-focus-events
[vim-tmux-clipboard]: https://github.com/roxma/vim-tmux-clipboard
[vundle]: https://github.com/VundleVim/Vundle.vim
