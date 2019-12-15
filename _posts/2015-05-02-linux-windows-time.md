---
title: Linux/Windows 时间不一致问题
tags: Bash Linux UTC Windows 时钟
---

在按照和使用 Linux/Windows 双系统时，经常发现时间不正确：Liunx 下的时间或 Windows下的时间不对，往往相差 8 小时。这是 Linux/Windows 解释 BIOS 时间的方式不同导致的。下面给出具体的解释和解决方式。

## 名词解释

* CST：(China Standard Time,UTC+8:00) 中国沿海时间(北京时间)
* UTC：(Universal Time Coordinated,UTC) 世界协调时间
* GMT：(Greenwich Mean Time ,GMT）格林威治时间
* LT：(locale time）本地时间

GPS 系统中有两种时间区分，一为 UTC，另一为 LT（地方时）。两者的区别为时区不同，UTC 就是 0 时区的时间，地方时为本地时间，如北京为早上八点（东八区），UTC 时间就为零点，UTC 时间比北京时晚八小时，以此计算即可。

> 我们可以认为格林威治时间就是时间协调时间（GMT=UTC）

<!--more-->

## BIOS 时间

为了在断电重启后能有正确的时间，PC 主板都会提供一个叫做 CMOS 的 RAM 来存系统时间（Linux 中叫做 RTC）。
CMOS 会带一块电池来确保 PC 断电时这些配置仍然能够保持，因为这个时间和 BIOS 的一些配置一起存在 CMOS 中，也叫做 BIOS 时间。
这一问题的关键在于 Windows 和 Linux 对于 BIOS 时间的解读不一致。按照你的时区为 Asia/Shanghai，现在是 16:35 为例：

* Windows 时间和 BIOS 时间是同步的，[默认情况下都是当地时间](http://blogs.msdn.com/b/oldnewthing/archive/2004/09/02/224672.aspx)（Local Time）。也就是说你的 CMOS 中也存的时间就是当地时间 16:35。更改 Windows 时间设置也会直接同步到 BIOS。
* Linux 默认将 BIOS 时间基本解释为 UTC 时间。也就是说 Linux 下操作系统时间显示为 16:35，但 CMOS 中存的是 UTC 时间 8:35。由于系统时间会进行网络同步，Linux 不会因此频繁设置 BIOS 时间，而是存一个时间偏移文件 /etc/adjtime 它也会计算到里面。

解决这个问题，就需要让 Windows 和 Linux 对 BIOS 时间的解释和设置行为保持一致。

## Linux 时区设置

首先要确保在两个系统下时区的设置是正确的。
Windows 下时区的设置比较直观，这里只介绍 Linux 下如何正确地设置时区。首先通过 `date` 命令来查看当前设置：

```bash
date -R
```

设置时区为亚洲上海（东 8 区，同北京时间、乌鲁木齐时间）:

```bash
# ArchLinux 为例，其他多数发行版也适用
cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

在 [这里](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 有所有时区名字的详细信息。

## Linux 时间设置

先确保在 Linux 下你有正确的操作系统时间，然后再搞定和 Windows 不一致的问题。直接设置操作系统时间可以用 `date` 命令：

```bash
# 这里写的是当地时间，会按照上述时区设置解释
date -s 13:52:00
# 使用上述操作系统时间更新 BIOS 时间
hwclock --systz
```

如果有网络也可以从 NTP 服务器来更新：

```bash
ntpdate time.windows.com
```

在系统已经安装完成后应该启动自动更新时间的服务：

```bash
systemctl enable ntpd
```

## 让 Windows 使用 UTC 时间

可以更新 Windows 设置，让 Linux 和 Windows 都把 BIOS 时间解释为 UTC 时间。
打开注册表编辑器（Win+R 输入 regedit 并回车），找到以下目录位置：

```
HKEY_LOCAL_MACHINE/SYSTEM/CurrentControlSet/Control/TimeZoneInformation/
```

添加一项类型为 REG_DWORD、名为 RealTimeIsUniversal，值为 1 的键然后重启即可。

## 让 Linux 使用当地时间

更改 Linux 时间设置，让它和 Windows 一样把 BIOS 时间当作当地时间：

```bash
timedatectl set-local-rtc 1
```

较旧的，没有 `timedatectl` 的发行版可以设置 `/etc/default/rcS` 来得到一样的效果：

```bash
sudo sed -i 's/UTC=no/UTC=yes/' /etc/default/rcS
```

> Ubuntu 16.04 以后会检测是否有 Windows 安装，来自动解释为当地时间。这样 Ubuntu 可以更加容易让新手上手。
