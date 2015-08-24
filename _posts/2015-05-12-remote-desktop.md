---
layout: blog
categories: linux
title: Windows/Linux远程桌面
tags: 网络 Bash 远程桌面
redirect_from:
  - /linux/remote-desktop.html
  - /2015/05/12/remote-desktop/
---

Windows和Linux如何互连远程桌面？这是曾经困扰过小编的一个大问题。
在小编已经熟悉Linux的今天这项技巧已经难以谈得上技巧了，
不过为了方便别人，以及方便多年后的自己，还是记录在这里吧。

# Linux -> windows

## 安装

```bash
pacman -S rdesktop
rdesktop IP:Port
```

## 切换全屏

`Ctrl+Alt+Enter`

## 远程磁盘挂载

```bash
# 将 `/mnt/floppy` 挂载到 ‘floppy’
rdesktop <IP>:<PORT> -r disk:floppy=/mnt/floppy   
```

# Win -> Win


## 运行

`mstsc`

## 切换全屏

`Ctrl+Alt+Break`

## 挂载磁盘

`mstsc`设置

## 更改端口

1. 修改注册表

		[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\Wds\rdpwd\Tds\tcp]
		[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Tenninal Server\WinStations\RDP-Tcp]
		
3. 重启
