---
title: 用 Linux 做 WiFi 热点
tags: Linux iptables dnsmasq WiFi 路由
---

本文介绍如何在 Linux 下开一个 WiFi 热点，把有线网络共享给其他移动设备。相比于路由器，用 Linux 做路由不仅可以高度定制局域网的拓扑结构，而且可以更网络管理更灵活。
需要至少两块网卡，其中无线网卡用来开热点，有线网卡作为网络出口。

> 可以通过 `ip addr` 来查看网卡接口，比如我的无线网卡接口叫 `wlp13s0`，有线网卡接口叫 `enp14s0`。

我们需要把无线网卡设置到 AP 模式，并作为子网的网关。在 Linux 上提供 DHCP 服务给子网提供 IP 配置，再把子网的流量转发给有线网卡。

<!--more-->

## 子网配置

先给无线网卡 `wlp13s0` 设置 IP 为 `192.168.3.1`，掩码为 `255.255.255.0` 作为子网的路由：

```bash
ifconfig wlp13s0 up 192.168.3.1 netmask 255.255.255.0 broadcast 192.168.3.255
```

和 `ip` 命令对应，`ifconfig` 和 `iwconfig` 可以用来操作无线网络。更方便的方式是用 [NetworkManager](https://wiki.archlinux.org/title/NetworkManager)，它有个 `nmcli` 来提供命令行接口，更方便的方式是通过 `nmtui` 来可视化地配置。

## DHCP 服务

DHCP（[RFC 2131](https://www.ietf.org/rfc/rfc2131.txt)）服务为子网中的设备提供网络配置，这些配置里指定了 IP、网关、路由、DNS 等参数，让这些设备路由到无线网卡的 IP `192.168.3.1`。 `dpcpd` 服务由`dhcp` 软件包提供，配置在 `/etc/dhcpd.conf`：

```bash
ddns-update-style none;
ignore client-updates;
subnet 192.168.3.0 netmask 255.255.255.0 {
    range 192.168.3.128 192.168.3.254;
    option domain-name-servers 8.8.8.8, 8.8.4.4;    #google dns
    option routers 192.168.3.1;
}
```

这里我们可以设置多个子网，之后对不同子网采取不同的转发策略，也可以在这里给某些 MAC 地址绑定静态 IP。MAC 地址可以用 ARP 协议（`arp <IP>`）得到，参数 IP 可以通过 `nmap -sn 192.168.3.0/24` 来扫描。

配置好后就可以调用 `/usr/bin/dhcpd -4 wlp13s0` 来启动 dhcpd 服务了，有 `systemd` 的系统中，可以用 `systemctl` 来启动。如果你的 dhcp 软件没有提供 systemd 脚本，可以自己制作一个，写到文件 `/etc/systemd/system/dhcpd4@.service` 中：

```
[Unit]
Description=IPv4 DHCP server on %I
Wants=network.target
After=network.target

[Service]
Type=forking
PIDFile=/run/dhcpd4.pid
ExecStart=/usr/bin/dhcpd -4 -q -pf /run/dhcpd4.pid %I
KillSignal=SIGINT

[Install]
WantedBy=multi-user.target
```

然后在 `wlp13s0` 上启动它！

```bash
systemctl start dhcpd4@wlp13s0.service
```

如果启动成功的话，我们来查看DHCP服务的通信：

```bash
$ tcpdump -i wlp13s0 -n port 67
... IP 0.0.0.0.68     > 255.255.255.255.67: BOOTP/DHCP, Request from 1c:65:9d:07:32:63 ...
... IP 192.168.3.1.67 > 192.168.3.128.68:   BOOTP/DHCP, Reply, length 548
```

> 第一行中，不知到自己 IP（全 0 地址）的客户端发送DHCP广播（全 1 地址），DHCP客户端端口为 68，服务器端口为 67。
> 第二行中，服务器（我们的 Linux 主机）回复 DHCP 报文，客户端得到 `192.168.3.128` 的 IP。此时客户端采用了 `dhcpd.conf` 中提供的配置。

参见 [dhcpd-archwiki](https://wiki.archlinux.org/index.php/Dhcpd)。

## 开启 IP 报文转发

上述的DHCP服务将客户端的路由设置到了 `192.168.3.1`，该 IP 位于 `wlp13s0` 上。现在要对到来的 IP 报文进行 NAT 地址转换，并转发到出口网卡 `enp14s0` 上。需要先更改内核参数允许 IP 转发（默认情况下允许 INPUT 和 OUTPUT，不允许 FORWARD）：

```bash
sysctl net.ipv4.ip_forward=1
```

要持久化，需要在 `/etc/sysctl.d/30-ipforward.conf` 中增加：

```bash
net.ipv4.ip_forward=1
```

## 子网开启 NAT 地址转换

子网设备需要共享入口无线网卡，需要通过 `iptables` （来自 `iptables` 软件包）启动 NAT 地址转换，将局域网 Socket 映射到出口 Socket。

```bash
# 网卡间转发
iptables -A FORWARD -i wlp13s0 -o enp14s0 -j ACCEPT
# 采用 conntrack 模块来允许 ICMP
iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
# NAT
iptables -t nat -A POSTROUTING -o enp14s0 -j MASQUERADE
```

至此，就已经把有线网络 `enp14s0` 的网络共享给了 `enp14s0` 上的子网，可以拿出手机来连接一下热点试试了。

## iptables 持久化

`iptables` 配置在重启后会丢失，一个办法是把它存下来，并在开机时加载。通过 `iptables-save` 获取当前配置并存到 `/etc` 下：

```bash
iptables-save > /etc/iptables/iptables.rules
```

在 ArchLinux 下启动 `iptables` 服务，它在启动时会自动读取 `/etc/iptables/iptables.rules`：

```bash
systemctl start iptables.service
```

参考 [iptables-archwiki](https://wiki.archlinux.org/index.php/Iptables)。有的发行版中 `iptables` 服务不会做这个工作，比如 Ubuntu 中需要另一个叫做 `iptables-persistent` 的包来加载配置。
