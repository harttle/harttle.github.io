---
layout: blog
categories: linux
title: Linux下的触摸板设置 
subtitle: 以 Arch Linux 为例
tags: linux archlinux
excerpt: Arch Linux 下的触摸板配置：基本设置、输入时禁止触摸板敲击、外接鼠标时禁用触摸板。
---


# 软件安装

## 安装 Synaptics 驱动
```bash
# arch linux:
pacman -S xf86-input-synaptics
```

## 管理工具

```bash
# xf86-input-synaptics 自带了命令行管理工具：Synclient 
    
# 图形管理工具：GPointing Device Settings
yaourt -S gpointing-device-settings
    
# KDE 触摸板控制模块
yaourt -S kcm_touchpad
```

<!--more-->

# 环境配置

一般的设置工作可通过图形管理工具完成，如单击、双击、右键的识别，横向和纵向滚动、双指滚动。下面介绍一些高级配置。


## 基本触摸板配置

可通过修改 synaptics 的配置文件，修改触摸板配置。包括多指敲击、滚动、避免手掌触摸、精确度与快速滚动。

```bash
#file: /etc/X11/xorg.conf.d/50-synaptics.conf
Section "InputClass"
        Identifier "touchpad catchall"
        Driver "synaptics"
        MatchIsTouchpad "on"
        
        Option "TapButton1" "1"            #单指敲击产生左键事件
        Option "TapButton2" "2"            #双指敲击产生中键事件
        Option "TapButton3" "3"            #三指敲击产生右键事件
        
        Option "VertEdgeScroll" "on"       #滚动操作：横向、纵向、环形
        Option "VertTwoFingerScroll" "on"
        Option "HorizEdgeScroll" "on"
        Option "HorizTwoFingerScroll" "on"
        Option "CircularScrolling" "on"  
        Option "CircScrollTrigger" "2"
        
        Option "EmulateTwoFingerMinZ" "40" #精确度
        Option "EmulateTwoFingerMinW" "8"
        Option "CoastingSpeed" "20"        #触发快速滚动的滚动速度
        
        Option "PalmDetect" "1"            #避免手掌触发触摸板
        Option "PalmMinWidth" "3"          #认定为手掌的最小宽度
        Option "PalmMinZ" "200"            #认定为手掌的最小压力值
EndSection
```

通过 `man synaptics` 了解更多信息。

**注意**：同时安装 `kcm_synaptics` 会覆盖掉该配置信息。

## 输入时禁止触摸板敲击

这样可以避免焦点变化，影响当前的输入。

对于使用 `startx` 来启动的桌面系统，可以修改其 `.xinitrc` 初始化配置文件来完成：

```bash
syndaemon -t -k -i 2 -d &
```

其中的 `-i 2` 表示两秒空闲，即键盘事件后的两秒内不允许响应触摸板 Tap。更多信息请参照手册页：

```bash
man syndaemon
```


## 外接鼠标时禁用触摸板

在 arch linux 中，使用 udev 监测硬件的热拔插，通过修改其规则文件，来响应外接鼠标事件，从而禁用和启用触摸板。如下的规则文件，调用了 synclient。

```bash
#file: /etc/udev/rules.d/01-touchpad.rules
ACTION=="add", SUBSYSTEM=="input", KERNEL=="mouse[0-9]", ENV{DISPLAY}=":0.0", ENV{XAUTHORITY}="/home/harttle/.Xauthority", ENV{ID_CLASS}="mouse", RUN+="/usr/bin/synclient TouchpadOff=1"
ACTION=="remove", SUBSYSTEM=="input", KERNEL=="mouse[0-9]", ENV{DISPLAY}=":0.0", ENV{XAUTHORITY}="/home/harttle/.Xauthority", ENV{ID_CLASS}="mouse", RUN+="/usr/bin/synclient TouchpadOff=0"
```

**注意**：该文件中每个操作必须单独一行，可以使用 `\` 来折行；`SUBSYSTEM` 与 `KERNEL` 指定了设备 `/dev/input/mouse[0-9]`（archwiki的中文页面中此处有误，我会找时间去修改）。了解更多 udev rules 语法：https://wiki.archlinux.org/index.php/Udev

### 开机时鼠标检测

PS/2 鼠标在开机时不会出发 udev 规则。我们做一个桌面环境的启动脚本，在 .xinitrc，profile 中调用，或者放在  KDE 的 Autostart 中：

```bash
#!/bin/bash
ids=`ls /dev/input/by-id | grep -E '.*-mouse'`
[ "$ids" ] && synclient TouchpadOff=1
```

## 触摸板识别错误

对于某些型号的机器，Arch 下触摸板识别会有问题（内核bug），官方建议从 AUR 安装 `psmouse-alps-driver`。
受影响的机器有：

* Acer Aspire 7750G
* Dell Latitude E6230, E6520, E6430 and E6530 (ALPS DualPoint TouchPad), Inspiron N5110 (ALPS GlidePoint),  Inspiron 14R Turbo SE7420/SE7520 (ALPS GlidePoint)
* Samsung NC110/NF210/QX310/QX410/QX510/SF310/SF410/SF510/RF410/RF510/RF710/RV515

如果问题还没有解决，可以手动编译该模块载入内核。

1. 卸载原有 Alps 触摸板驱动
    
    ```bash
    pacman -R psmouse-alps-driver
    ```
    
1. 从这里下载：http://www.dahetral.com/public-download
2. 解压缩，并拷贝至 `/usr/src`
    
    ```bash
    tar -xvf alps-xxx.tar
    sudo cp -r usr /
    ```

4. 加入编译树，并进行编译

    ```bash
    sudo dkms add psmouse/alps-xxx
    sudo dkms autoinstall
    ```
    
5. 卸载原有模块并载入新的内核模块
    
    ```bash
    sudo rmmod psmouse || sudo modprobe psmouse
    ```
