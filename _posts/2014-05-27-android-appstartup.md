---
layout: blog
categories: Development
title: Android App 启动分析
tags: Android 内核 启动
---

通过分析和修改Android源码，分析Android App的启动过程及其性能瓶颈。

## 环境搭建

### 环境配置

环境要求可以在从 [文档](http://source.android.com/) 查询得到。以下在Arch Linux中进行Android Source Building的环境配置。

安装依赖

```bash
# x86
yaourt -S --needed gcc git gnupg flex bison gperf sdl wxgtk squashfs-tools curl ncurses zlib schedtool perl-switch zip unzip libxslt

# x64
yaourt -S --needed gcc-multilib lib32-zlib lib32-ncurses lib32-readline

# Android 工具
yaourt -S android-sdk android-sdk-platform-tools android-sdk-build-tools android-studio
```

增加交换空间

```bash

su
swapoff /swapfile && rm /swapfile
dd if=/dev/zero of=/swapfile bs=512M count=8
mkswap /swapfile && swapon /swapfile
```

环境降级

```bash
# make 3.81-3.82
yaourt -S make-3.81 

# python2
cd /usr/bin && sudo ln -sf python python2

# java SE 1.6
yaourt -S jdk6-compat
```

环境配置

```bash
#!/bin/bash
# file: env.sh

# cache
export USE_CCACHE=1
export CCACHE_DIR=~/.ccache

# output
export OUT_DIR_COMMON_BASE=~/code/androidcore/output

# alias
alias make='make-3.81'

# java6
PATH=/opt/java6/bin:$PATH
```

配置USB访问权限：

```bash
# file: /etc/udev/rules.d/51-android.rules

# adb protocol on passion (Nexus One)
SUBSYSTEM=="usb", ATTR{idVendor}=="18d1", ATTR{idProduct}=="4e12", MODE="0600", OWNER="<username>"
# fastboot protocol on passion (Nexus One)
SUBSYSTEM=="usb", ATTR{idVendor}=="0bb4", ATTR{idProduct}=="0fff", MODE="0600", OWNER="<username>"
# ...
```


### 最终环境

Linux acer 3.13.7-1-ARCH #1 SMP PREEMPT Mon Mar 24 20:06:08 CET 2014 x86_64 GNU/Linux

Python 2.7.6 (default, Feb 26 2014, 12:07:17)

gcc 版本 4.9.0 20140507 (prerelease) (GCC)

GNU Make 3.81

<!--more-->

## 编译运行

### 编译Android Source

参照 [文档](http://source.android.com/source/downloading.html) ，下载Android4.2源码。

```bash
# 导入环境
. ../env.sh
. build/envsetup.sh

# 设置缓存大小
prebuilts/misc/linux-x86/ccache/ccache -M 50G

# 选择目标
lunch

# 并行编译
make -j4
```

### 启动Emulator


```bash
# 加载环境
lunch 

# 启动
emulator
```

启动成功，Android版本为4.2.1：

![snapscreen](/assets/img/blog/android-boot.png)

### 安装App

```bash
# 拷贝Sample
cp -r /opt/android-sdk/samples/android-19/legacy/SearchableDictionary/ .

# 创建Project
android update project -t 1 -n searchabledict -p ./SearchableDictionary

# 编译
ant debug

# 安装
adb install bin/searchabledict-debug.apk
```
安装后在应用程序列表中出现SearchableDictionary：

![snapscreen](/assets/img/blog/android-core-app.png)


## 启动分析

考虑从Launcher启动应用程序时，`ActivityManagerService`，`Launcher`，`MainActivity`之间的执行与通信序列如下图。在源码中相应的过程调用或进程通信处加入日志信息，用于分析启动时各部分的耗时。

![](/assets/img/blog/android-core-appstartup.png)

### 源码调整

以下列出所有需要更改的源码。注释中给出了文件路径、类名、函数名，与添加的语句。

```java
// 0
// packages/apps/Launcher2/src/com/android/launcher2/Launcher.java:Launcher.onClick
Log.i("PKU", "shortcut click received");

// 1
// frameworks/base/core/java/android/app/ActivityManagerNative.java:ActivityManagerProxy.startActivity 
Log.i("PKU","START_ACTIVITY_TRANSACTION sending");
Log.i("PKU","START_ACTIVITY_TRANSACTION sent");

// 2
// frameworks/base/services/java/com/android/server/am/ActivityManagerService.java:ActivityManagerService.startActivity
Log.i("PKU","START_ACTIVITY_TRANSACTION received");

// 3
// frameworks/base/core/java/android/app/ApplicationThreadNative.java:ApplicationThreadProxy.schedulePauseActivity
Log.i("PKU","SCHEDULE_PAUSE_ACTIVITY_TRANSACTION sending");
Log.i("PKU","SCHEDULE_PAUSE_ACTIVITY_TRANSACTION sent");

// 4
// frameworks/base/core/java/android/app/ActivityThread.java:ApplicationThread.schedulePauseActivity 
Log.i("PKU","SCHEDULE_PAUSE_ACTIVITY_TRANSACTION received");

// 5
// frameworks/base/core/java/android/app/ActivityManagerNative.java:ActivityManagerProxy.activityPaused
Log.i("PKU","ACTIVITY_PAUSED_TRANSACTION sending");
Log.i("PKU","ACTIVITY_PAUSED_TRANSACTION sent");

// 6
// frameworks/base/services/java/com/android/server/am/ActivityManagerService.java:ActivityManagerService.activityPaused
Log.i("PKU","ACTIVITY_PAUSED_TRANSACTION received");

// 7
// frameworks/base/services/java/com/android/server/am/ActivityManagerService.java:ActivityManagerService.startProcessLocked
Log.i("PKU","process starting");
Log.i("PKU","process started");

// 8
// frameworks/base/core/java/android/app/ActivityThread.java:ActivityThread.main
Log.i("PKU","main entered");

// 9
// frameworks/base/core/java/android/app/ActivityManagerNative.java:ActivityManagerProxy.attachApplication
Log.i("PKU","ATTACH_APPLICATION_TRANSACTION sending");
Log.i("PKU","ATTACH_APPLICATION_TRANSACTION sent");

// 10
// frameworks/base/services/java/com/android/server/am/ActivityManagerService.java:ActivityManagerService.attachApplication
Log.i("PKU","ATTACH_APPLICATION_TRANSACTION received");

// 11
// frameworks/base/core/java/android/app/ApplicationThreadNative.java:ApplicationThreadProxy.scheduleLaunchActivity
Log.i("PKU","SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION sending");
Log.i("PKU","SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION sent");

// 12
// frameworks/base/core/java/android/app/ActivityThread.java:ApplicationThread.scheduleLaunchActivity
Log.i("PKU","SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION received");
```
