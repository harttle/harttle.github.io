---
title: 利用 Plex 和 Syncthing 搭建媒体中心
tags: Archlinux SSH systemd 多媒体
---

因为软件都是[朋友][oott]介绍的，这篇文章本来是不打算写的。
但由于在坑上浪费不少时间还是写出来或许对新接触 NAS 的人有所帮助。
本文记录如何利用 [Plex][plex] 和 [Syncthing][syncthing] （可以用FTP替代）搭建家用 NAS，具体地实现了这些功能：

* P2P 的文件备份。
* DLNA 媒体服务。
* 随时上传媒体文件。

笔者的设备：Acer 笔记本（[Archlinux][arch]），小米 TV（Android）。
可能和您的设备有所区别，但原理类似。我了解到即使对 Windows 版本，用户和权限等策略都是一样的。
或者你可以 [安装一个 Arch][arch-install]。

<!--more-->

## 软件介绍

* [Plex][plex] 是一套软件，包括媒体服务器、Android 等终端设备 App。支持转码和基于元数据的分类，以及播放时选择不同的码率。

* [Syncthing][syncthing] 开放的，去中心化的文件同步软件。P2P 的机制很厉害，居然在公司可以与家里的内网服务同步。

* [systemd][systemd] 是 Linux 下很先进的守护进程管理工具，使用方式很简单。一个简单的使用例子可以参考这篇文章：[使用systemd管理Node.js应用](/2016/08/04/systemd-nodejs-app.html)

## 搭建 Syncthing 服务

Syncthing 有很多 binary 可以下载，可以挑一个合适的下载安装即可。Archlinux 可以从 AUR 安装：

```bash
yaourt -S syncthing
```

用 `systemd` 启动服务：

```bash
systemctl start syncthing@harttle.service
systemctl enable syncthing@harttle.service
```

`@harttle` 后缀让它工作在 harttle 用户下，需要改成你的系统用户名。
这样 Syncthing 创建的文件拥有 harttle 用户的默认权限，Owner 为 `harttle:users`。

启动后可以访问 <localhost:8384> 来使用服务。你需要在每台设备上都安装 Syncthing，
让它们交换 ID 后即可互相同步文件。备份策略和共享目录都可以在 Web UI 上设置。
如果你的服务像 [Harttle](/) 一样启动在远程服务器上，可以借助 SSH 把 Web UI 的端口 Forward 到本地：

```bash
# 用你的服务器地址
ssh 192.168.1.xx -L 8384:localhost:8384
```

然后访问本地的 <localhost:8384>。后面的 Plex Web 端口也是一样，不再赘述。

## 搭建 Plex 服务

同样地，安装 [AUR plex][aur-plex] 并启动：

```bash
yaourt -S plex-media-server
systemctl start plexmediaserver
systemctl enable plexmediaserver
```

为了让 Plex 可以读写 Syncthing 的文件，需要让 Plex 也运行在 `harttle` 用户。
需要做下面的两件事情。

### 1. 更改启动用户

编辑 Systemd Unit 文件 `/etc/systemd/system/multi-user.target.wants/plexmediaserver.service`，把 User 和 Group 改成你的：

```
[Service]
User=harttle
Group=users
```

### 2. 更改运行时文件权限

由于我们更改了 Plex 启动用户，也需要相应更改 Plex 的工作区目录 `/var/lib/plex`。
这个目录的 Owner 应当与启动用户一致，否则无法正常启动。
如果你的目录不是这个，可以从 Systemd Unit 文件中的配置一路追踪到这个目录。

```bash
chown harttle:users -R /var/lib/plex
```

日志文件也在这里，可以用来调试：`/var/lib/plex/Plex\ Media\ Server/Logs`。
然后重启 Plex 的 Systemd Unit：

```bash
systemctl daemon-reload
systemctl restart plexmediaserver
```

访问 `localhost:32400` 即可进行媒体内容和目录的管理。
要借助 Syncthing 上传到 Plex，只需要把 Syncthing 和 Plex 目录设成一样的，
上传 Syncthing 结点的对应文件夹的模式设为仅发送，接收侧勾选`ignoreDelete`（在右上角高级设置，对应的文件夹选项中）。

## 客户端

如果你从局域网其他机器也可以访问 Plex Media Server 就说明服务已经成功启动了。
在启动 Plex 后就可以从小米电视访问 DLNA 服务了。安装 Plex Android 客户端后会更容易使用，从这里下载：
<https://www.apkmirror.com/apk/plex-inc/plex/>。附使用截图：

![plex dashboard](/assets/img/blog/plex@2x.png)

[plex]: https://www.plex.tv/zh/
[oott]: https://best33.com/
[syncthing]: https://syncthing.net/
[aur-plex]: https://wiki.archlinux.org/index.php/Plex
[arch]: https://www.archlinux.org/
[arch-install]: /2013/11/07/arch-install.html
[systemd]: https://wiki.archlinux.org/index.php/systemd
