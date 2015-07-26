---
layout: blog
categories: linux
title: Linux/Windows 时间不一致
tags: Windows Linux
redirect_from:
  - /linux/linux-windows-time.html
  - /2015/05/02/linux-windows-time/
---

在使用Linux/Windows的双系统时，经常发现时间不正确：liunx下的时间或windows下的时间不对，往往相差8小时。在此给出解释和推荐解决方案。

## 名词解释

* CST：(China Standard Time,UTC+8:00) 中国沿海时间(北京时间)
* UTC：(Universal Time Coordinated,UTC) 世界协调时间
* GMT：(Greenwich Mean Time ,GMT）格林威治时间
* LT：(locale time）本地时间

GPS 系统中有两种时间区分，一为UTC，另一为LT（地方时）两者的区别为时区不同，UTC就是0时区的时间，地方时为本地时间，如北京为早上八点（东八区），UTC时间就为零点，UTC时间比北京时晚八小时，以此计算即可。

> 我们可以认为格林威治时间就是时间协调时间（GMT=UTC）

<!--more-->

## Windows 时间

Windows启动时，读取bios的时间作为LT时间，如果你按照系统时选择时区为中国上海，也就是CST时间。windows时间总是本地的！

* 修改时间时，Windows会同时修改Windows系统时间和Bios的时间。
* 设置区域时，仅仅影响应用软件的时区识别！

## Linux 时间

Linux启动时，读取bios的时间作为UTC时间（这一点可以设置，为了守护进程良好地运行，一般设为UTC时间）。Linux 下有两个常用的时间命令：

* `date`命令：显示、修改 os 时间；但不修改bios时间！
* `hwclock`命令：显示、修改bios时间，但不会影响 os 时间！

## 时区设置

### 通过命令

```bash
tzselect
# 仅限于RedHat Linux 和 CentOS
timeconfig
# 适用于Debian
dpkg-reconfigure tzdata
```

### 通过配置文件

```bash
# Asia 为主时区，Shanghai为次时区，/etc/localtime为时区配置文件
cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```


## date

1. 查看OS时间

    ```bash
    # 查看OS时间
    date
    # 以UTC时间显示
    date -u 
    date --ut
    date --universal
    # 查看时区
    date -R
    ```

2. 设置时间和日期

    ```bash
    # 将系统日期设定成1996年6月10日的命令
    date -s 06/22/96
    # 将系统时间设定成下午1点52分0秒的命令
    date -s 13:52:00
    # 以UTC时间进行设置
    date -u -s <time string>
    ```
    
3. 将当前时间写入BIOS，使时间设置重启后仍然有效

    ```bash
    hwclock -w 
    ```
    
## hwclock

`hwclock`用来查看和设置BIOS的时间，例如：

```bash
# 查看bios的时间
hwclock --show 或 hwclock -r
# 如何以utc时间显示bios时间
hwclock --utc
hwclock -u
# 设置BIOS时间
hwclock --set --date=<date string>
```

另外，电子时钟的时间是不准的，一般有固定的偏移。因os时间往往会进行网络同步，在设置硬件时钟时会计算时间偏移，并更新时间偏移文件`/etc/adjtime`。

我们可以手动同步BIOS时间与OS时间：

```bash
# 使用BIOS时间更新OS时间
hwclock --hctosys
# 使用OS时间更新BIOS时间
hwclock --systz
```



