---
layout: blog
title: 用Grub Rescue手动引导来启动内核
tags: Bash GNU Grub Linux Ubuntu Windows 操作系统
---

> Wikipedia: [GNU Grub][grub]是一个来自GNU项目的启动引导程序。GRUB是多启动规范的实现，它允许用户可以在计算机内同时拥有多个操作系统，并在计算机启动时选择希望运行的操作系统。
> GRUB可用于选择操作系统分区上的不同内核，也可用于向这些内核传递启动参数。

几乎所有人的Linux都是一个双系统，所以Grub也是几乎所有Linux用户熟知的东西。
但很多原因都可以导致Linux无法启动，比如安装了不合适的驱动程序、由于安装Windows重写了MBR、安装内核时参数搞错了等。

![](/assets/img/blog/grub.png)

这时我们通常会用一个启动盘来重置MBR，并重新配置硬盘上的Grub。但很多情况下我们并不需要这样一个启动盘，Grub无法启动内核时会提供Grub Rescue终端。
在这里可以手动引导来启动内核，然后重新安装和配置Grub。本文便来记录这一过程。

Grub的手册在这里： https://www.gnu.org/software/grub/manual/

<!--more-->

# Grub Rescue 引导内核

Grub无法启动内核时，便会进入Grub Rescue模式，应该是像这样的：

![@2x](/assets/img/blog/grub-rescue.png)

## 确定内核位置

[ls]命令可以列出Grub能搜索到的所有设备，其中`(hdX, Y)`指硬盘驱动器`X`中的分区`Y`。
然后继续[ls]来确认要启动的Linux内核所在的路径。

```bash
# 查看可选驱动器
ls 
# 试试哪个里面是 Linux
ls (hdX,Y)/boot/grub 
```

## 环境设置

[set]命令是用来设置Grub环境变量的。比如设置`prefix`之后我们便不需要写完整路径了，只需要给出以根路径开始的绝对路径即可（见下文）。
[insmod]用来载入一些Grub的动态模块，比如`linux.mod`。

```bash
set prefix=(hdX,Y)/boot/grub
insmod (hdX,Y)/boot/grub/linux.mod # 可选，为了方便接下来的命令
set root=(hdX,Y)
```

## 启动内核

[linux]命令用来从文件载入一个内核，载入之后用[initrd]命令载入初始化内核的内存（还可以在内存中设置一些参数）。
最后用[boot]命令启动它！

```bash
# 也可以选用别的内核，如/boot/vmlinuz.0.62.XXX
linux /vmlinuz root=/dev/sda5       
initrd /initrd.img
boot
```

# 配置文件

系统启动之后我们便可以解决问题了，重新配置内核或者重新配置Grub。 Grub配置文件路径：

```
grub1：/boot/grub/grub.cfg
grub2：/etc/default/grub
```

一般只需要更新Grub配置文件中的内核列表，根据你的系统环境不同，执行下面三者之一即可：

```bash
update-grub                             #ubuntu grub
update-grub2                            #ubuntu grub2
grub-mkconfig -o /boot/grub/grub.cfg    #archlinux
```

在Grub配置文件中，可以设置开机时启动列表的顺序，这个可能比较有用：

```bash
# 如果是saved, 旧版grub需设 GRUB_SAVEDEFAULT=true() #需要更新内核列表
GRUB_DEFAULT=0,1,2...saved    
```

# 写入MBR

上文通过Grub Rescue来手动引导内核的前提是Grub可以正常启动，只是Grub找不到内核了。但对于安装Windows导致的MBR被重写，Grub也是无法启动的。
这时需要用一个Linux启动盘来进入系统，然后将Grub启动记录写入MBR：

```bash
# Linux系统所在分区
mount /dev/sda7 /mnt/linuxsys           
# 如果/boot 单独分区
mount /dev/sda6 / mnt/linuxsys/boot     
# grub1.99与以后（grub2）
grub-install --boot-directory=/mnt/linuxsys/boot /dev/sda     
# grub1.98与以前（grub1）
grub-install --root-directory=/mnt/linuxsys /dev/sda          
```

[grub]: https://zh.wikipedia.org/wiki/GNU_GRUB
[grub]: https://zh.wikipedia.org/wiki/GNU_GRUB
[linux]: https://www.gnu.org/software/grub/manual/html_node/linux.html#linux
[initrd]: https://www.gnu.org/software/grub/manual/html_node/initrd.html
[boot]: https://www.gnu.org/software/grub/manual/html_node/boot.html
[insmod]: https://www.gnu.org/software/grub/manual/html_node/insmod.html
[set]: https://www.gnu.org/software/grub/manual/html_node/set.html
[ls]: https://www.gnu.org/software/grub/manual/html_node/ls.html

