---
title: Raspbian Jessie 的 GPIO 串口配置
tags: Raspbian GPIO UART
---

[Raspberry Pi][rasp] 开源硬件提供了 [GPIO][gpio] (General Purpose Input/Output) 接口，
但 Raspberry Pi 3 新增的蓝牙支持占用了原 GPIO 使用的 UART（PL011），
让 [GPIO 14/15 引脚转而使用 Mini UART][rename]，因此对于不使用蓝牙的用户降低了 GPIO 的吞吐量。
为了使 GPIO 继续使用 UART 协议以及设置对应设备（`/etc/ttyAMA0`）权限笔者话费了不少功夫，
于是将串口配置过程记录在此。

> 如果你不是在使用 GPIO（比如连接 Arduino、传感器等等）引脚，本文基本与你无关。

<!--more-->

# 相关概念

> 只关心如何配置可跳过本节。

# PL011 vs Mini

[串口][serial-port]区别于并口，是指逐位传输数据的接口。所以理论上只需要三根线（全双工的话）：
接收线、发送线和地线。 本文的重点 UART（Universal Asynchronouse Receiver/Transmitter）
是 Raspberry Pi 使用的串口协议（即 PL011）。Universal 是指可以自定义传输格式与波特率，
Async 是指不依赖于 CPU 时钟（类似 MMU，UART 也有独立的 IC 电路可以独立工作）。

Raspberry Pi 3 之前 GPIO 使用 UART 设备工作，但 Raspberry Pi 3 引入蓝牙后占用了该设备。
让 GPIO 去使用半软件实现的 Mini UART，因此速度差了很多。

## 驱动与设备

所有设备在 Unix 下都被抽象为文件，可通过标准输入输出对其操作。
无论是 PL011 还是 Mini 都需要将驱动加载到内核中，而这些驱动会创建对应的字符设备以供读写。
这些设备的命名多为类型+序号，例如：

x86 x64 PC 架构下串口通常命名为 `/dev/ttyS0`（Serial 0），
Raspbian 是 ARM 架构的因此其串口命名为`/dev/ttyAMA0`（TeleTyper ARM UART 0）。
其实接口设备命名完全取决于驱动实现者的喜好，比如 Raspbian Pi 3 的 `/dev/ttyAMA0` 被蓝牙占用后
却给出一个 `/dev/ttyS0` 设备用于 Mini UART。
然后为了使得新旧 Raspberry 可以使用同一张 SD 卡，又将非 Raspberry Pi 3 的 `/dev/ttyAMA0`
和 Raspberry Pi 3 的 `/dev/ttyS0` 软链接到同一个`/dev/serial0`
（这样虽然软件在新旧 Raspberry 都可以正常工作但性能差很多有没有...）。

> 上述串口是指 CPU 串行接口，不同于 Windows 的 COM1（RS232-C）。

# 使用 GPIO

GPIO 默认是关闭的，首先需要在`/boot/config.txt`中开启它：

```
enable_uart=1
```

此外树莓派的 GPIO 默认用于 Console（在没有网络时连接一个 Terminal上去），因此在将 GPIO 用于其他用途之前
需要将 GPIO Console 的相关守护进程关掉（其实是个 getty），否则你设置的[udev rules][udev rules]会被覆盖。
如果你在用 Raspbian 或其他 systemd 守护进程管理的系统，
使用 `systemctl` 关掉它（否则请查阅 init.d 手册）：

```bash
sudo systemctl disable serial-getty@ttyS0.service
```

同时，在启动脚本（`/boot/cmdline.txt`）中干掉`console=ttyAMA0`或`console=ttyS0`之类的配置。更改之后的`/boot/cmdline.txt`类似这样：

```
dwc_otg.lpm_enable=0 console=tty1 root=/dev/mmcblk0p2 rootfstype=ext4 elevator=deadline rootwait fbcon=map:10 fbcon=font:ProFont6x11 logo.nologo
```

# 访问权限

为了以编程方式访问这些设备，我们需要为它们设置正确的权限。
相比于 Shell 脚本（比如`/etc/rc.local`），通过[udev][udev]设备管理工具配置还支持热插拔，
其配置文件在`/etc/udev/rules.d`中，就像其他 Unix 配置一样较大序号的文件会在较晚执行，
因此建议你选择一个大一点的序号以免被覆盖，比如：`/etc/udev/rules.d/91-local.rules`。
该文件中可以配置设备文件的用户组、权限等，比如：

```
KERNEL=="ttyS0", MODE="666", OWNER="pi", GROUP="dialout"
```

通常可以采取两种配置方式：

* 设置设备的用户组（如`dialout`）以及用户组访问权限（如`660`），并将你运行程序的用户添加到该用户组（`gpasswd --add pi dialout`）。
* 直接设置设备的访问权限为`666`。

> 可以通过 `sudo udevadm trigger` 来立即应用 udev 配置。
> 如果你遇到问题，还可以在 `/var/log/syslog` 中查看 udev 的日志。

# 切换到 UART

由于 Mini UART 性能稍差，可以关闭蓝牙或让蓝牙去使用 Mini，让 GPIO 继续使用 UART。
表现为 GPIO 上的信号继续从 `ttyMAM0`（UART） 读取，而不是 `ttyS0` （Mini UART）。
需要在`/boot/config.txt`中添加配置：

```
dtoverlay=pi3-miniuart-bt # 让蓝牙使用 Mini UART
dtoverlay=pi3-disable-bt  # 直接关闭蓝牙
```

重启即可生效，这时你会看到`/dev/serial0`不再软链到`/dev/ttyS0`，而是直接软链到`/dev/ttyMAM0`。
如果你切换到了`/dev/ttyMAM0`，上文中相关配置也要从`ttyS0`改为`ttyMAM0`。

[gpio]: https://en.wikipedia.org/wiki/General-purpose_input/output
[rasp]: raspberrypi.org/documentation/
[serial-port]: https://en.wikipedia.org/wiki/Serial_port
[rename]: https://github.com/raspberrypi/linux/issues/1399
[udev rules]: http://www.reactivated.net/writing_udev_rules.html
[udev]: https://wiki.archlinux.org/index.php/Udev
