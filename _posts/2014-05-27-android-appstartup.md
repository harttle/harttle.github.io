---
layout: blog
categories: Development
title: Android App 启动过程分析
tags: Android 源码
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
export JAVA_HOME=/opt/java6
export PATH=/opt/java6/bin:$PATH
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

## 源码修改

考虑从Launcher启动应用程序时，`ActivityManagerService`，`Launcher`，`MainActivity`之间的执行与通信序列如下图。在源码中相应的过程调用或进程通信处加入日志信息，用于分析启动时各部分的耗时。

![](/assets/img/blog/android-core-appstartup.png)

### Android源码修改

以下列出所有需要更改的源码。注释中给出了文件路径、类名、函数名，与添加的语句。添加日志输出（Level为Info，Tag为"PKU"）。

文件`ApplicationThreadNative`没有引入`Log`类。添加`import andriod.util.Log`会发生运行时错误，可能是因为该文件的在类层次中的特殊性。所以我们将在`try catch`语句中指明命名空间并进行调用。

```java
/////////////////////////////////////////////////////////////////////////
// file: packages/apps/Launcher2/src/com/android/launcher2/Launcher.java

// 0 Launcher.onClick
Log.i("PKU", "0 shortcut clicked");


/////////////////////////////////////////////////////////////////////////
// file: frameworks/base/core/java/android/app/ActivityManagerNative.java

// 1 ActivityManagerProxy.startActivity 
Log.i("PKU","1 START_ACTIVITY_TRANSACTION begin");
Log.i("PKU","1 START_ACTIVITY_TRANSACTION end");

// 5 ActivityManagerProxy.activityPaused
Log.i("PKU","5 ACTIVITY_PAUSED_TRANSACTION begin");
Log.i("PKU","5 ACTIVITY_PAUSED_TRANSACTION end");

// 9 ActivityManagerProxy.attachApplication
Log.i("PKU","9 ATTACH_APPLICATION_TRANSACTION begin");
Log.i("PKU","9 ATTACH_APPLICATION_TRANSACTION end");


/////////////////////////////////////////////////////////////////////////
// file: frameworks/base/services/java/com/android/server/am/ActivityManagerService.java

// 2 ActivityManagerService.startActivity
Log.i("PKU","2 do START_ACTIVITY_TRANSACTION");

// 6 ActivityManagerService.activityPaused
Log.i("PKU","6 do ACTIVITY_PAUSED_TRANSACTION");

// 7 ActivityManagerService.startProcessLocked
Log.i("PKU","7 process starting");
Log.i("PKU","7 process started");

// 10 ActivityManagerService.attachApplication
Log.i("PKU","10 do ATTACH_APPLICATION_TRANSACTION");


/////////////////////////////////////////////////////////////////////////
// file: frameworks/base/core/java/android/app/ApplicationThreadNative.java

// 3 ApplicationThreadProxy.schedulePauseActivity
try{
    android.util.Log.i("PKU","3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION begin");
}catch(Exception e){}
try{
    android.util.Log.i("PKU","3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION end");
}catch(Exception e){}

// 11 ApplicationThreadProxy.scheduleLaunchActivity
try{
    android.util.Log.i("PKU","11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION begin");
}catch(Exception e){}
try{
    android.util.Log.i("PKU","11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION end");
}catch(Exception e){}


/////////////////////////////////////////////////////////////////////////
// file: frameworks/base/core/java/android/app/ActivityThread.java

// 4 ApplicationThread.schedulePauseActivity 
Log.i("PKU","4 do SCHEDULE_PAUSE_ACTIVITY_TRANSACTION");

// 8 ActivityThread.main
Log.i("PKU","8 main entered");

// 12 ApplicationThread.scheduleLaunchActivity
Log.i("PKU","12 do SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION");
```

### App源码修改

```java
/////////////////////////////////////////////////////////////////////////
// file: src/com/example/android/searchabledict/SearchableDictionary.java

import android.util.Log;

// SearchableDictionary.onCreate
Log.i("PKU", "searchabledictionary oncreate");

// SearchableDictionary.handleIntent
Log.i("PKU", "item clicked");


/////////////////////////////////////////////////////////////////////////
// file: src/com/example/android/searchabledict/SearchableDictionary.java

import android.util.Log;

// WordActivity.onCreate
Log.i("PKU", "wordactivity oncreate");
```

### 重新编译

重新编译Android Source

```bash
. ../env.sh
. build/envsetup.sh
prebuilts/misc/linux-x86/ccache/ccache -M 50G
lunch
make -j4
```

运行模拟器

```bash
emulator&
```

安装测试应用：SearchableDictionary

```bash
# 拷贝Sample
cp -r /opt/android-sdk/samples/android-19/legacy/SearchableDictionary/ .

# 创建Project
android update project -t 1 -n searchabledict -p ./SearchableDictionary

# 编译
cd SearchableDictionary && ant debug

# 查看正在运行的设备
adb devices

# 安装到指定设备
adb -s emulator-5554 install bin/searchabledict-debug.apk
```
安装后在应用程序列表中出现SearchableDictionary：

![snapscreen](/assets/img/blog/android-core-app.png)


## 数据采集

首先运行模拟器，在设置中更改 "background process limit" 为0，勾选"don't keep activities"。这样每次点击Home即可结束应用进程。

然后监视日志并重定向到文件：

```bash
# 清空日志
adb -s emulator-5554 logcat -c

# 开始过滤
adb -s emulator-5554 logcat -v time PKU:I *:S | tee pku.log
```

现在，我们来获得10组启动过程的日志数据：

1. 启动SearchableDictionary；
2. 点击搜索，随机搜索一个单词并打开；
3. 点击Home按键（因为我们只关心启动过程）；
4. 重复1-3；

结束`logcat`，得到`pku.log`，文件46行为一个周期，10次测试共460行，前46行如下：

```
     1  06-01 05:08:57.111 I/PKU     (  399): 0 shortcut clicked
     2  06-01 05:08:57.111 I/PKU     (  399): 1 START_ACTIVITY_TRANSACTION begin
     3  06-01 05:08:57.121 I/PKU     (  276): 2 do START_ACTIVITY_TRANSACTION
     4  06-01 05:08:57.151 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION begin
     5  06-01 05:08:57.151 I/PKU     (  399): 4 do SCHEDULE_PAUSE_ACTIVITY_TRANSACTION
     6  06-01 05:08:57.151 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION end
     7  06-01 05:08:57.171 I/PKU     (  399): 1 START_ACTIVITY_TRANSACTION end
     8  06-01 05:08:57.171 I/PKU     (  399): 5 ACTIVITY_PAUSED_TRANSACTION begin
     9  06-01 05:08:57.171 I/PKU     (  276): 6 do ACTIVITY_PAUSED_TRANSACTION
    10  06-01 05:08:57.171 I/PKU     (  276): 7 process starting
    11  06-01 05:08:57.191 I/PKU     (  276): 7 process started
    12  06-01 05:08:57.211 I/PKU     (  399): 5 ACTIVITY_PAUSED_TRANSACTION end
    13  06-01 05:08:57.361 I/PKU     ( 1005): 8 main entered
    14  06-01 05:08:57.371 I/PKU     ( 1005): 9 ATTACH_APPLICATION_TRANSACTION begin
    15  06-01 05:08:57.371 I/PKU     (  276): 10 do ATTACH_APPLICATION_TRANSACTION
    16  06-01 05:08:57.391 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION begin
    17  06-01 05:08:57.391 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION end
    18  06-01 05:08:57.391 I/PKU     ( 1005): 12 do SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION
    19  06-01 05:08:57.461 I/PKU     ( 1005): 9 ATTACH_APPLICATION_TRANSACTION end
    20  06-01 05:08:57.711 I/PKU     ( 1005): searchabledictionary oncreate
    21  06-01 05:09:03.791 I/PKU     ( 1005): 1 START_ACTIVITY_TRANSACTION begin
    22  06-01 05:09:03.801 I/PKU     (  276): 2 do START_ACTIVITY_TRANSACTION
    23  06-01 05:09:03.812 I/PKU     ( 1005): 1 START_ACTIVITY_TRANSACTION end
    24  06-01 05:09:03.981 I/PKU     ( 1005): item clicked
    25  06-01 05:09:03.981 I/PKU     ( 1005): 1 START_ACTIVITY_TRANSACTION begin
    26  06-01 05:09:04.001 I/PKU     (  276): 2 do START_ACTIVITY_TRANSACTION
    27  06-01 05:09:04.001 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION begin
    28  06-01 05:09:04.001 I/PKU     ( 1005): 4 do SCHEDULE_PAUSE_ACTIVITY_TRANSACTION
    29  06-01 05:09:04.001 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION end
    30  06-01 05:09:04.011 I/PKU     ( 1005): 1 START_ACTIVITY_TRANSACTION end
    31  06-01 05:09:04.041 I/PKU     ( 1005): 5 ACTIVITY_PAUSED_TRANSACTION begin
    32  06-01 05:09:04.041 I/PKU     (  276): 6 do ACTIVITY_PAUSED_TRANSACTION
    33  06-01 05:09:04.051 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION begin
    34  06-01 05:09:04.051 I/PKU     ( 1005): 12 do SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION
    35  06-01 05:09:04.051 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION end
    36  06-01 05:09:04.091 I/PKU     ( 1005): 5 ACTIVITY_PAUSED_TRANSACTION end
    37  06-01 05:09:04.171 I/PKU     ( 1005): wordactivity oncreate
    38  06-01 05:09:09.201 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION begin
    39  06-01 05:09:09.201 I/PKU     ( 1005): 4 do SCHEDULE_PAUSE_ACTIVITY_TRANSACTION
    40  06-01 05:09:09.211 I/PKU     ( 1005): 5 ACTIVITY_PAUSED_TRANSACTION begin
    41  06-01 05:09:09.211 I/PKU     (  276): 6 do ACTIVITY_PAUSED_TRANSACTION
    42  06-01 05:09:09.211 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION end
    43  06-01 05:09:09.241 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION begin
    44  06-01 05:09:09.251 I/PKU     (  399): 12 do SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION
    45  06-01 05:09:09.251 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION end
    46  06-01 05:09:09.311 I/PKU     ( 1005): 5 ACTIVITY_PAUSED_TRANSACTION end
```

* 1-20行：点击Launcher图标（Launcher.onClick）到Activity启动完毕（SearchableDictionary.onCreate）；
* 21-23行：点击搜索提示列表中的某一项到生成隐式Intent；
* 24-37行：调用StartActivity（SearchableDictionary.handleIntent）到WordActivity启动完毕（WordActivity.onCreate）；
* 38-46行：点击Home键直到应用程序进程结束（这一段不在我们关心的范围内）。

> 可以看到到`begin`与`end`之间总会有`do`，即`transaction`类似远程过程调用，该过程是同步的。

## 数据分析
