---
title: 树莓派搭建 HomeKit 服务
tags: GPIO Node.js UART HomeKit Raspberry
---

最近总有朋友问我 Apple Home 是怎么搭建的，这篇文章提供给从零开始搭建 Apple Home 的朋友。
可以自选传感器、空气净化器、以及智能开关等设备，通过树莓派接入到苹果内置的 Home 应用中。
大概是这样的效果：

![home](/assets/img/blog/iot/homekit@2x.png)

<!--more-->

# 原理介绍

从 iOS 8（2014年9月）开始，苹果内置了[名为 Home 的应用][home]，让 iPhone/iPad 可以控制智能设备。
设备间通信采用基于 HTTP（视频相关是 RTCP）的控制协议，叫做 HomeKit，协议标准可以在 Apple Developer 网站下载到：<https://developer.apple.com/homekit/specification/>。

HomeKit 是苹果设备之间的协议，只要你买的设备支持 HomeKit，就可以直接连接到 Apple Home。
比如这个灯泡：<https://www.amazon.com/Philips-Equivalent-Dimmable-Compatible-Assistant/dp/B073SSK6P8>
但现支持 HomeKit 的设备在国内很少能买到，所以我们需要把普通设备桥接到 HomeKit 协议上。

这就需要 [homebridge][homebridge]，这是一个基于 Node.js 的服务器，可以与 iPhone/iPad 进行 HomeKit 协议的通信，同时可以载入控制各种设备的插件。我们只需要选取合适的插件，或者开发一个控制自己设备的插件即可。示意图：

![home](/assets/img/blog/iot/homebridge@2x.png)

# 准备材料

* 任意一台 iOS 设备，如果需要远程操作，需要有一台 Apple TV, HomePod, 或 iPad 放在家里。
* 一个树莓派，或者可以 24h 常开的 PC。如果使用 PC 需要 UART -&lt; USB 转接器来连接 UART 传输协议的设备。
* 树莓派镜像，可以在官网下载得到：<https://www.raspberrypi.org/downloads/>。
* 智能开关、小米空气净化器、可连接 GPIO 的传感器。

选择智能设备时，可以先在 npm 上查找是否存在对应的插件：
<https://www.npmjs.com/search?q=homebridge> 。
对于可以遥控的非智能设备，可以通过空调伴侣来控制它，而空调伴侣是有 homebridge 插件的。
理论上可以控制任何红外线控制的设备。

# 硬件组装

[Harttle](/) 有一台[小米空气净化器](https://www.mi.com/air2/)、
一个 [PMS5003ST](http://www.plantower.com/content/?95.html) 传感器、
一个 [DS-CO2-20](http://www.plantower.com/content/?99.html) 传感器。

## 空气净化器

我有一个2代的小米空气净化器：<https://www.mi.com/air2/>。
它本身就是智能设备，只是不支持 HomeKit。
我们保证它连接到局域网即可，不需做任何改造。

## PMS5003ST

攀藤科技的 PMS 系列的产品都是 PM2.5 检测器，5003ST 集成了温湿度、甲醛传感器。
该传感器采用 UART 协议传输数据，正好 Raspberry Pi 3 提供了一个板载 UART 模块。
把它的 RX、TX 分别连接到 Raspberry 的 GPIO 14 (TX), GPIO 15 (RX)，
再把 GND 和 POWER 连接到 Raspberry 上对应的 GPIO 即可。

其中 RX 可以不连，因为数据默认是被动接收的，不需要控制命令。
Raspberry 的 GPIO 接口可以参考官方文档：<https://www.raspberrypi.org/documentation/usage/gpio/>

## DS-CO2-20

这也是攀藤科技的产品，用来测量 CO2 浓度的，自然的值是 500ppm，室内略高，到 800ppm 会感到困。
可以用这个值设置一个报警，提醒 Harttle 及时通风。

DS-CO2-20 也是 UART 协议，但树莓派3只有一个硬解码 UART。选项有两个：

1. 软解码。找一个 GPIO 的库（最好用 C++ 版本的），按文档设置好波特率，就可以解码了。因为攀藤科技的数据包都有校验字节，所以软解码错的直接丢掉就好了。然后可能需要自己写 homebrew 插件。
2. 转换器。买一个 UART -&lt; USB 转换器，接到 Raspberry Pi 的 USB 接口上面。这样就相当于多了一个 UART 接口。Harttle 选择的是这个办法。

DS-CO2-20 的数据是被动的，需要发命令给它才会发数据，所以 RX 和 TX 都要连接。

## 组装图

附上 Harttle 的组装效果图：

![home](/assets/img/blog/iot/pi@2x.jpg)

其中蓝色的块是 PMS5003ST，银色的块是 DS-CO2-20，插在一个转接口上。

# 软件

先安装 Node.js：<http://nodejs.org>

依次安装 homebridge, homebridge-mi-air-purifier, homebridge-plantower

```bash
npm install -g homebridge homebridge-mi-air-purifier homebridge-plantower
```

根据 homebridge 给出的 [示例配置文件][config] 创建你的配置文件，可能需要参考以下文档：

* homebridge: <https://github.com/nfarina/homebridge>
* homebridge-mi-air-purifier: <https://github.com/seikan/homebridge-mi-air-purifier>
* homebridge-plantower: <https://github.com/willnewii/homebridge-plantower>

配置好之后，就可以启动 homebridge 啦：

```
$ homebridge
```

可以 [为它创建一个 systemd 配置](/2016/08/04/systemd-nodejs-app.html)，让它开机自启。
然后把树莓 Pi 放到黑暗的角落，让它默默地工作。这是我的 Pi 的工作环境：

![home](/assets/img/blog/iot/pi-the-dark@2x.jpg)

红色灯是电源，会闪动的黄色灯是 CO2 传感器，蓝色灯是 CO2 传感器的转接头。

# 远程操作和隐私

Home 数据虽然是通过 HomeKit 在局域网传输的，但必须开启 iCloud 才可用 Home App，
这意味你的数据一定会流经 iCloud（云上贵州？），因而完全可以远程操作。

**关于共享**。
在 App 中可以邀请其他 Apple 账号。邀请成功后他/她会加入你的家庭，共享所有数据。
App 内的自动化选项卡中，可以设置诸如“最后一个人出门”的规则，依靠的就是家庭成员的 Apple 账号各自的地理位置信息。

[homebridge]: https://github.com/nfarina/homebridge
[home]: https://www.apple.com/ios/home/
[config]: https://github.com/nfarina/homebridge/blob/master/config-sample.json
