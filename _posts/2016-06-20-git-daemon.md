---
title: 极简的 Git 服务器：git-daemon
tags: Git Github IP Linux SSH Ubuntu Archlinux
---

git-daemon是Git软件包中内置的Git服务器。
这是一个极简的Git服务器，没有权限控制，也没有Web控制台。
但是不需要安装额外的Git服务器，安装和使用非常方便，适合局域网内使用。
本文介绍如何在Archlinux下使用git-daemon。

Git-daemon 文档：<https://git-scm.com/docs/git-daemon>

启动Git服务器文档：<https://git-scm.com/book/ch4-4.html>

<!--more-->

# 安装git-daemon

安装git软件包，git-daemon就会随之安装。

```bash
# Archlinux
yaourt -S git
# Ubuntu
sudo apt-get install git git-core
```

# 创建Git目录

在创建Git服务目录前，需要创建一个git用户。

```bash
sudo adduser git
```

然后切换到git用户，并进行Git服务目录的创建和配置。

```bash
su git
mkdir /srv/git/my-first-repo.git
cd /srv/git/my-first-repo.git
git init --bare
```

因为git-daemon不提供任何权限验证，所以默认不允许用户push。
我们只在局域网内使用，因此可以开启它：

```bash
su git
cd /srv/git/my-first-repo.git
git config daemon.receivepack true
```

# 配置SSH Key

我们希望通过SSH方式来进行Git访问，
只需把你的公钥添加到git用户的`authorized_keys`下即可。

> 如何产生你的公钥？请参考Github帮助：<https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/#generating-a-new-ssh-key>

首先创建该配置文件（`/home/git/.ssh/authorized_keys`）：

```bash
su git
cd
mkdir .ssh && chmod 700 .ssh
touch .ssh/authorized_keys && chmod 600 .ssh/authorized_keys
```

然后修改`authorized_keys`，在其中新的一行插入你的公钥。
默认公钥文件名是`~/.ssh/id_rsa.pub`。


# 启动Git服务

在采用systemd服务管理器的Linux发行版中，通过`systemctl`启动git-daemon：

```bash
# 立即启动
sudo systemctl start git-daemon.socket
# 开机启动
sudo systemctl enable git-daemon.socket
```

如果没看到错误的话Git服务器已经启动啦！
可以通过`systemctl status git-daemon.socket`来查看启动状态。

# Clone and Push！

现在就可以使用该Git服务了！现在克隆一下前面创建的仓库：`/srv/git/my-first-repo.git`


```bash
git clone git@192.168.1.32:/srv/git/my-first-repo.git
```

> 假设你的git-daemon所在机器IP为`192.168.1.32`

如果你的`~/.ssh/id_rsa.pub`已经添加到了服务器的`/home/git/.ssh/.authorized_keys`，
那么下面的push操作也会成功：

```bash
git commit -m 'test' --allow-empty
git push origin master
```

