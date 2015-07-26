---
layout: blog
categories: linux
title: Windows/Linux远程桌面
tags: Windows Linux 网络
redirect_from:
  - /linux/remote-desktop.html
  - /2015/05/12/remote-desktop/
---

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
