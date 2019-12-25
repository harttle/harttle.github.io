---
title: X11 多显示器配置：玩转 XRandR
tags: Mac X11 XRandR
---

RandR（Resize and Rotate）协议是基于 X Window 系统的一个扩展，它可以直接操作显示器模式、刷新率，属于 DDX 组件。
[xrandr](https://wiki.archlinux.org/index.php/Xrandr) 是官方的 RandR 配置工具，比老的 Xinerama 机制更容易测试和配置。
本文在没有桌面环境的情况下直接对底层软件进行配置，如果有安装某种 DE 可以在其控制面板中找到对应的配置。

<!--more-->

## xrandr

需要先安装 [xorg-xrandr](https://www.archlinux.org/packages/?name=xorg-xrandr)，无参数运行 `xrandr` 可以打印当前的 RandR 配置：

```
> xrandr
Screen 0: minimum 8 x 8, current 3840 x 2400, maximum 32767 x 32767
eDP1 connected primary 3840x2400+0+0 (normal left inverted right x axis y axis) 290mm x 180mm
   2560x1600     59.97*+
   ...
   640x360       59.84    59.32  
DP1 disconnected (normal left inverted right x axis y axis)
DP2 disconnected (normal left inverted right x axis y axis)
HDMI1 disconnected (normal left inverted right x axis y axis)
HDMI2 connected 2160x3840+3840+0 left (normal left inverted right x axis y axis) 480mm x 270mm
   1920x1080     60.00*+  50.00    59.94  
   1680x1050     59.88  
   ...
VIRTUAL1 disconnected (normal left inverted right x axis y axis)
```

添加 `--verbose` 参数可以打印更详细的信息，比如缩放（Transform 矩阵）、EDID 等。
其中 eDP1 是显示器名（output），下列出的是它支持的分辨率（mode）和刷新率（rate）。配置方式也很简单：

```bash
xrandr --output eDP1 --mode 1920x1080 --rate 60
```

## HiDPI 和缩放

我的情况更加复杂，内置显示器（eDP1）是 Retina 屏幕，外置的（HDMI2）是普通的 1080p 屏幕。
这样两个屏幕需要设置不同的 DPI 才能让它们都能正常显示。
不论你在用 GNome、KDE、Wayland，还是像我这样的 i3wm，在 X11 下 HiDPI 有三处可以设置（而且都要设置）：

1. GUI 工具库的环境变量/配置文件。比如 GDK 或 QT 的缩放变量，这一组环境变量决定了你的 GUI 程序以怎样的级别缩放。
2. 字体的 DPI。[Xresource][xresource] 是用户级别的 X11 配置，其中 `Xft.dpi` 决定了 X11 中的字体使用怎样的 DPI。
3. RandR 的缩放。由于 GDK 只能整数缩放，需要借助 `xrandr --scale` 做任意缩放。

### GDK 配置

GUI 工具库比较主流的是 GDK 和 QT，我们以 GDK 为例。
在你的 ~/.profile 中可以直接配置 GDK 软件的缩放。
要确保你的 [登录 Shell][shell] 确实会执行这个 ~/.profile。

`GDK_SCALE` 只支持整数，也就是说只能放大两倍、三倍、四倍……
而 Ritina 屏幕合适的缩放级别是 1.25-1.75 之间。
因此要先把它设置到一个 UI 看起来已经“很大”的值，后面再用 RandR 缩放回来。

```
# file: ~/.profile
export GDK_SCALE=2
export GDK_DPI_SCALE=0.5
```

其中 GDK_SCALE 会把字体也一并放大，字体就会模糊。
我们要用 GDK_DPI_SCALE 抵消对字体的缩放，后面再用 XResource 选择正确 DPI 的字体。

> `QT_SCALE_FACTOR` 貌似不需要碰，看起来 QT 软件会跟随 Xft.dpi 的配置。如果你的 QT 软件（比如 Telegram）显示不正常可以尝试把它设为 1 或者 2。

### 字体的 DPI

[XResource][xresource] 机制提供了对字体和光标的单独配置，
只需要在 ~/.Xresources 中添加对应配置并确保它被 .xinitrc 或你的 Display Manager 执行到了。
这是我的 ~/.Xresources：

```
Xft.dpi: 270
Xcursor.size: 45
```

其中 Xft.dpi 用来配置 X11 选择的字体默认是 96，Xcursor.size 是光标大小。在 .xinitrc 中应用这个配置：

```bash
[ -f $HOME/.Xresources ] && xrdb -merge $HOME/.Xresources
```

测试时也可以 `xrdb -merge` 一下，新打开的软件就会生效。

### XRandR

前面用 GDK_SCALE 把 GUI 软件放大了整数倍，这里需要用 XRandR 把它缩放回来。
xrandr 的 `--scale` 参数可以是任意小数，实现了连续可调的缩放级别：

```bash
xrandr --output eDP1 --scale 1.5x1.5
```

因为 xrandr 的 `--dpi` 参数是同时对所有显示器生效的，我们只能用 `--scale` 参数来分别设置每个显示器。
此外，我们还能让外接显示器旋转、放到内置显示器的右边：

```bash
xrandr --output HDMI2 --pos 3840x0 --rotate left --scale 2x2
```

## GUI 配置和自动切换

用 xrandr 调节显示器适合放到脚本里面去执行，人工设置插入的显示器非常不方便，尤其是去会议室投影幻灯片的时候。
这时我们需要一个 GUI 版本的 XRandR：[ARandR](https://christian.amsuess.com/tools/arandr/)。
它可以通过鼠标拖拽来调节多个显示器，也可把调节后的结果保存为一个 .sh 文件用来下次直接跑。

此外我们还希望显示器插入/拔出的时候，识别到之前的保存好的配置直接应用。
最简单的方式是
[从 AUR 安装](https://harttle.land/2019/04/30/install-aur-package.html) autorandr。
这是一个 python 封装过的 XRandR，提供了保存当前配置、加载某个配置、自动匹配并加载配置。

```bash
autorandr --save samsung-right-of-mac   # 三星在 Mac 右边
autorandr --save mac-only               # 没有任何外接
autorandr --load samsung-right-of-mac   # 插入显示器后应用这个配置
autorandr --change                      # 根据现在插入的显示器匹配加载配置
```

安装 autorandr 后它会启用一个 systemd 的 hook，在 drm 设备发生变化时调用 `autorandr --change`。

## Hacking

如果你在用 autorandr、arandr 时也遇到一些奇怪的问题，
可以像我一样写一个自定义的 autorandr。

保存/加载配置：https://gist.github.com/harttle/75b625a952ec48913dd019654a79cf75

监听内核事件：通过 udev rules 来在显示器插入/拔出时调用 `autorandr.js --change` 实现自动加载（传递哪些环境变量取决于你调用的软件会读哪些）：

```
# file: /dev/udev/rules.d/80-randr.rules
KERNEL=="card0", SUBSYSTEM=="drm", ENV{HOME}="/home/harttle", ENV{XAUTHORITY}="/home/harttle/.Xauthority", ENV{DISPLAY}=":0", ENV{XDG_CONFIG_HOME}="/home/harttle/.config", RUN+="/home/harttle/bin/autorandr"
```

自定义需求：在插入外置显示器时，我还希望重新渲染一下桌面背景、跑一个新的 conky，或者发一个 libnotify 通知，下面是我的 /home/harttle/bin/autorandr。

```bash
#!/usr/bin/env bash
exec >> /home/harttle/log/autorandr.log 2>&1

function refresh() {
    /usr/bin/node --jitless /home/harttle/bin/autorandr.js --change
    /home/harttle/bin/conky-update.sh
    /home/harttle/bin/variety-update.sh
}

refresh &
```

[xresource]: https://wiki.archlinux.org/index.php/X_resources
[shell]: https://harttle.land/2016/06/08/shell-config-files.html