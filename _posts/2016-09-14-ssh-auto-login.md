---
title: 配置 SSH 自动登录
tags: Linux RSA SSH Shell TCP Unix X11
---

[SSH](https://zh.wikipedia.org/wiki/Secure_Shell) 是一个 Linux 下远程登录工具。
可以通过 [openssh](https://www.openssh.com/) 软件包来安装，有 BSD 协议的发型版。
如果你尚不了解Shell、终端、虚拟终端、控制台、命令行的概念区别，请参考：[Shell的相关概念和配置方法][shell]

免密码登录（俗称 SSH 信任关系）可以极大地方便 SSH 的使用，
类似 `scp`, `tmux`, X11 forward 的一些操作都会变得更加便捷。
其原理是指定一对公钥私钥，让服务器直接通过公钥识别登录者。
本文记录一次完整的服务器、客户端的配置过程。

> Windows 下推荐使用 PUTTY 或 XShell，本文的配置过程可能有 GUI 的配置方式。

<!--more-->

# 自动登录安全吗？

在开始这些配置之前， 先概要地介绍一下SSH。
以及打消一些不熟悉Linux的朋友对于自动登录安全性的无解。

SSH（Secure Shell）是由 IETF 标准化的，该工作组还标准化了IP，TCP，HTTP等协议。
SSH 协议包括三部分：传输协议，连接协议和认证协议。其中认证协议提供了两种级别：

* 用户名+密码认证。传输仍然会加密，但无法验证对方身份，可能受到域名劫持等中间人攻击。
* 公钥+私钥认证（不需输入密码）。传输加密，也会在建立连接时进行身份验证。（需要公钥基础设施或手动添加认证，原理同HTTPS）

由于公钥+私钥登录时，双方都会验证对方身份（通过`authorized_keys`）而且密钥显然比密码长很多。传输和连接的安全性是可以保证的。
那么你可能会想到密钥泄漏和偷窥的问题，SSH 文件的安全是依赖于Unix操作系统安全的。

就像别人不能轻易看到`/etc/shadow`下的密码一样，`~/.ssh` 目录的权限控制也非常严格，
如果没有为这些文件设置应用的权限，SSH 甚至会拒绝发起连接。

```bash
➜  harttle.land git:(master) ✗ ll ~/.ssh
-rw-r--r-- 1 harttle staff  650  8 26 17:27 config
-rw------- 1 harttle staff 1.7K  4 29  2014 id_rsa
-rw------- 1 harttle staff  402  4 29  2014 id_rsa.pub
-rw-r--r-- 1 harttle staff  21K  9 12 10:09 known_hosts
```

公私钥是只有创建者可访问的，配置文件和对方公钥则是所有人可读创建者可写。
（这也是为什么配置文件语法中不提供密码字段）

# 配置过程

客户端需要有一对密钥，公钥发送给服务器保存（在`authorized_keys`文件中）用来验证身份，
私钥用来解密服务器发来的信息。
熟悉RSA算法的朋友一定知道解密还需要对方公钥，服务器公钥是在初次建立连接时接收的，
被保存在`authorized_keys`下。在此可以看到 SSH 协议中，服务器和客户端的角色是对称的。

## 客户端生成密钥

在建立连接前先要有一对公私密钥。可以查看 `~/.ssh` 目录，如果没有可使用 `ssh-keygen` 生成。

```bash
# 查看这里有没有一个名为id_rsa.pub的公钥文件
ls ~/.ssh
# 如果没有，则生成一对。一路确定即可。
ssh-keygen
```

`id_rsa.pub` 是公钥，用来标识当前客户端的身份，是可以随便发送给任何人的，
比如Github是 SSH Key就是这个。
`id_rsa`是私钥，可理解为解密用的密码，不可发送给任何人。

## SSH 安装

首先服务器应当安装有`openssh`，如果没有请自行安装：

```
# arch
pacman -S openssh
# ubuntu
apt-get install openssh
# RHEL
yum install openssh
```

对于有些发行版，`sshd`不会默认运行。如果你的发行版使用systemd服务管理器，
可以使用`sysctl`来管理`sshd`守护进程：

```bash
# 启动SSH守护进程
systemctl start sshd
# 开机自启
systemctl enable sshd
```

> 关于systemd的使用可参考：[使用systemd管理Node.js应用][systemd-node]

## 服务器配置

为你要登录的用户（比如harttle）创建`~/.ssh`目录以及`~/.ssh/authorized_keys`文件。
并设置正确的权限（否则SSH会拒绝连接）：

```bash
# 先登录harttle用户，重新以harttle登录，或sudo -u harttle切换
# 确认当前用户为harttle
whoami
# 创建.ssh目录
mkdir ~/.ssh
chmod 700 ~/.ssh
# 创建对方公钥文件
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 添加公钥到服务器

切换回客户端，拷贝客户端公钥到服务器的`authorized_keys`文件：

```bash
cat ~/.ssh/id_rsa.pub | ssh harttle@harttle.com 'cat >> .ssh/authorized_keys'
```

现在服务器拥有你的公钥了，再次登录服务器时服务器不会再询问你的密码了：

```bash
ssh harttle@harttle.com
```

## 客户端配置

客户端配置可以方便SSH连接过程。上述代码中连接到`harttle.land`并不困难，
但是如果你的服务器自定义的端口，或者需要自定义私钥路径，或者要X Forward，
这个连接命令就复杂了：

```bash
ssh -i /home/harttle/.ssh/id_rsa_another -p 2222 -X harttle@harttle.com
```

```
Host harttle
    IdentityFile /Users/harttle/.ssh/id_rsa_another
    Port 2222
    ForwardX11 yes
    User harttle
    Hostname harttle.land
```

注意X11转发需要服务器端设置（`/etc/sshd_config`文件）：

```
AllowTcpForwarding yes
X11Forwarding yes
```

[systemd-node]: /2016/08/04/systemd-nodejs-app.html
[shell]: /2016/06/08/shell-config-files.html
