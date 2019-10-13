---
title: ArchLinux 下的屏幕背光恢复
tags: ArchLinux Mac systemd 屏幕背光
---

最近发现我的 ArchLinux 每次解锁之后屏幕背光都会设置为最大，今晚终于有时间把它修复了。
写这篇文章介绍在 ArchLinux 下开机（Boot）和解锁（Resume）时，如何恢复此前的屏幕背光。
先解释背光控制的机制，再给如何入配置和调试。
本文以 MacBook Pro 2013 Late 为例（intel 显卡，`xf86-video-intel` 驱动）。

> 本文只解决背光恢复的问题，如果你的 Fn 功能键无法调整背光，请参考 [在 MacBookPro 上安装 ArchLinux](https://harttle.land/2019/04/26/macbook-archlinux-install.html) 中的“显示器/键盘背光”一节。

<!--more-->

## 准备工作

要解决背光设置不正确的问题，关键是找到是谁恢复和设置的背光。
为此，可以先逐一关掉电源管理工具（upower, ltp, acpid 等）、
X11 的屏幕解锁/锁定工具（xss-lock 等）、
桌面管理器的锁定工具（i3-lock 等）、
自己安装的背光管理工具（macbook-light 等）。

* 如果已经恢复了，那么恭喜你找到了问题；
* 如果把它们都关掉后问题仍然存在，那么你可能遇到了和 Harttle 一样的问题，继续阅读本文。

## systemd-backlight 服务

执行 `sudo systemctl`，查看是否存在这些 backlight 相关的服务：

```
systemd-backlight@backlight:intel_backlight.service
systemd-backlight@backlight:acpi_video0.service
systemd-backlight@backlight:kbd_backlight.service
```

这是安装 ArchLinux 后，由 [systemd](https://wiki.archlinux.org/index.php/Systemd) 包提供的 `systemd-backlight@.service`。
systemd-backlight 它会去读取 ACPI 提供的背光设备，为每个设备创建对应的 systemd 服务。
比如我的 /sys/class/backlight 下包含 intel_backlight 和 acpi_video0 两个目录，
它分别创建了 `systemd-backlight@backlight:intel_backlight.service` 和 `systemd-backlight@backlight:acpi_video0.service`。
另一个 kbd_backlight 是键盘背光，在 ACPI led 的目录下暂且不论。
**正是这些具体的服务控制着背光存储和恢复。**

## systemd-backlight 调试

首先，先把这些服务都停了，合上打开显示器盖子，看是否背光还会被发生变化。
如果你的背光还会恢复，那么请回到第一步“准备工作”：还有其他软件在调整屏幕背光。

```bash
sudo systemctl stop systemd-backlight@backlight:intel_backlight.service
# 如果你也有 acpi_video0，把它也停了
sudo systemctl stop systemd-backlight@backlight:acpi_video0.service
```

如果停掉这些服务后屏幕背光已经没有任何变化了，那么把它们依次打开并调试它的工作过程
（参考 [systemd-backlight 的 manual](https://jlk.fjfi.cvut.cz/arch/manpages/man/systemd-backlight%40.service.8)），
以 acpi_video0 为例：
屏幕背光存在类似 /sys/class/backlight/acpi_video/brightness 的文件中，
在关机、合上盖子时，它会被存在 /var/lib/systemd/backlight/pci-0000:00:02.0:backlight:acpi_video0 中，
在开机、打开盖子时，会从这里取值并设置回 /sys/class/backlight/acpi_video/brightness。
请确认是哪一步骤发生问题了：

1. 在文件 /sys/class/backlight/acpi_video/brightness 里写入新的值，屏幕背光亮度不会发生变化。那么你遇到了和我一样的问题，看下一节。
2. 在文件 /var/lib/systemd/backlight/pci-0000:00:02.0:backlight:acpi_video0 里的值不正确。可以通过 `systemd-backlight` 命令来帮它存一下：
    ```bash
    /usr/lib/systemd/systemd-backlight save backlight:acpi_video0
    ```

## 找到正确的 ACPI 设备

一篇非常有用的 [Arch Wiki](https://wiki.archlinux.org/index.php/Backlight#Kernel_command-line_options) 指出，由于主板实现和 ACPI 的问题，
即使已经存在 backlight 设备的情况下，ACPI 也会重新注册一个自己的设备。
通常会使得屏幕背光恢复失效。**如何找到正确的设备呢？**

我的 /sys/class/backlight 下就有两个目录：intel_backlight 和 acpi_video0。
我们可以通过写其中的 brightness 文件的值来设置屏幕背光亮度。比如：

```bash
echo 80 > /sys/class/backlight/intel_backlight/brightness
```

可以发现 intel_backlight 是可用的，acpi_video0 是不起作用的。
**因此我们需要把 acpi_video0 这个设备干掉，让 ACPI 不生成和使用这个设备。**
那个 systemd 服务我们不需要去管，因为 systemd-backlight 是根据 ACPI 设备来创建服务的，
没有 ACPI 设备就不会创建对应服务。

## 禁止 ACPI 注册背光设备

[Arch Wiki 的这一节](https://wiki.archlinux.org/index.php/Backlight#Kernel_command-line_options) 提供了一些内核参数，通过 `acpi_backlight=none` 可以关闭 ACPI 的屏幕背光设备。
当前的内核启动命令（包含参数）可以通过 `cat /proc/cmdline` 来查看。
先去确认里面是否包含 `acpi_backlight` 相关配置。

如果确认这个配置不存在，那接下来就需要在启动内核的地方，加入这个参数。
如何设置内核参数和你的 BootLoader 有关，即你的 Linux 是怎样启动的？
下面以我的 rEFInd 为例（
如果你是其他 Boot Loader，可以参考这篇文档：<https://wiki.archlinux.org/index.php/Kernel_parameters>）。

打开 `/boot/refind_linux.conf` 文件，在其中的参数列表中，加入 `acpi_backlight=none`：

```
"Boot with standard options" "ro root=UUID=341d4747-bcc0-4b68-92dc-c4f6cd805c83 acpi_backlight=none"
```

注意所有空格、引号、缩进的使用，这个文件挂了可能会无法进入系统。
也可以在写入这个文件之前做些调试：开机启动到 rEFInd 时按下 F2 进入内核参数菜单，写入参数，然后继续启动。
总之这样在重启系统后屏幕背光就可以正确地恢复了。

## 参考文档

* <https://jlk.fjfi.cvut.cz/arch/manpages/man/systemd-backlight%40.service.8>
* <https://wiki.archlinux.org/index.php/Backlight#Kernel_command-line_options>
* <https://wiki.archlinux.org/index.php/Kernel_parameters#rEFInd>
* <https://wiki.archlinux.org/index.php/Systemd>
* <https://harttle.land/2019/04/26/macbook-archlinux-install.html>