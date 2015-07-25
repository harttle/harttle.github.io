---
layout: blog
categories: linux
title: Linux做局域网路由
subtitle: linux网络调试与IP层服务器假设
redirect_from:
  - /linux/linux-route.html
  - /2014/10/08/linux-route/
tags: network linux ip/tcp
---

局域网基本都是通过路由器来接入Internet，其中的路由器提供了众多的功能与服务。不妨用linux做局域网的路由，开启DHCP服务、IP转发、HTTP代理。这样不仅可以高度定制局域网的网络结构，而且可以实时监测局域网流量。

现在来让linux主机转发局域网流量，并设置代理对http数据进行有趣的修改。

> 以下以我使用的linux发行版`ArchLinux`为例，并忽略了发行版相关的软件安装过程。我的linux有两块网卡，无线网卡`wlp13s0`用于开通子网，有线网卡`enp14s0`作为出口。

# DHCP

DHCP是为客户端提供网络配置的服务器（[RFC 2131](https://www.ietf.org/rfc/rfc2131.txt)）。我们用它来配置局域网内的主机，让它们从我的linux主机路由。

> 局域网内是允许多个DHCP服务器的，它们会同时响应客户端请求，客户端决定并广播其采纳的配置。所以最好关掉局域网内其他的DHCP服务器，尤其是路由器的DHCP功能。

## 服务器配置

在配置DHCP服务器之前，我们需要为`wlp13s0`添加一个子网IP，该子网的地址提供给DHCP服务器。

```bash
ifconfig wlp13s0 up 192.168.3.1 netmask 255.255.255.0 broadcast 192.168.3.255
```

> 如果是要分享到有线网卡的话，可以使用`ip link <dev> up`启动，`ip addr add`分配地址；如果你的无线网卡支持`master`模式的话，甚至可以用它来开放热点（通过`iwconfig`设置wifi参数）。

确保安装了`dhcp`服务器软件，然后添加配置文件，让DHCP来分配上述的子网IP。

```bash
ddns-update-style none;
ignore client-updates;
subnet 192.168.3.0 netmask 255.255.255.0 {
    range 192.168.3.128 192.168.3.254;
    option domain-name-servers 8.8.8.8, 8.8.4.4;    #google dns
    option routers 192.168.3.1;
}
```

`domain-name-servers`也可以用本地（ISP）的DNS服务器（`/etc/resolv.conf`）。这里我们可以设置多个子网，之后对不同子网采取不同的转发策略。也可以设置静态IP，来确保某些机器位于某个子网中。

> 可以通过`nmap -sn 192.168.3.0/24`来扫描当前子网的主机IP；然后通过ARP协议（`arp <IP>`）得到其MAC地址。

## 服务器启动

为了使用方便，我们为DHCP制作一个`systemd`服务（类似于其他发行版的`init.d`服务）：

> 当然也可以直接调用`/usr/bin/dhcpd -4 wlp13s0`来启动。

```
 file: /etc/systemd/system/dhcpd4@.service
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

然后，在`wlp13s0`上启动它！

```bash
systemctl start dhcpd4@wlp13s0.service
```

如果启动成功的话，我们来查看DHCP服务的通信：

```bash
$ tcpdump -i wlp13s0 -n port 67
... IP 0.0.0.0.68     > 255.255.255.255.67: BOOTP/DHCP, Request from 1c:65:9d:07:32:63 ...
... IP 192.168.3.1.67 > 192.168.3.128.68:   BOOTP/DHCP, Reply, length 548
```

> 第一行中，不知到自己IP（全0地址）的客户端发送DHCP广播（全1地址），DHCP客户端端口为68，服务器端口为67。
> 第二行中，服务器（我们的linux主机）回复DHCP报文，客户端得到`192.168.3.128`的IP。此时客户端采用了`dhcpd.conf`中提供的配置。

参见：[dhcpd-archwiki](https://wiki.archlinux.org/index.php/Dhcpd)


# IP转发

上述的DHCP服务将客户端的路由设置到了`192.168.3.1`，该IP位于`wlp13s0`上。现在要对到来的IP报文进行NAT地址转换，并转发到`enp14s0`（拥有我们的出口IP）上。

## 允许IP转发

默认情况下，有线网卡只允许`INPUT`和`OUTPUT`流量，现在启用`FORWARD`流量以允许IP转发：

```bash
sysctl net.ipv4.ip_forward=1

 来看一下，确实变了
sysctl -a | grep forward
```

如果想让它重启后也生效，可以写入`sysctl`的配置文件：

```bash
 file: /etc/sysctl.d/30-ipforward.conf
net.ipv4.ip_forward=1
net.ipv6.conf.default.forwarding=1
net.ipv6.conf.all.forwarding=1
```

## 启动NAT

这里我们通过`iptables`启动NAT地址转换，将局域网IP映射到出口IP。

> NAT可以让多个主机使用同一出口IP。使用常用的NAT地址转换策略是将内网的IP+端口映射到TCP或UDP包的源端口，Internet返回的包则进行反向转换发给内网IP。

```bash
 网卡间转发
iptables -A FORWARD -i wlp13s0 -o enp14s0 -j ACCEPT
 采用conntrack模块来允许ICMP
iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
 NAT
iptables -t nat -A POSTROUTING -o enp14s0 -j MASQUERADE
```

## 转发到代理

上述的`iptables`配置已经可以形成完整的局域网路由。而`iptables`的功能远不局限于此，不仅可以做端口转发、子网识别、IP过滤，还有很多的扩展模块可以用，上面提到的`conntrack`就是其中一种。

该步骤继续配置`iptables`，把子网`192.168.3.0/24`来的IP报文转发到我们的代理或者web服务器。

```bash
 转发至web服务器
iptables -t nat -A PREROUTING -s 192.168.3.0/255.255.255.0 -p tcp -j DNAT --to-destination 192.168.3.1

 也可以转发到代理
 iptables -t nat -A PREROUTING -s 192.168.3.0/255.255.255.0 -p tcp --dport 80 -j DNAT --to-destination 192.168.3.1:3128
```

## 启动iptables

可以将`iptables`配置写入文件，该文件在`iptables`启动和重新载入时都会读取：

```bash
iptables-save > /etc/iptables/iptables.rules
```

启动`iptables`：

```
systemctl start iptables.service
```

参考：[iptables-archwiki](https://wiki.archlinux.org/index.php/Iptables)

# Web服务器

上述的`iptables`可以将子网中的IP报文转发到代理服务器，例如`squid`就是一个很好的选择。`squid`可以调用子程序来进行重定向、url重写等。

> `squid`使用`redirect_program`时，可以设置不重写HTTP头部！这样用户不会知道自己被重定向！

为了操作方便，我们使用一个web服务器来充当代理的功能。使用`nodejs`来运行下面这个简易的服务器：

```javascript
// file: proxy.js
var http = require('http')
http.createServer(function(req,res){
  if(/.*\.(jpg)|(png)|(gif)/.exec(req.url))
    var uri="http://h.hiphotos.baidu.com/image/pic/item/2fdda3cc7cd98d10764c38ad233fb80e7aec9095.jpg"
  else
    var uri='http://'+req.headers.host+req.url

  console.log('get: '+uri)
  http.get(uri, function(r) {
    res.writeHead(200,r.headers)
    r.on('data', function(chunk){ res.write(chunk) })
    r.on('end',  function(){ res.end()})
  })
  .on('error',function(e){ console.log(e.message) })
  
}).listen(80,'192.168.3.1')

console.log('server running at 192.168.3.1:80')
```

跑起来！

```bash
# 注意：绑定80端口需要管理员权限
sudo node proxy.js
```

该服务器只对`GET`进行处理，将所有的图片请求都重定向到百度图片的`...0905.jpg`。这样，位于`192.168.3.0/24`子网下的主机在上网时都会有神奇的体验！

> 这个简单的代理可以添加更多的功能，例如：将`Content-Tye: text/html`的`data`（需要探测字符集）拿出来，更改页面逻辑后再返回。

