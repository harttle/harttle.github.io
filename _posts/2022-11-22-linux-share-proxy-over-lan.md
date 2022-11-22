---
title: Linux 下共享代理到局域网
tags: Linux iptables ipset 路由 redsocks
---

这个博客在八年前分享过 [用 Linux 做 WiFi 热点](https://harttle.land/2014/10/08/linux-route.html)，今天的设备和软件已经完全不同了。可以很方便地做曾经很复杂的事情，同时这个世界也更复杂了。现在我们要实现的是 **把代理分享给局域网，连上 WiFi 即连上了代理**。

这件事最简单的办法是直接刷一个 OpenWrt，较为复杂的办法是刷一个 unRaid、PVE 或 ESXi 上面装一个 OpenWrt，最复杂的办法是在 ArchLinux 里手动配各种服务。本文就来介绍这个最复杂的办法。因为一来笔者更熟悉这老旧的东西，Linux 不需要赶潮流也能用得很好，即便几十年前的 Linux 技术今天仍然管用；二来手动搭建起来虽然麻烦，但是单 OS 的架构比较简单，后期维护时不容易忘掉。整个架构的思路大概是：

1. 把 SOCKS5/HTTP 代理转成一个透明代理。流量发给它就能走 SOCKS5。
2. 配置 DHCP 服务器，把网关和 DNS 设置为这台机器。本机的 DNS 走 DoH 或 DoT 到上游。
3. iptables 把局域网的流量转发给 redsocks。
4. 这样默认所有局域网流量都去代理了，可以加一个 ipset 规则来让做黑名单不走代理。

<!--more-->

## 约定

下文为了方便描述，做如下约定：

- 本机：是指我们这一台用来做路由的 Linux 机器。
- 接口：interface，指 IP 层的接口，可以通过 `ip addr` 查看它们的信息。
- 本地网段为 `192.168.1.1/24`，本机的本地环回（localhost）接口为 `lo`。
- 我的发行版为 ArchLinux，软件包名为 AUR 或 pacman（没有区分）的包名。
- 有些命令需要管理员权限，你可以 `sudo`，也可以以管理员身份来操作。行文中忽略。
- systemd 服务（比如 redsocks）设置开机启动需要 `systemctl enable redsocks`。下文只管启动，比如 `systemctl start redsocks`。

## SOCKS5 转透明代理

这里选用 [redsocks](https://github.com/darkk/redsocks) 来实现，它不仅可以接 SOCKS5 代理，HTTP 代理也可以。安装软件包 redsocks 并配置 `/etc/redsocks.conf`。几个重要的选项如下：

```
redsocks {
    // redsocks 服务的套接字
    local_ip = 0.0.0.0; // 设置为 `0.0.0.0` 较为方便，也可以 iptables 多一次转发给 `lo`
    local_port = 31338;

    // 代理的套接字
    ip = 127.0.0.1;
    port = 8080;

    // 代理的类型: socks4, socks5, http-connect, http-relay
    type = socks5;

    // 代理的用户名密码，可选
    // login = "foobar";
    // password = "baz";
}
```

通过 `systemctl start redsocks` 启动。现在把 TCP 请求转发给这个任意接口（interface）的 local_port，这个请求就会走代理了。

## DHCP 网络配置

DHCP 服务是关键，它指定了局域网中的设备的 IP 和掩码、如何路由、去哪里访问 DNS。在本文的任务中，我们需要：

1. 让局域网的设备把网关（Gateway）设置为我们的 Linux 机器。
2. 为这些设备设置 DNS 为我们的 Linux 机器，并作为唯一的 DNS（很重要，见下文）。

> 这一设置可以在既有的路由器上设置，也可以关掉路由器的 DNS 服务，本机启动一个 dhcpd 可以参考 [这里](https://harttle.land/2014/10/08/linux-route.html)。

必须本地开启 DNS 服务是为了避免公网的 DNS 污染。这一点很重要，也是透明代理和浏览器代理（SOCKS5 或 HTTP）的区别：对于后者 DNS 发生在代理服务端，而对于前者 DNS 发生在客户端（也就是局域网的每一台机器上）。如果 DNS 返回的 IP 不正确，即使把流量倒给 redsocks 也无法得到正确的应答。

调试 Tips：

- 你可能需要时不时地清空 DNS 缓存，来反映最新的效果。Archlinux 上重启 nscd 即可，MacOS 上 `sudo killall -HUP mDNSResponder`，Android/iOS 上开关 WiFi 一次。
- 如果你怀疑得到的 IP 不正确，可以看看它在不在[这个列表](https://zh.m.wikiversity.org/zh/%E9%98%B2%E7%81%AB%E9%95%BF%E5%9F%8E%E5%9F%9F%E5%90%8D%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%BC%93%E5%AD%98%E6%B1%A1%E6%9F%93IP%E5%88%97%E8%A1%A8)里。

本地 DNS 服务需要监听端口 53（最原始的、明文的 DNS 服务），上游/upstream 需要是 TLS 或 HTTPS 加密的，这样可以确保（尽量）得到正确的（好很多的）IP。服务端软件有很多可以选，用 coredns 也行，用 dnsmasq + iplist 也行，也可以直接用 [cloudflared](https://wiki.archlinux.org/title/Cloudflared)。

## iptables 转发

安装软件包 iptables，转发局域网来的流量到 redsocks 服务。安装后先启动服务 `systemctl start iptables`，然后就可以改路由表了。下面的命令示意了重要的几个 iptables 规则，你可能需要适合自己系统的规则。在执行这些命令之前，你要掌握如何恢复 iptables 规则（重启是一种办法），iptables 配置错误可能导致立即断网（手边准备一台笔记本）。

```bash
# 创建一个 REDSOCKS_FILTER 规则链，用来过滤不走代理的流量
iptables -t nat -N REDSOCKS
# 创建一个 REDSOCKS 规则链，用来设置如何走代理
iptables -t nat -N REDSOCKS_FILTER

# REDSOCKS_FILTER 过滤发往内网的流量
iptables -t nat -A REDSOCKS_FILTER -d 0.0.0.0/8 -j RETURN
iptables -t nat -A REDSOCKS_FILTER -d 127.0.0.0/8 -j RETURN
iptables -t nat -A REDSOCKS_FILTER -d 192.168.1.1/24 -j RETURN
iptables -t nat -A REDSOCKS_FILTER -j REDSOCKS # 剩下的流量，进入 REDSOCKS 规则链

# REDSOCKS 把 TCP 流量发给 redsocks 服务，默认端口为 31338
iptables -t nat -A REDSOCKS -p tcp -j REDIRECT --to-port 31338

# 来自局域网的流量（由于 DHCP 配置了网关为本机，其他设备的流量因此会过来）
iptables -t nat -A PREROUTING -s 192.168.1.1/24 -p tcp -j REDSOCKS_FILTER

# 代理发出的流量，不应该再过 REDSOCKS 规则，不然就循环了
# 这里取决于你的代理发出的包应该怎么匹配，比如我的代理进程是用户 `proxy` 启动的，通过 `owner` 模块就可以匹配到
iptables -t nat -I OUTPUT -p tcp -m owner --uid-owner proxy -j RETURN
```

这样局域网的机器连进来（如果是 WiFi 网络的话），关掉自己的代理（如果有的话），清空自己的 DNS 缓存，就可以全局走本机的 SOCKS5 代理了。 注意 iptables 配置默认不会持久化，可以参考 [用 Linux 做 WiFi 热点](https://harttle.land/2014/10/08/linux-route.html) 一文。

## 设置 IP 黑名单

有些网站必须通过本地网络才能访问，走代理后会无法访问或访问速度很慢。我们需要让以这些 IP 为目的地的流量，不走代理。iptables 提供了一个 ipset 的模块，只需要安装 ipset 软件包并启动 `systemctl start ipset`。在路由表中用 `-m set --match-set <set name> dst` 来匹配目标 IP `dst` 是否在集合 `<set name>` 中。

```bash
# 我们的 set name 为 "blacklist"
iptables -t nat -A REDSOCKS_FILTER -m set --match-set blacklist dst -j RETURN
```

然后 `REDSOCKS_FILTER` 规则链就在帮我们过滤掉黑名单中的目标 IP 了，接下来就是这个名单如何生成的问题了。创建和生成名单很简单：

```bash
# 创建一个哈希类型的列表，只需要执行一次
ipset -N blacklist hash:net
# 添加一个 IP 到列表中
ipset -A blacklist 36.51.226.13
```

和 iptables 类似 ipset 也不会自动持久化，每次加完后可以把它存到 `/etc/ipset.conf`，下次启动时就会自动读取了。

```bash
ipset save > /etc/ipset.conf
```

也可以找一些靠谱的在线 IP 列表，加一个 [systemd timer](https://wiki.archlinux.org/title/Systemd/Timers) 去定时拉取。这样黑名单就可以定时更新了，更新脚本很容易写：

```bash
for addr in $$(curl http://example.com) # 换成你的 URL
do
    ipset -A blacklist $addr
done
```
