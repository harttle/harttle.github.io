---
title: 没有 Root 权限 Oh My Zsh 使用攻略
tags: Bash Linux Mac Zsh SSH Shell Unix
---

有些Linux环境中我们没有管理员权限，但这并不能阻止Harttle使用[Zsh][zsh]。
为此我们需要本地安装[Zsh][zsh]，应用[Oh My Zsh][omz]配置，
再设置启动Shell来使我们登录即进入[Zsh][zsh]。

如果你还不知道什么是[Zsh][zsh]，请看下图：

![zsh command line][zsh-cli]

安装和配置Shell的过程很可能会使你无法再次登录Shell，
请确保你有其他的方式访问该机器，这样发生状况时可以重置Shell配置。
比如：

* 你有桌面系统！可以直接进入Gnome或者KDE。
* 可用的`scp`，如果你与主机之间没有代理等中间人的话，`scp`应该是好使的。
* Samba等文件服务。这使你可以在不登录的情况下进行配置。

<!--more-->

## 安装Zsh

如果你有 root 或 sudo 权限可以直接用包管理去装，
参考 [Installing-ZSH](https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH)。
以下介绍从源码安装 Zsh 到局部目录下：

```bash
# 下载
wget -O zsh.tar.xz https://sourceforge.net/projects/zsh/files/latest/download
# 解压
mkdir zsh && tar -xvf zsh.tar.xz -C zsh --strip-components 1
cd zsh
# 配置，比如将Zsh安装到~/usr下
./configure --prefix=$HOME/usr/
make
make install
```

安装成功后找到 `~/usr` 下的zsh可执行文件，运行一下看是否安装成功了：

```bash
~/usr/bin/zsh
```

如果你成功地进入了另一个 Shell 那么 Zsh 安装就大功告成了，按下 Ctrl+D 返回刚才的 Bash。

## 安装Oh My Zsh

[Oh My Zsh][omz] 是一个社区驱动的（就像Arch一样！）Zsh配置框架，有很多漂亮的主题和插件可以选择。
今天大多小伙伴们安装Zsh的原因居然是这个配置框架！
使用[Oh My Zsh][omz] 提供的安装脚本即可安装（默认目录为`~/.oh-my-zsh`）。
如果你在此前尝试过安装Oh My Zsh，务必先删除之：`rm -rf ~/.oh-my-zsh`。

```bash
sh -c "$(wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
```

如果上述命名发生错误，可以通过其他途径获得这个 `install.sh`，然后无情地运行它。
比如wget时禁用SSL验证：

```bash
wget --no-check-certificate https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh
bash install.sh
```

无论你是怎样得到并运行`install.sh`的，只要得到下列结果就表明安装成功：

```
         __                                     __
  ____  / /_     ____ ___  __  __   ____  _____/ /_
 / __ \/ __ \   / __ `__ \/ / / /  /_  / / ___/ __ \
/ /_/ / / / /  / / / / / / /_/ /    / /_(__  ) / / /
\____/_/ /_/  /_/ /_/ /_/\__, /    /___/____/_/ /_/
                        /____/                       ....is now installed!
```

## 登录 Shell

**登录Shell**是指一个 Unix 用户在登录系统时为该用户启动的默认 Shell，
包括通过 X11 登录，通过 TTY 登录，以及通过 SSH 登录等。
在多数 Linux 发行版以及 OSX 中都是`/usr/bin/bash`。
以下是登录 Shell 相关的配置文件：

* `/etc/passwd`(644)：所有用户的用户名、用户组、`$HOME`、登录 Shell 等信息
* `/etc/shadow`(400)：所有用户的用户密码的Salt和Hash
* `/etc/shells`(644)：登录Shell列表，`chsh -s <shell-name>`只能选自该列表

更多 Shell 的概念可以参考 [Shell 的相关概念和配置方法](https://harttle.land/2016/06/08/shell-config-files.html) 一文。
上述 oh-my-zsh 提供的 install.sh 会使用 `chsh` 更改你的登录 Shell：

```bash
chsh -s $(grep /zsh$ /etc/shells | tail -1)
```

**注意这行代码的危险**：它将会更改你的登录 Shell 为 `/etc/shells` 中的 Zsh。
而不是你在本地安装的那个[Zsh][zsh]。版本的区别足以让你的zsh完全不可用。

因为我们没有Root权限，因此无法将本地安装的Zsh添加到 `/etc/shells`。
因此也就不能通过 `chsh` 切换到我们本地的[Zsh][zsh]。
所以我们仍然使用 Bash 作为登录 Shell，而在 `~/.bashrc` 中运行我们的Zsh。
在该配置文件尾加入：

```bash
exec $HOME/usr/bin/zsh
```

> 不要使用`source $HOME/usr/bin/zsh`或`. $HOME/usr/bin/zsh`，这些命令会创建子进程。
> 而`exec`会用新的命令替换当前进程的上下文，因而保持了PID不变。

## 更新PATH

将Zsh加到PATH中来方便今后对`zsh`的调用，这个步骤是可选的。

在`~/.bashrc`中更新PATH即可：

```bash
export PATH="$HOME/usr/bin/zsh"
```

> 注意`PATH`两边不能有空格，且必须使用双引号来让Bash解析`$HOME`的值。

## 多余字符问题

语言和地区配置不正确可能会导致 Z Shell 中敲 Tab 时出现多余的字符。尝试修复 `locale` 设置即可解决。

1. 首先检查 `LC_ALL`：`echo $LC_ALL`。如果它不没有指定 UTF-8 的话，可以在 `~/.zshrc` 中添加 `LC_ALL=en_US.UTF-8 UTF-8`
2. 如果还不生效可能是没有生成对应 locale。检查 `/etc/locale.gen` 并执行 `locale-gen` 可能解决问题（ArchLinux）。

[omz]: https://github.com/robbyrussell/oh-my-zsh
[zsh-cli]: /assets/img/blog/shell/zsh-cli.png
[zsh]: http://www.zsh.org/
