---
title: AIY Voice Kit 初体验
tags: Raspberry GPIO UART
---

[AIY Voice Kit][voice] 是 Google 自然语言识别的一个 Demo 项目，是一个由小纸盒包装的智能设备。
上个月朋友从美帝寄来一套，Harttle 却刚有时间把它组装起来，写这篇文章分享给喜欢折腾的同学。

Voice Kit 自带了麦克风和扬声器，借助 Google Assistant 可以实现类似 Siri 的人机对话，比如问问天气啊交通啊。
此外，由于整个系统基于 Raspberry Pi，而且配备了很棒的扩展板，比原生的 Pi 能做更多的事情。

<!--more-->

# Voice Kit 套装

整个套件由纸板包装，其中有一本很厚的小册子。介绍了详细的组装步骤，以及软件执行步骤。
搞定 Voice Kit 根本不需要会写代码，即使到最后的设备检查都可以通过鼠标双击来执行。

![the suite](/assets/img/blog/iot/the-suite@2x.jpg)

右侧那个就是安装手册。
盒子里包含了 Raspberry Pi 3、纸质外壳、按钮、Voice HAT、Mic Board，以及两条单独的排线。
见这张图（来自 aiyprojects.withgoogle.com 在线手册）：<https://aiyprojects.withgoogle.com/static/images/aiy-projects-voice/materials.jpg>

# Voice HAT 介绍

Voice HAT（Hardware Attached on Top）是插在树莓派板子上的扩展板，
语音和按钮等设备占用了 6 个 GPIO，其余都重新排列在板子上。
而且板子上设置了外接电源电路，借此同学们可以做很多事情。

下面仔细介绍一下这个板子，这张图来自 aiyprojects.withgoogle.com 官方：

![hat](/assets/img/blog/iot/sensors.jpg)

Voice Kit 设备本身占用了 6 个 GPIO：

GPIO | 用途
--- | ---
20, 21, 19, 16 | ALSA 驱动（I2S）
23	| 按钮状态
25	| LED 状态

传感器常用的 I2C, UART（14,15还特意分出来了再也不用去数了）, SPI 都没有占用。
更重要的是其余的 GPIO 分为两组并配备了电源接口，可以直接用作 GPIO，也可以控制外设：

1. Servo0-Servo5：5v/25mA，小电流的 Servo 适合连接类似 LED 之类的设备。 
2. Dirver0-Driver4：5v/500mA，可以连接功率更大的设备，+/- 极来自在板子左下角的外接电源。可以参考这个接法：<https://www.raspberrypi.org/magpi/motor-aiy-voice-pi/>

# 组装硬件

整个设备的核心是一个 Raspberry Pi-3，配备了一个扩展板（Voice HAT）用来连接音响和麦克风，都连接好后装入纸盒就完成了。

小册子介绍很详细，也可以在线查看： <https://aiyprojects.withgoogle.com/voice>。
所有接口焊接都很结实，几乎整个过程都可以徒手进行。Pi 的外壳需要用十字螺丝刀固定。
安装好后大概是这样的：

![assembled](/assets/img/blog/iot/assembled@2x.jpg)

HDMI、USB、电源口都可以从纸盒的空缺处连接，左侧是电源线和 HDMI，右侧是 Harttle 的 Low 逼键盘和罗技无线鼠标。

# 系统测试

插入 SD 卡后通电并使用 HDMI 连接到显示器后，如果进入了 Raspbian 经典的桌面说明 Raspberry Pi、SD 卡、电源都没有问题：

> 从 [这里](https://dl.google.com/dl/aiyprojects/vision/aiyprojects-2018-01-03.img.xz) 下载 Voice-Kit 镜像并烧录到 SD 卡。

![desktop](/assets/img/blog/iot/workspace@2x.jpg)

点击右上角的 Wifi 即可连接到网络，然后依次双击 Audio Check、Wifi Check 等快捷方式。
按照提示进行，网络和线路的检查。如果连接有问题就需要拆箱检查所有连接，尤其是插口是否正确。

# 软件准备工作

终于到了软件部分，在开始执行软件前还需要一些准备工作：

* 为了语音识别服务，去 GCP（Google Cloud Platform）注册账号免费使用 12 个月，在国内需要绑定 Visa/MasterCard。
    会有 1 美元的试缴费几分钟后返还，不要惊慌。
    在注册过程中，Google 声称试用结束后除非转为付费账户才会自动扣费，不会像 Amazon ECS 那样欺负人民群众。
* 为了让机器能连上 Google 服务，可以搞一个 vpn 或者代理。建议走 ss 提供 socks5 代理，然后通过 polipo 之类软件转换为 HTTP 代理。搞定后设置 `http_proxy` 环境变量即可正常使用 SD 卡中的软件。

# 尝试执行 Demo

[Harttle](/) 觉得是时候打开命令行了，桌面上有一个 `dev_terminal`，双击它！
如果是 SSH 登录的用户，可以 `source /home/pi/AIY-voice-kit-python/env/bin/activate` 来初始化开发环境。

1. 使用语音识别需要 GCP 账号（见上一步），将你账号对应的 Credentials 下载到 `~/assistant.json`。
2. 执行一个软件 `~/AIY-voice-kit-python/src/assistant_grpc_demo.py`

如果一切正常，会得到这样的输出：

```
(env) pi@raspberrypi:~ $ ~/AIY-voice-kit-python/src/assistant_grpc_demo.py
Press the button and speak
[2018-01-29 06:47:32,744] INFO:recorder:started recording
```

按下按钮后进入语音识别状态（此时红色按钮会亮），比如大声说 "How's the weather?"，它反应半天后会跟你娓娓道来北京天气如何如何。
这套程序使用内建 pico2wave 来合成语音，因而不支持中文。。
可以试试科大讯飞或百度语音合成，前者支持本地程序但文档惊人，胆大的值得一试。

# Finally

最后感谢我的小乌龟，陪伴我整个无聊的安装过程。

![tortoise](/assets/img/blog/iot/tortoise@2x.jpg)

[voice]: https://aiyprojects.withgoogle.com/voice
