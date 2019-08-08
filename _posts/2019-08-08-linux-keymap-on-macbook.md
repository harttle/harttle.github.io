---
title: ArchLinux 键盘映射：交换 CapsLock 和 Ctrl 
tags: ArchLinux hwdb scancode keycode Xmodmap MacBook
---

笔者在几个月前 [切换到 Linux][macbook-arch] 下干活，使用 Xmodmap 交换掉 CapsLock 和 Ctrl。
但 Xmodmap 只能改键无法区分是哪个键盘硬件设备（偏偏 HHKB 的 Caps 本来就在左边），而且只在 X11 下好使（Virtual Console 下不起作用）。
于是近日研究了下 scancode 到 keycode 映射，通过 udev 匹配和配置特定的输入设备。
Harttle 的环境是 Macbook 下的 ArchLinux，下面的命令以此为例，但其他环境也应该类似。

> 注意：本文只讨论如何重新定义个别键的 keysym 的问题。更改键盘布局请参考 [kbdmap](https://wiki.archlinux.org/index.php/Xorg/Keyboard_configuration)，更改快捷键请使用 xbindkeys 或 i3 bindsym 或你的桌面系统配置。

<!--more-->

## 相关概念

**USB keyboard, AT keyboard**：这里按照 Linux 键盘驱动分类，前者包括 USB 接口的键盘和 Macbook 的键盘属于通用输入设备（generic input），后者包括 AT Din5 接口或 PS/2（MiniDin6）等接口的键盘属于 [atkbd](https://www.freebsd.org/cgi/man.cgi?query=atkbd&sektion=4) 输入设备，驱动源码里有非常详细的描述：<https://github.com/torvalds/linux/blob/master/drivers/input/keyboard/atkbd.c>。

**scancode**：又叫[键盘扫描码](https://en.wikipedia.org/wiki/Scancode) 是设备驱动收到的，键盘硬件发送的事件代码，比如同一键按下和松开是两个码，通常跟键盘型号有关。

**keycode**：keycode 是键盘或鼠标按键按下时，内核收到的一个数字表示。这个数字表示由驱动产生，直接交由软件处理，比如 X11 从内核收到的就是这个数字。

**keysym**：keysym 是 keycode 对应的按键值，这个值的语义就是一个具体的字符。比如 keycode 38 默认对应的 keysym 是 0x61（97），对应 ASCII 中的字符 "a"。
对基于 X 的桌面环境或窗口管理器来讲，这个映射关系由 Xorg 管理，叫做 keymap table，可以通过 xmodmap 来读写。
默认的映射表定义在 Xorg 的 [keysymdef.h](https://www.cl.cam.ac.uk/~mgk25/ucs/keysymdef.h)

## Xmodmap

如果你只用 Macbook 默认的键盘，或者你的所有外接键盘都需要交换 CapsLock 和 Ctrl，那么可以通过 [Xmodmap](https://wiki.archlinux.org/index.php/Xmodmap) 来更改 keymap table。
在 ~/.Xmodmap 中写入：

```xmodmap
remove Lock = Caps_Lock
remove Control = Control_L
keysym Control_L = Caps_Lock
keysym Caps_Lock = Control_L
add Lock = Caps_Lock
add Control = Control_L
```

并且在 ~/.xinitrc 里读取这个配置：

```bash
[ -f "$HOME/.Xmodmap" ] && xmodmap "$HOME/.Xmodmap"
```

当前生效的映射可以通过 `xmodmap -pke` 来查看，按下某个键对应的 keycode 可以通过 `xev` 来查看。

## 为特定键盘设备生效

从下文开始，解决如何针对单个键盘改映射。这需要从驱动层面解决，因为要匹配具体键盘的 Bus、厂商、产品型号啥的。
匹配到之后，要更改的是从 scancode 到 keycode 的映射。能够解决这几个具体问题：

1. 外接 HHKB 不改，Ctrl 还是 Ctrl。Macbook Pro 内置键盘要改，交换 CapsLock 和左 Ctrl。
2. 对于 X11 里的应用生效，对于 [Virtual Console](https://harttle.land/2016/06/08/shell-config-files.html) 也生效。总之只要内核启动了，它就生效了。

ArchLinux 的文档在这里：<https://wiki.archlinux.org/index.php/Map_scancodes_to_keycodes>。大意是使用 udev 更改硬件数据库（hwdb）。

## 找到内置键盘的厂商、型号、版本标识

在 /proc/bus/input/devices 文件中，找到包含“Apple Internal Keyboard / Trackpad”的一段，比如：

```
I: Bus=0003 Vendor=05ac Product=0259 Version=0111
N: Name="Apple Inc. Apple Internal Keyboard / Trackpad"
P: Phys=usb-0000:00:14.0-5/input0
S: Sysfs=/devices/pci0000:00/0000:00:14.0/usb1/1-5/1-5:1.0/0003:05AC:0259.0002/input/input22
U: Uniq=
H: Handlers=sysrq kbd event20 leds 
B: PROP=0
B: EV=120013
B: KEY=10000 0 0 0 1007b00011007 ff9f217ac14057ff ffbeffdfffefffff fffffffffffffffe
B: MSC=10
B: LED=1f
```

其中第一行（Bus=0003 Vendor=05ac Product=0259 Version=0111）就是我们要的所有信息，用来在 udev 中匹配。

## 找到要改的键的 scancode

可以用 evtest 工具来查 scancode（注意 xev 不可用，因为事件到达 X11 时已经只剩下 keycode）。
比如按下 Macbook Pro 的 CapsLock 时，可以看到 scancode 的值是 70039，对应的 keycode 是 58，其 keysym 是 capslock。

```
Event: time 1565254684.539776, type 4 (EV_MSC), code 4 (MSC_SCAN), value 70039
Event: time 1565254684.539776, type 1 (EV_KEY), code 58 (KEY_CAPSLOCK), value 1
Event: time 1565254684.539776, -------------- SYN_REPORT ------------
Event: time 1565255042.878338, type 17 (EV_LED), code 1 (LED_CAPSL), value 1
Event: time 1565255042.878338, -------------- SYN_REPORT ------------
Event: time 1565254684.675779, type 4 (EV_MSC), code 4 (MSC_SCAN), value 70039
Event: time 1565254684.675779, type 1 (EV_KEY), code 58 (KEY_CAPSLOCK), value 0
Event: time 1565254684.675779, -------------- SYN_REPORT ------------
```

类似地，左 Ctrl 的 scancode 是 700e0，keysym 是 leftctrl。

## 设置 hwdb

打开 /etc/udev/hwdb.d/90-custom-keyboard.hwdb，写入以下内容：

```
evdev:input:b0003v05ACp0259*
  KEYBOARD_KEY_70039=leftctrl
  KEYBOARD_KEY_700e0=capslock
```

注意根据文档 b（bus），v（vendor），p（product）要小写，四位 16 进制数要大写。
然后 `sudo systemd-hwdb update` 更新到硬件数据库。重启！

> 有个技巧：setkeycodes 命令可以不重启看效果，语法可以 man setkeycodes。

[macbook-arch]: https://harttle.land/2019/04/26/macbook-archlinux-install.html