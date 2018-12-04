---
title: Android App 启动过程分析
tags: Android Linux 事件 进程 操作系统
---

通过分析和修改Android 源码,分析 Android App 启动过程的时间消耗及性能瓶颈。

本文包括源码编译与运行、源码修改与调试、数据收集与分析。分析了 App 启动过程中， `Activity Manager Service` 、`Binder`、`Launcher`和`MainActivity`扮演的角色以及消耗的时间。

## 源码编译与运行 

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

增加交换空间，加 RAM 应达到 16G (另外，还需要 30G 的大小写敏感文件系统可用空间)

```bash
su
swapoff /swapfile && rm /swapfile
dd if=/dev/zero of=/swapfile bs=512M count=32
mkswap /swapfile && swapon /swapfile
```

安装对应版本的工具软件：

```bash
# make 3.81-3.82
yaourt -S make-3.81 

# python2
cd /usr/bin && sudo ln -sf python python2

# java SE 1.6
yaourt -S jdk6-compat
```

环境变量配置：

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

```
Linux acer 3.13.7-1-ARCH #1 SMP PREEMPT Mon Mar 24 20:06:08 CET 2014 x86_64 GNU/Linux
Python 2.7.6 (default, Feb 26 2014, 12:07:17)
gcc 版本 4.9.0 20140507 (prerelease) (GCC)
GNU Make 3.81
java SE 1.6
```

<!--more-->

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

## 源码修改与调试

考虑从Launcher启动应用程序时，`ActivityManagerService`，`Launcher`，`MainActivity`之间的执行与通信序列如下图。在源码中相应的过程调用或进程通信处加入日志信息，用于分析启动时各部分的耗时。

![](/assets/img/blog/android-core-appstartup.png)

### Android源码修改

以下列出所有需要更改的源码。注释中给出了文件路径、类名、函数名，与添加的语句。添加日志输出（Level为Info，Tag为"PKU"）。

说明：文件`ApplicationThreadNative`没有引入`Log`类。添加`import andriod.util.Log`会发生运行时错误，可能是因为该文件的在类层次中的特殊性。所以我们将在`try catch`语句中指明命名空间并进行调用。我们关心的是整个系统启动后的 App启动过程，所以直接吞掉这个在早期才会产生的异常。

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
Log.i("PKU","2 on START_ACTIVITY_TRANSACTION");

// 6 ActivityManagerService.activityPaused
Log.i("PKU","6 on ACTIVITY_PAUSED_TRANSACTION");

// 7 ActivityManagerService.startProcessLocked
Log.i("PKU","7 process starting");
Log.i("PKU","7 process started");

// 10 ActivityManagerService.attachApplication
Log.i("PKU","10 on ATTACH_APPLICATION_TRANSACTION");


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
Log.i("PKU","4 on SCHEDULE_PAUSE_ACTIVITY_TRANSACTION");

// 8 ActivityThread.main
Log.i("PKU","8 main entered");

// 12 ApplicationThread.scheduleLaunchActivity
Log.i("PKU","12 on SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION");
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


## 数据采集与分析

### 数据采集

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
5. 结束`logcat`，得到`pku.log`，文件46行为一个周期，10次测试共460行，前46行如下：

```
     1  06-01 05:08:57.111 I/PKU     (  399): 0 shortcut clicked
     2  06-01 05:08:57.111 I/PKU     (  399): 1 START_ACTIVITY_TRANSACTION begin
     3  06-01 05:08:57.121 I/PKU     (  276): 2 on START_ACTIVITY_TRANSACTION
     4  06-01 05:08:57.151 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION begin
     5  06-01 05:08:57.151 I/PKU     (  399): 4 on SCHEDULE_PAUSE_ACTIVITY_TRANSACTION
     6  06-01 05:08:57.151 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION end
     7  06-01 05:08:57.171 I/PKU     (  399): 1 START_ACTIVITY_TRANSACTION end
     8  06-01 05:08:57.171 I/PKU     (  399): 5 ACTIVITY_PAUSED_TRANSACTION begin
     9  06-01 05:08:57.171 I/PKU     (  276): 6 on ACTIVITY_PAUSED_TRANSACTION
    10  06-01 05:08:57.171 I/PKU     (  276): 7 process starting
    11  06-01 05:08:57.191 I/PKU     (  276): 7 process started
    12  06-01 05:08:57.211 I/PKU     (  399): 5 ACTIVITY_PAUSED_TRANSACTION end
    13  06-01 05:08:57.361 I/PKU     ( 1005): 8 main entered
    14  06-01 05:08:57.371 I/PKU     ( 1005): 9 ATTACH_APPLICATION_TRANSACTION begin
    15  06-01 05:08:57.371 I/PKU     (  276): 10 on ATTACH_APPLICATION_TRANSACTION
    16  06-01 05:08:57.391 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION begin
    17  06-01 05:08:57.391 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION end
    18  06-01 05:08:57.391 I/PKU     ( 1005): 12 on SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION
    19  06-01 05:08:57.461 I/PKU     ( 1005): 9 ATTACH_APPLICATION_TRANSACTION end
    20  06-01 05:08:57.711 I/PKU     ( 1005): searchabledictionary oncreate
    21  06-01 05:09:03.791 I/PKU     ( 1005): 1 START_ACTIVITY_TRANSACTION begin
    22  06-01 05:09:03.801 I/PKU     (  276): 2 on START_ACTIVITY_TRANSACTION
    23  06-01 05:09:03.812 I/PKU     ( 1005): 1 START_ACTIVITY_TRANSACTION end
    24  06-01 05:09:03.981 I/PKU     ( 1005): item clicked
    25  06-01 05:09:03.981 I/PKU     ( 1005): 1 START_ACTIVITY_TRANSACTION begin
    26  06-01 05:09:04.001 I/PKU     (  276): 2 on START_ACTIVITY_TRANSACTION
                                              
    27  06-01 05:09:04.001 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION begin
    28  06-01 05:09:04.001 I/PKU     ( 1005): 4 on SCHEDULE_PAUSE_ACTIVITY_TRANSACTION
    29  06-01 05:09:04.001 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION end
    30  06-01 05:09:04.011 I/PKU     ( 1005): 1 START_ACTIVITY_TRANSACTION end
    31  06-01 05:09:04.041 I/PKU     ( 1005): 5 ACTIVITY_PAUSED_TRANSACTION begin
    32  06-01 05:09:04.041 I/PKU     (  276): 6 on ACTIVITY_PAUSED_TRANSACTION
    33  06-01 05:09:04.051 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION begin
    34  06-01 05:09:04.051 I/PKU     ( 1005): 12 on SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION
    35  06-01 05:09:04.051 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION end
    36  06-01 05:09:04.091 I/PKU     ( 1005): 5 ACTIVITY_PAUSED_TRANSACTION end
    37  06-01 05:09:04.171 I/PKU     ( 1005): wordactivity oncreate
    38  06-01 05:09:09.201 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION begin
    39  06-01 05:09:09.201 I/PKU     ( 1005): 4 on SCHEDULE_PAUSE_ACTIVITY_TRANSACTION
    40  06-01 05:09:09.211 I/PKU     ( 1005): 5 ACTIVITY_PAUSED_TRANSACTION begin
    41  06-01 05:09:09.211 I/PKU     (  276): 6 on ACTIVITY_PAUSED_TRANSACTION
    42  06-01 05:09:09.211 I/PKU     (  276): 3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION end
    43  06-01 05:09:09.241 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION begin
    44  06-01 05:09:09.251 I/PKU     (  399): 12 on SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION
    45  06-01 05:09:09.251 I/PKU     (  276): 11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION end
    46  06-01 05:09:09.311 I/PKU     ( 1005): 5 ACTIVITY_PAUSED_TRANSACTION end
```

* 1-20行：点击Launcher图标（Launcher.onClick）到Activity启动完毕（SearchableDictionary.onCreate）；
* 21-23行：点击搜索提示列表中的某一项到生成隐式Intent；
* 24-37行：调用StartActivity（SearchableDictionary.handleIntent）到WordActivity启动完毕（WordActivity.onCreate）；
* 38-46行：点击Home键直到应用程序进程结束（这一段不在我们关心的范围内）。

> 可以看到到`begin`与`end`之间总会有`on`，即`transaction`类似远程过程调用，该过程是同步的。

### 数据分析

利用脚本`pku_analyzer.sh`，计算日志文件`pku.log`相邻事件之间的时间差，最终结果(即 10 次测试的平均值)记录在`r.txt`文件:

```
    #   Actor   Time    Event   
     1	         0  0 shortcut clicked
     2	L        0  1 START_ACTIVITY_TRANSACTION begin
     3	B        5  2 on START_ACTIVITY_TRANSACTION
     4	A       23  3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION begin
     5	B        1  4 on SCHEDULE_PAUSE_ACTIVITY_TRANSACTION
     6	L      2.9  3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION end
     7	A     30.1  1 START_ACTIVITY_TRANSACTION end
     8	L      6.9  5 ACTIVITY_PAUSED_TRANSACTION begin
     9	B        1  6 on ACTIVITY_PAUSED_TRANSACTION
    10	A        2  7 process starting
    11	B     25.9  7 process started
    12	AM    11.1  5 ACTIVITY_PAUSED_TRANSACTION end
    13	M    214.9  8 main entered
    14	M       22  9 ATTACH_APPLICATION_TRANSACTION begin
    15	B        0  10 on ATTACH_APPLICATION_TRANSACTION
    16	A       19  11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION begin
    17	B        1  12 on SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION
    18	M        2  11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION end
    19	A     75.9  9 ATTACH_APPLICATION_TRANSACTION end
    20	M    232.6  searchabledictionary oncreate

    24	       161  item clicked
    25	L        5  1 START_ACTIVITY_TRANSACTION begin
    26	B     15.9  2 on START_ACTIVITY_TRANSACTION
    27	A        6  3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION begin
    28	B        0  4 on SCHEDULE_PAUSE_ACTIVITY_TRANSACTION
    29	L        2  3 SCHEDULE_PAUSE_ACTIVITY_TRANSACTION end
    30	A       15  1 START_ACTIVITY_TRANSACTION end
    31	L       34  5 ACTIVITY_PAUSED_TRANSACTION begin
    32	B        1  6 on ACTIVITY_PAUSED_TRANSACTION
    33	A        6  11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION begin
    34	B        2  12 on SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION
    35	M        3  11 SCHEDULE_LAUNCH_ACTIVITY_TRANSACTION end
    36	A     36.9  5 ACTIVITY_PAUSED_TRANSACTION end
    37	M     58.8  wordactivity oncreate
```

说明:

1. Time 为当前事件与上一事件的间隔,Actor 为消耗这段时间的主体。A:`AMS`;B:`Binder`;L:`Launcher`;M:`MainActivity`。
2. 方便起见，请求启动子Activity的对象同样被标记为`Launcher`。
3. `Process.start`的执行时间归于`Binder`，而该函数返回直到`ActivityThread.main`的时间归于`MainActivity`。
4. 在`Process.start`后`AMS`与`MainActivity`并发执行,时间为 11.1ms，为便于统计这段重合时间归于`AMS`。
5. 脚本完成了绝大部分计算，仍有部分是手工计算的(这些结果包括行 1-2、行 19-20、行 36-37 之间的间隔)。
6. 相同时间的 Log 可能会出现乱序(Log 并非原子操作,但时间的正确的)，最终结果对这种情况进行了手工纠正。


对这四个主体消耗的时间进行加和,可得到如下时间分布图:

图1：主Activity 启动时间分布(合计:674.3ms)

![](/assets/img/blog/main_activity.png)

图2：子Activity 启动时间分布(合计:185.6ms)

![](/assets/img/blog/sub_activity.png)

由图1可以看出，主Activity 启动过程中，主要的性能瓶颈由 `MainActivity` 的创建和切换产生，`Binder` 消费的时间非常少。

在图2中，各部分消费时间相差较小,以`AMS`和`MainActivity`耗时为主,`Binder`所占时间仍是最少的。

在图2中，子Activity启动时间相对主Activity来讲已经大大减少。此外,这个过程的时间波动可能与子Activity 的具体类型高度相关。

在图2中，`Launcher`的时间有所增加。注意这里的`Launcher`是发出启动子Activity请求的对象,即主Activity。这说明系统的Launcher程序是有所优化的(响应时间减少了76.1%)。


综上，

* `Binder`机制是一种高效的进程间通信机制。它在提供高可靠性和扩展性的同时，并未引入过多的时间开销。
* `AMS`提供将Activity与进程分离的机制,其时间也小于MainActivity本身,这样的开销是值得的。
* 系统的`Launcher`启动Activity的速度要高于普通的主Activity。

