---
title: 让 ArchLinux 休眠到交换文件
tags: ArchLinux 交换文件 休眠
---

Linux 使用交换分区来休眠，首先冻结所有进程并申请足够的交换内存（位于磁盘），把当前内存都存进去。
然后下次启动时，initramfs 会直接加载上次休眠时的内存状态，跳过内核的 init 过程。
因此首先需要有足够大的交换分区或交换文件；再把内核指向到休眠的分区上；最后再配置 initramfs 让它加载休眠的内存文件。
官方文档请参考 [Power_management/Suspend_and_hibernate#Hibernation][hibernate]，
本文细述如何休眠到交换文件，并对其中一些概念和细节进行了解释。 

在本文讨论的范围内，
**挂起**（suspend）是指冻结当前的进程，保留它们的内存，并把几乎除了内存之外的设备都断电。
**休眠**（hibernate）是指把挂起后的内存写入磁盘并完全关机。
**锁定**（lock）则只是显示一个模态的全屏软件输入正确的密码才能退出。

<!--more-->

## 交换文件

在[安装系统][archinstall]前需要创建交换分区，现在的机器普遍内存较大不太需要交换分区来扩展内存空间，
而且磁盘一般使用读写快速但读写次数有限 SSD，因此 Harttle 的交换分区也很小根本不够用来休眠。

> 你可以通过 swapiniss 来让你的交换分区只用于休眠。

所以我们用交换文件来替代交换分区，在创建交换文件之前首先需要知道系统休眠需要多大空间。
可以从 sysfs 来看查看：

```bash
cat /sys/power/image_size
```

可以参考 [官方教程][https://wiki.archlinux.org/index.php/Swap#Swap_file] 来创建：

```bash
# 按照你需要的大小创建，bs * count 是最终文件大小
dd if=/dev/zero of=/swapfile bs=1M count=4096 status=progress
chmod 600 /swapfile
# 检查大小和权限
ls -l /swapfile

# 初始化交换文件并立即应用到系统
mkswap /swapfile
swapon /swapfile

# 在 /etc/fstab 中写入以下内容，交换文件会在重启后生效
/swapfile none swap defaults 0 0
```

重启后通过 `swapon -s` 来检查是否生效：

```bash
> sudo swapon -s
Filename    Type    Size     Used    Priority
/swapfile   file    12582908    0    -2
```

## 让内核找到交换文件

我们需要设置 resume 和 resume_offset 两个内核参数，告诉内核在挂起时把内存写入到哪里。

* 第一个参数是交换文件所在的磁盘分区，可以用任何 fstab 中接受的名字格式。比如 resume=/dev/sda1，或者 resume=UUID=xxx。如果你在上一步中创建的交换文件和 / 在同一分区下，可以复制已有的 root 内核参数的值。
* 第二个参数是交换文件的偏移量，就是它在分区中的什么位置。因此这个参数给交换文件用的，如果是交换分区则不需要填写。可以通过 `filefrag -v /swapfile | awk '{ if($1=="0:"){print $4} }'` 命令得到。

可以通过 `cat /proc/cmdline` 来查看当前的内核参数，但是在哪里设置取决于你的 Boot Loader。
以 rEFInd 为例，打开 /boot/refind_linux.conf 写入 resume 和 resume_offset：

```
"Boot with standard options" "ro root=/dev/sda3 resume=/dev/sda3 resume_offset=3192832"
```

重启后用 `journalctl` 或 `dmesg` 来找到写入休眠镜像的日志：

```
Oct 19 13:57:56 harttle.arch.mac kernal: PM: Creating hibernation image:
Oct 19 13:57:56 harttle.arch.mac kernel: PM: Need to copy 596422 pages
Oct 19 13:57:56 harttle.arch.mac kernel: PM: Normal pages needed: 596422 + 1024, available pages: 1477067
```

如果看到这样的错误说明设置有误，请检查你交换文件所在分区和 filefrag 给出的偏移量：

```
Oct 19 13:57:56 harttle.arch.mac kernal: PM: Image not found (code -22)
```

## 让 initramfs 加载休眠的内存

initramfs 是由 Boot Loader 直接加载的一个早期的用户空间，其中已经加载了一些内核模块。
它会进行设备初始化、挂载文件系统、运行磁盘检查等工作，之后再交给内核的 init 过程。
加载休眠的内存也是它的工作，但 ArchLinux 默认并未开启，需要去 /etc/mkinitcpio.conf 中添加 resume 钩子：

```
HOOKS=(base udev resume autodetect modconf block filesystems keyboard fsck)
```

注意因为 resume 参数用到了磁盘设备名称，resume 需要写在 udev 之后。
然后重新编译 initramfs（就像更新内核时一样）：

```bash
# 默认使用当前系统的内核，如果你现在位于启动盘的系统则需要指定宿主环境上的内核版本。
mkinitcpio -p linux
```

至此配置工作都完成了，通过 `systemctl hibernate` 来休眠，再按下电源键开机来检查休眠功能是否正常。

## 自动休眠

自动休眠和其他电源管理功能，由很多不同的软件和配置方式来实现。为避免混淆先介绍几个常见的软件：

**systemd-logind**：ArchLinux 的默认安装包含了 systemd，其中的 systemd-logind 是自动启用的。
它包含了一些非常简单的电源管理功能，比如按下电源按钮时关机、笔记本合上盖子时挂起。
因此 ArchLinux 装好之后就基本可以用了。

**acpid**：[acpid][acpid] 是一个比较基础的电源管理工具，工作方式是响应 [ACPI][ACPI] 事件，做相应的处理比如关机还是休眠。注意 acpid 只是电源管理工具，ACPI 是设备配置接口跟它没关系。

**tlp**：[tlp][tlp] 是一个比较无脑的电源管理工具，提供类似电池模式、电源模式、性能优先这样级别的配置。

**xss-lock**, **xidle**, **xautolock**：这些是 X11 下的工具用来在用户无操作时执行挂起等操作，有些还会监听 ACPI 事件，这样在 suspend 时屏幕也能锁定。

### 无操作自动休眠

自动休眠和自动挂起需要桌面环境（DE）或者 X11 软件的支持。
如果你在用 Gnome 或 KDE 在控制面板中配置后，会把 idle 信息报告给 systemd-logind，后者接管具体操作。

如果你像 Harttle 一样没有桌面系统和登录管理器的话，
需要安装一个类似 xss-lock, xidle 这样的工具来靠 X11 事件计时，
然后调用 `systemctl hibernate` 或 `systemctl syspend`。

### 先挂起后休眠

合上盖子后 systemd-logind 的默认行为是挂起，可以在 `/etc/systemd/logind.conf`
中把它重新设置为休眠，或先挂起再休眠：

```
HandleLidSwitch=suspend-then-hibernate
```

挂起后休眠前的时间可以在 /etc/systemd/sleep.conf 中设置：

```
HibernateDelaySec=15min
```

除了合上盖子之外，其他场景也可以直接调用 `systemctl suspend-then-hibernate`。

### 电量低自动休眠

这件事情需要具体的软件来做，或者直接安装 [tlp][tlp] 并启动 tlp, tlp-sleep 两个 systemd 服务。
下面提供一个简单的 udev 规则，在电量小于等于 5% 时休眠：

```
SUBSYSTEM=="power_supply", ATTR{status}=="Discharging", ATTR{capacity}=="[0-5]", RUN+="/usr/bin/systemctl hibernate"
```

把它写入 /etc/udev/rules.d/99-lowbat.rules，重启即可生效。

[tlp]: https://wiki.archlinux.org/index.php/TLP
[acpid]: https://wiki.archlinux.org/index.php/Acpid
[acpi]: https://en.wikipedia.org/wiki/Advanced_Configuration_and_Power_Interface
[hibernate]: https://wiki.archlinux.org/index.php/Power_management/Suspend_and_hibernate#Hibernation
[archinstall]: https://harttle.land/2019/04/26/macbook-archlinux-install.html