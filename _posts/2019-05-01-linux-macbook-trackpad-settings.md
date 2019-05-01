---
title: Linux 下 MacBook 触摸板设置
tags: Linux MacBook xinput xorg.conf 触摸板
---

[在 MacBookPro 上安装 ArchLinux](/2019/04/26/macbook-archlinux-install.html)
后最大的问题就是那一排功能键和触摸板还能不能用。
功能键比较复杂涉及你的桌面系统或窗口管理器的选择，
本文解释 MacBook 触摸板如何在 ArchLinux 下进行配置。
依赖的软件只有触摸板驱动 xf86-input-mtrack 和 X11，本文应该对绝大多数 Linux 发行版都适用。（不过 Ubuntu 貌似是 Wayland 窗口服务？）

我们重点解释如何恢复 OSX 下独有的触摸板手感和功能：
自然（反向）滚动、三指选择和拖动、四指横向滑动、滚动惯性、鼠标加速（Pointer Acceleration）。
触摸板的通用配置比如敲键时禁用触摸板、手掌识别等，可以参考 Harttle 的另一篇文章：
[Linux 下的触摸板设置](/2013/10/27/synaptics-settings-linux.html)

## TL;DR

文中主要介绍一些技巧和原理。心急的同学可以直接按以下步骤操作：

1. 安装 AUR 包 xf86-input-mtrack
2. 把 [50-mtrack.conf](https://github.com/harttle/macbook-mtrack-settings/blob/master/50-mtrack.conf) 下载到 /etc/X11/xorg.conf.d
3. pkill x 或者 sudo reboot

<!--more-->

## xinput

本文中的文件路径和软件按住方式都以 ArchLinux 为例。
xorg 软件包绑定依赖了 xf86-input-libinput，但它对多点触控支持不够好。
我们需要安装一个 AUR 里的驱动： xf86-input-mtrack。
还没有 AUR 工具的同学请可以参考 [安装 AUR 软件包](https://harttle.land/2019/04/30/install-aur-package.html) 一文。

> xf86-input-mtrack 已经很多年没有更新了，如果想要一些新的功能，可以手动安装 [p2rkw 的 fork](https://github.com/p2rkw/xf86-input-mtrack/) xf86-input-mtrack-git。
> 它在我的电脑上有一个问题：双指滚动总是断续的，像是在模拟滚轮。但旧的 xf86-input-mtrack 则没有这个问题。
> 这里还有个讨论：<https://bbs.archlinux.org/viewtopic.php?id=173137>

然后执行 xinput，找到你的设备 ID。
比如下面的输出中触摸板对应的 ID 是 14 （Apple Touchpad bcm5974）：

```
$ xinput
⎡ Virtual core pointer                    	id=2	[master pointer  (3)]
⎜   ↳ Virtual core XTEST pointer              	id=4	[slave  pointer  (2)]
⎜   ↳ Logitech USB Receiver                   	id=11	[slave  pointer  (2)]
⎜   ↳ Logitech USB Receiver Consumer Control  	id=12	[slave  pointer  (2)]
⎜   ↳ bcm5974                                 	id=14	[slave  pointer  (2)]
⎣ Virtual core keyboard                   	id=3	[master keyboard (2)]
    ↳ Virtual core XTEST keyboard             	id=5	[slave  keyboard (3)]
    ↳ Power Button                            	id=6	[slave  keyboard (3)]
    ↳ Video Bus                               	id=7	[slave  keyboard (3)]
    ↳ Power Button                            	id=8	[slave  keyboard (3)]
    ↳ Sleep Button                            	id=9	[slave  keyboard (3)]
    ↳ Topre Corporation HHKB Professional     	id=10	[slave  keyboard (3)]
    ↳ Apple Inc. Apple Internal Keyboard / Trackpad	id=13	[slave  keyboard (3)]
    ↳ Logitech USB Receiver Consumer Control  	id=15	[slave  keyboard (3)]
```

然后可以通过 `xinput list-props` 看到它的所有参数：

```
$ xinput list-props 14
Device 'bcm5974':
	Device Enabled (154):	1
	Coordinate Transformation Matrix (156):	1.000000, 0.000000, 0.000000, 0.000000, 1.000000, 0.000000, 0.000000, 0.000000, 1.000000
	Device Accel Profile (285):	2
	Device Accel Constant Deceleration (286):	2.500000
	Device Accel Adaptive Deceleration (287):	1.000000
	Device Accel Velocity Scaling (288):	10.000000
	Trackpad Disable Input (315):	0
	Trackpad Sensitivity (316):	0.350000
	Trackpad Touch Pressure (317):	5, 5
	Trackpad Button Settings (318):	1, 1
    ...
```

接着就可以使用 `xinput set-prop <ID|name> [val]...` 来设置每个属性的值了。

## xorg.conf

把上面的 `xinput set-prop` 持久化有两种办法：

1. 把 xinput 命令放到 .xinitrc 中，或者某种 autostart 中。
2. 把上述属性配置到 /etc/X11/xorg.conf.d/*.conf 中。

这两种都是 X11 的配置在 startx 的时候读取。
但第一种是直接配置输入设备的属性，这些属性名和参数含义是驱动程序定义的，
需要查 [xf86-input-mtrack 的文档](https://github.com/BlueDragonX/xf86-input-mtrack)。
第二种是配置 X11 的属性，驱动程序会自动解释 X11 的数据，
我们要看的 [xorg.conf(5)][xorg.conf]（其实也不一定，后面你会看到一些驱动定义的名字）。因为第二种更标准，下文以第二种方式为例。

需要先在 /etc/X11/xorg.conf.d/ 下创建一个文件比如 50-mtrack.conf：

> 数字表示执行顺序（lexical sort order），你文件少的话没有区别。参考 man run-parts

```
# file: /etc/X11/xorg.conf.d/50-mtrack.conf 
Section "InputClass"
    MatchIsTouchpad "on"
    Identifier "Touchpads"
    Driver "mtrack"
EndSection
```

必须是一个 InputClass，然后 Driver 设置好就 OK。
Match 用来限定作用范围，也可以直接匹配产品的标识：

```
    MatchProduct "bcm5974"
```

## 自然滚动

自然滚动就是 OSX 下的反向滚动，手指和页面的移动方向一致。
只需要把向上向下向左向右的 Button 值互换。把这个按键值的顺序搞成反的：

```
# file: /etc/X11/xorg.conf.d/50-mtrack.conf 
Section "InputClass"
    # ...
    Option "ScrollUpButton" "5"
    Option "ScrollDownButton" "4"
    Option "ScrollLeftButton" "7"
    Option "ScrollRightButton" "6"
EndSection
```

## 滚动惯性

滚动惯性通过 ScrollCoast 系列属性来设置，一个表示多少速度时才启用，另一个表示大概惯性多少距离。
而滚动的速度可以设置 ScrollDistance，感觉在 100-150 直接比较接近 OSX 的默认设置。

```
# file: /etc/X11/xorg.conf.d/50-mtrack.conf 
Section "InputClass"
    # ...
    Option "ScrollDistance" "100"
    Option "ScrollCoastDuration" "500"
    Option "ScrollCoastEnableSpeed" "5"
EndSection
```

滚动速度 mtrack 并没有给出配置方法，但可以从 xinput 列表中看到。
因为我们不知道硬件设置的配置项是啥，也不属于 Xorg 的通用 Option（这部分可以 man xorg.conf）范围，
只能把它配置到 .xinitrc 中了：

```bash
# file: ~/.xinitrc
xinput set-prop bcm5974 'Trackpad Scroll Settings' 600 20 0
```

第一个值越大滚动速度越慢。默认是 150，我们让他滚动慢一些。

## 三指选择/拖动

三指拖动是 OSX 下独有的奇葩操作，但非常好用。
X11 + mtrack 的方式是，把四个方向的 Swipe（mtrack 中指三指手势）
配置成鼠标点击按键值为1，再把 SwipeClickTime 设置为 0，再把 istance 阈值设置为 1。
其实是模拟成左键点击：

```
# file: /etc/X11/xorg.conf.d/50-mtrack.conf 
Section "InputClass"
    # ...
    Option "SwipeClickTime" "0"
    Option "SwipeDistance" "1"
    Option "SwipeLeftButton" "1"
    Option "SwipeRightButton" "1"
    Option "SwipeUpButton" "1"
    Option "SwipeDownButton" "1"
    Option "SwipeSensitivity" "1200"
EndSection
```

注意一点：三指按下时比如选择一段文本，处于 Swipe 手势阶段由 mtrack 接管。
这一部分过程不属于下文的 “光标加速” 控制，光标加速的曲线设置也对此无效。
这个加速要通过 SwipeSensitivity 来调整，数值越大就越快。

## 光标加速

光标加速非常诡异。因为配置项非常多，要达到 OSX 的手感很困难。
下面分享我的配置（几乎差不多了）：

```
# file: /etc/X11/xorg.conf.d/50-mtrack.conf 
Section "InputClass"
    MatchIsTouchpad "on"
    Identifier "Touchpads"
    Option "AccelerationProfile" "2"
    Option "ConstantDeceleration" "2.5"
    Option "AccelerationVelocityScaling" "5"
EndSection
```

其中 Profile 2 是多项式加速，更接近 OSX 的手感。Constant 是基底，Scaling 是常量指数。
光标加速属于 X11 的通用功能，文档比较丰富。
可以 man xorg.conf 来查看帮助。
也可以看 ArchWiki 上的文档：<https://wiki.archlinux.org/index.php/Mouse_acceleration>。

## 四指滑动

这个手势在 OSX 里用来切换桌面，每个桌面有一个全屏的应用。
所以在 ArchLinux 中它怎么实现取决于你使用怎样的桌面系统或窗口管理器。
下面以 Harttle 使用的 i3 为例。

驱动的配置比较简单，让它某个 X11 的键就可以：

```bash
# file: /etc/X11/xorg.conf.d/50-mtrack.conf 
Section "InputClass"
    Option "Swipe4LeftButton" "9"
    Option "Swipe4RightButton" "8"
    Option "Swipe4UpButton" "11"
    Option "Swipe4DownButton" "10"
EndSection
```

然后在 ~/.xbindkeysrc （要让 ~/.xinitrc source 它）中把 8 和 9 配置成切换 i3 工作区：

```bash
# file: ~/.xbindkeysrc

# Next Workspace
"i3 workspace next"
   b:9

# Previous Workspace
"i3 workspace prev"
   b:8
```

向左滑去上一个还是下一个，可以把 .xbindkeysrc 里的配置反过来，
也可以把 50-mtrack.conf 里的配置反过来。

## 参考链接

* mtrack.conf 文件：<https://github.com/harttle/macbook-mtrack-settings/blob/master/50-mtrack.conf>
* xf86-input-mtrack 文档：<https://github.com/BlueDragonX/xf86-input-mtrack>
* xorg ArchWiki：<https://wiki.archlinux.org/index.php/Xorg>

[xorg.conf]: https://jlk.fjfi.cvut.cz/arch/manpages/man/xorg.conf.5
[install-from-aur]: https://harttle.land/2019/04/30/install-aur-package.html
