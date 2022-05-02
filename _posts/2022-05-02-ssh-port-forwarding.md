---
title: SSH 配置端口转发
tags: SSH 端口转发 SOCKS
---

SSH 隧道或 SSH 端口转发可以用来在客户端和服务器之间建立一个加密的 SSH 连接，通过它来把本地流量转发到服务器端，或者把服务器端流量转发到本地。比如从本地访问服务器上的 MySQL 管理后台，或者把本地的串流、SMB、CIFS 等服务暴露在服务器所在的公网。本文将介绍 SSH 隧道的本地端口转发、远程端口转发等使用方式，以及如何配置 SSH 允许长连接、开机时自动建立连接。

<!--more-->

## 本地端口转发

本地端口转发用于把本地机器（SSH 客户端）的端口转发到服务器（SSH 服务器），然后发给目标机器的某个端口。比如在 Linux、MacOS 等 Unix 系统上，可以通过 `-L` 参数来做本地端口转发。

```bash
ssh -L [LOCAL_IP:]LOCAL_PORT:DESTINATION:DESTINATION_PORT [USER@]SSH_SERVER
```

这时 SSH 客户端会监听本地的端口 `LOCAL_PORT`，把所有发给改端口的 TCP 连接都发给指定的服务器，然后再连接到目标机器。这个目标机器通常是服务器自己，也可以是任何其他机器。在目标机器看来，这个请求来自 SSH 服务器，相当于连到了服务器的内网。

例如服务器在 `localhost:33062` 上运行着 MySQL 的管理后端，暴露给公网会不够安全，这时就可以把本地 `8080` 端口转发给服务器的 `33062`：

```bash
ssh -L 8080:localhost:33062 harttle@mysql.example.com
```

然后在本机访问 `http://localhost:8080` 就可以了。注意上述命令省略了本地 IP，默认本机所有 IP 都可以访问。注意这个命令会像往常一样，登录到服务器端的 Shell。如果只用来端口转发可以指定 `-N` 参数：这样会启动一个阻塞的进程，直到 Ctrl-C 手动终止掉。

## 远程端口转发

远程端口转发和本地端口转发正好相反，用来把服务器（SSH 服务器）上的某个端口转发到本地机器，再转发给对应的服务。通常用于把本地机器的服务暴露给外网使用。

```bash
ssh -R [REMOTE:]REMOTE_PORT:DESTINATION:DESTINATION_PORT [USER@]SSH_SERVER
```

这时 SSH 服务器会监听发往 `REMOTE_PORT` 上的请求，转发到本地机器，再发给 `DESTINATION` 机器的 `DESTINATION_PORT` 端口。例如本地有一个 Plex 媒体串流服务，希望在外网也可以访问。恰好有一台外网可以访问的服务器 `example.com`，那么可以：

```bash
ssh -R 8080:localhost:32400 harttle@example.com
```

然后本地的 Plex 服务就可以在外网通过 `example.com:8080` 来访问了。注意 `32400` 是 Plex 服务启动时绑定的端口，`localhost` 是 Plex 服务绑定的域。这里也没有指定远程的 `REMOTE`，意味着可以通过远程机器的所有 IP 访问。否则如果指定了 `localhost`（注意这是 `REMOTE` 的域），则只能在服务器上通过 `localhost` 来访问，不能通过服务器的外网 IP 来访问了：

```bash
ssh -R localhost:8080:localhost:32400 harttle@example.com
```

`REMOTE` 在一台服务器上运行着多个域名时会比较有用，比如你可以分别绑定 `plex.example.com:8080` 到本地的 Plex 服务，同时绑定 `smb.example.com:8080` 到本地的 SMB 服务。

## 动态转发 / SOCKS 服务

利用 SSH 端口转发可以实现一个 SOCKS 服务，例如当本地浏览 google.com:80 网页时，把这一对 `DESTINATION:DESTINATION_PORT` 发往本地的 `[LOCAL_IP:]LOCAL_PORT`。由 SSH 隧道转发到服务器端，从 SSH 服务器发起对 `DESTINATION:DESTINATION_PORT`（即 google.com:80）的请求，就实现了网络代理（注意不要用本手段科学上网，100% 概率会被封禁服务器 IP，谨慎尝试）。

由于不同网站的域名和端口（`DESTINATION:DESTINATION_PORT`）是不同的，因此不能像本地端口转发那样在写在命令参数里。这就需要“动态转发”，即 `-D` 参数：

```bash
ssh -D [LOCAL_IP:]LOCAL_PORT [USER@]SSH_SERVER
```

例如 `ssh -D localhost:8080 harttle@example.com` 即可在本地开启一个 SOCKS 协议的代理，代理地址即为 `localhost:8080`。

## SSH 配置

无论是本地端口转发还是远程端口转发，都需要在服务器上配置 `/etc/ssh/sshd_config`：

```
GatewayPorts yes
```

如果长时间保持连接，那么还需要开启：

```
TCPKeepAlive yes
```

顾名思义 `TCPKeepAlive` 运行在 TCP 层，通过发一个空包来保持连接。如果你的服务器有复杂的防火墙，或者本地所在的网络运营商比较奇怪，这个包可能会被丢掉。这时可以用 `ServerAliveInterval 60` 来在 SSH 协议一层保持连接。方便起见这些参数也可以在建立连接时指定，比如：

```bash
ssh -L 8080:localhost:33062 harttle@mysql.example.com -o TCPKeepAlive=true ServerAliveInterval=60
```

也可以装一个 autossh 包，让它来托管 ssh 服务，这样会更稳定：

```bash
autossh -NR 8080:localhost:32400 harttle@example.com
```

以上 ssh 命令都可以在 Linux 或 MacOS 下工作，如果在 Windows 下也有其他的选择。比如你安装了 WSL，那么可以在 WSL 里执行上述命令。也可以安装一个 SSH 客户端，比如在 PuTTY 下可以在“连接->SSH->隧道”里相应地设置本地和远程端口、IP。

关于开机自动建立隧道，在 Linux 下可以把上述命令直接写成一个 systemd 脚本，可参考 [使用 systemd 管理 Node.js 应用](https://harttle.land/2016/08/04/systemd-nodejs-app.html) 一文；在 Windows 下可以利用任务计划程序建立一个任务，如果本地安装有 WSL，可以添加一个 Action 设置命令为 `wsl` 参数为 `autossh -NR 8080:$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):32400 example.com`。注意 WSL2 启用了 HyperV 运行在某个子网下，宿主机器的 IP 是不确定的，需要用 `cat /etc/resolv.conf | grep nameserver | awk '{print $2}'` 来获得 WSL 宿主机器的 IP。