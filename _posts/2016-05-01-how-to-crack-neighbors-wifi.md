---
title: OSX/iOS进行Safari联调破解Wifi密码
tags: Safari iframe DOM JavaScript Wifi iOS 路由
---

五一假期来点黑科技:)，从技术角度介绍破解Wifi密码的通用方法。
也对如何破解/防止破解Wifi的问题做些科普。
同时也对Safari的Mac/iPhone联调功能稍作介绍。

> 一般来讲除非邻家有程序员，破解邻家Wifi密码并非难事。

<!--more-->

## 通用破解步骤

像我们这样的小白破解Wifi密码一般分两步走，首先接入网络，然后查看密码。
接入网络的方法大概只有两种：

1. 想办法让邻居给自己的一台设备先接入目标网络；
2. 通过知识共享类软件如Wifi万能钥匙直接接入目标网络。

查看既有连接的密码也有多种方式：

1. 通过移动设备软件进行查看。需要该软件具有Root权限，如果是iPhone需要越狱。
2. 通过局域网路由管理页面进行查看或调试。

本文以小编的本次破解过程为例：
小编家人有一台iPhone（半个果粉，未越狱）已接入目标网络，
为了让家里都上网并有良好信号，需要家里路由器桥接到邻家路由，
说到底就是需要明文密码。

## 登录路由器

既然已经接入目标网络，可以通过局域网地址访问路由管理页面。
一般是`192.168.1.1`，不同产品也可能不同百度一下即可。

> 很容易通过SSID名（Wifi网络名称）获得其路由器产品信息，例如：
> TPLINK-XX一定是TPLink，Tenda-XX一定是Tenda。

除非邻家有程序员，否则路由器密码一定是`admin:admin`，
或者其他产品的默认密码。
至此已经可以随意对该路由器进行SSID、密码等进行设置了。

小编的问题在于，管理页面上Wifi密码并未明文显示，小编也不好意思直接把人密码改掉。
如图：

![router admin](/assets/img/blog/router-admin@2x.jpg)

## Mac调试iPhone页面

恰好小编是做Web前端的，网页上密码状的东西其实都是明文，可通过DOM API来访问。
问题在于小编只有这台iPhone接入了目标网络，如何调试JavaScript呢？
Safari支持OSX/iOS联调，需要进行一些设置：

* iOS：设置->Safari->高级->Web检查器->开
* OSX：Safari->偏好设置->高级->在菜单栏中显示开发菜单

然后在iPhone中保持该页面打开，在Mac中点击Safari菜单栏->开发->harttle's iPhone->192.168.0.1。
此时便可以调试iPhone中的页面：

![safari debug](/assets/img/blog/safari-iphone-wifi-debug.jpg)

## DOM API获取密码

经过分析发现密码输入框`<input type="password">`位于一个iframe下，难道是为了某种安全性？
不过小编发现该Iframe与主DOM是同域的，Iframe中的DOM仍然可以访问。

获取一个`<input>`的值对前端狗来讲不能再简单了！虽然存在Iframe的阻隔：

```javascript
ifr = document.getElementsByTagName('iframe')[0]
ifr.contentDocument.getElementsByTagName('passphrase')[0].value
```

> 关于获取Iframe DOM的方法可参考[为Iframe注入脚本的不同方式比较][ifr-injection]一文。

控制台便出现明文密码了！见上图。

[ifr-injection]: /2016/04/14/iframe-script-injection.html
