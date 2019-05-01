---
title: 在 MacBookPro 上安装 ArchLinux
tags: ArchLinux MacBook WiFi 声卡驱动 屏幕亮度 键盘背光
---

很久以前写过一篇 [安装 Arch Linux](/2013/11/07/arch-install.html) 的文章，解释在普通 PC 上安装 ArchLinux。
如今需要把一台 MacBook Pro（2013 Late）用于工作，而且 ArchWiki 上介绍安装系统的 Beginners' Guide 也已经没有了，就借机写一篇如何在 MacBook Pro 上安装 ArchLinux 的介绍。

注意：本文介绍的是在 MacBoot Pro 上安装 ArchLinux 单系统。其他方案请直接参考 <https://wiki.archlinux.org/index.php/Mac>。

<!--more-->

## 准备工作

1. 升级系统到最新。选择 Archlinux Only 这样以后就无法（reliably）更新固件了。
2. 备份所有有用的东西。比如你的个人文件以及家目录下的各种配置文件。额外注意色彩配置文件：/Library/ColorSync/Profiles/Displays
3. 准备一个 U 盘，准备多余的一台电脑（用于查文档）。
4. 网线和以太网转换器。因为无线网卡驱动 broadcom-wl 不在启动盘中，[拷贝源码来编译](https://wiki.archlinux.org/index.php/MacBookPro11,x#Internet) 的方案很困难。因为，
    * makepkg 编译内核模块需要一套 Arch 开发环境（glibc、gcc 等），还必须和目标的内核版本完全一致，哪里找这样的机器！
    * Mac 只有两个 USB 插口，以太网线转换器占用一个，启动盘占用一个。拷贝驱动时要注意只能拔网线的插口，否则不好重新 mount 后续 pacstrap 和 pacman 会受到影响。
5. 刻录安装盘。从 [download](https://www.archlinux.org/download/) 页面下载镜像，有种子和磁力链接可选。然后 dd 到你的 U 盘，注意要写 /dev/sdc 而不是 /dev/sdc1，否则启动记录上不去会无法启动。
6. 明确你的 MacBook 型号。可以从 <https://support.apple.com/zh-cn/HT201300> 查到，比如我的电脑是 MacBookPro 11,1

```bash
dd bs=4M if=path/to/archlinux.iso of=/dev/sdx status=progress oflag=sync
```

## 分区、文件系统、挂载

这一步是最关键的，如果有误后续步骤需要重来。[Arch Wiki](https://wiki.archlinux.org/index.php/Mac#Partitions) 上提供了很多方案，本文选择的是 Archlinux Only。
由于 Mac 下需要使用 EFI 引导，所以需要一个 EFI 分区（EFI System Partition，后续叫 ESP），

分区。直接进入 `fdisk /dev/sda`，先删除所有已有分区，建立 GPT 分区表，再依次分配 ESP、Swap、Linux Root 的分区。
分区大小可以参考这个表格：<https://wiki.archlinux.org/index.php/Installation_guide#Example_layouts>。
搞定后写入并退出即可。

格式化。ESP 一定要格式化为 vfat；swap 需要使用特殊的命令来初始化；Linux root 是你的主文件系统可以随便选择，比如 ext4：

```bash
mkfs.vfat /dev/sda1     # 很关键
mkswap /dev/sda2
swapon /dev/sda2
mkfs.ext4 /dev/sda3
```

然后挂载到相应的地方：

```bash
mount /dev/sda3 /mnt
mount -t vfat /dev/sda1 /mnt/boot   # -t 参数很关键
```

然后你会得到一个类似这样的分区，可以通过 mount 命令来检查一下有没有大的出入：

设备 | 大小 | 类型 | 挂载点
--- | --- | --- | ---
/dev/sda1 | 400M | ESP | /mnt/boot
/dev/sda2 | 2G   | Linux swap | [swap]
/dev/sda3 | 490G | Linux root | /mnt

## 连接有线网络

使用 ArchLinux 安装盘安装系统的原理，就是用安装盘上的 pacman 安装 base 软件组到硬盘。
这就需要网络，如前所述我们采取有线网的方式。把网线和转换器插好后查看 interface：

```bash
ip link
```

你应该能看到一个 lo，以及一个 en 开头的比如 enp0s20u1。这就是以太网的 interface。
然后拷贝一份 netctl 的示例配置并启动它：

```bash
cp /etc/netctl/examples/ethernet-dhcp /etc/netctl/ethernet-dhcp
netctl start ethernet-dhcp
```

如果有问题可以用 `journalctl -xe` 来查看，更多 netctl 的使用请参考：<https://wiki.archlinux.org/index.php/Netctl#Wireless>。

## 下载文件并做配置

这一步是最简单的，因为 Arch 提供了一个 [base](https://www.archlinux.org/groups/x86_64/base/) 软件组。
但首先要配置镜像，可以把速度从 10k 提升到 10M，节省一万年的时间。

```bash
# 配置镜像。从这里挑几个，按照已有镜像的格式，写到头部：
# https://wiki.archlinux.org/index.php/Mirrors_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)
vim /etc/pacman.d/mirrorlist

# 安装 base 到 /mnt
pacstrap /mnt base
```

现在你已经有一个完整的 Arch 操作系统在 /dev/sda3 了，在启动它之前一点配置：

```bash
genfstab -U /mnt >> /mnt/etc/fstab  # 生成文件系统表（启动时挂载用）
arch-chroot /mnt                    # 注意不要直接 chroot
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime # 配置时区为上海
hwclock --systohc                   # 同步硬件时钟
vim /etc/locale.gen                 # 启用一些地区配置，选你需要的去掉注释
locale-gen                          # 生成地区配置
echo LANG=en_US.UTF-8 > /etc/locale.conf    # 配置 LANG 变量
vim /etc/pacman.d/mirrorlist        # 配置镜像，同上
echo FONT=ter-p28b >> /etc/vconsole.conf # 如果你是 Ritina 屏，把字体配置大一点。
```


上述 [/etc/vconsole.conf](https://www.freedesktop.org/software/systemd/man/vconsole.conf.html) 中的字体会在 ArchLinux 启动时读取对所有 TTY（Virtual Console）生效。
可以先使用 [setfont](https://wiki.archlinux.org/index.php/Linux_console#Fonts) 命令来切换试试看：

```bash
setfont ter-p28b
```

## 建立引导

现在到了另一个关键的步骤，为已经配置好的操作系统配置引导。
现在的状态是 arch-chroot 之后，从引导盘进入硬盘的系统环境。
[官网文档](https://wiki.archlinux.org/index.php/Mac#Setup_bootloader) 提供了两种方式：

* Using the native Apple bootloader with systemd-boot (Recommended)
* Using the native Apple bootloader with GRUB

方法一的原理是 systemd-boot 安装的 `/EFI/BOOT/BOOTX64.EFI` 正好也是 Mac 自带的 BootLoader 读取的文件。
只需要 `bootctl --path=/boot install` 过去。笔者试了不好使，你可以再尝试一下。

方法二的原理是 Mac 自带的 BootLoader 会去每个 HFS+ 分区读取 .efi 文件。但我们已经格式化为 ext4 和 vfat。这个方法不可行。

既然都不好使，Harttle 就使用了替代方案，安装 [rEFInd](https://wiki.archlinux.org/index.php/REFInd#Installation_with_refind-install_script) 来引导系统：

```bash
pacman -S refind-efi
refind-install
```

`refind-install` 会自动找到 efi 分区并把自己注册为默认的 UEFI 引导程序（BootLoader），
执行结束后一定去 /boot/refind_linux.conf 查看一下。
确保配置中的第一项的 root 赋值为 / 所在的磁盘（对我来讲是 /dev/sda3）的 UUID。
否则会在重启自检时报告类似这样的错误：

```txt
device '' not found. Skipping fsck.

# 正常情况下应该类似
/dev/sda3: clean, 322/342432 files, 432/432432 blocks
```

我在 U 盘引导盘操作得到的 /boot/refind_linux.con 如下：

```txt
"Boot with standard options"  "archisobaseddir=arch archisolabel=ARCH_201904"
"Boot to single user mode"    "archisobaseddir=arch archisolabel=ARCH_201904 single"
"Boot with minimal options"   "ro root=UUID=xxxxxxxx-xxxx-xxxxxxxx-xxxxxxxx"
```

其中最后一项才是 /dev/sda3 的 UUID（可以在 /etc/fstab 中查看），把拷贝到第一行就能完美启动了。

```txt
"Boot with standard options"   "ro root=UUID=xxxxxxxx-xxxx-xxxxxxxx-xxxxxxxx"
```

启动时需要在 rEFInd 中选择启动哪个镜像，
可以在 /boot/EFI/refind/refind.conf 中配置 timeout: -1 来让它直接启动默认选项。
refind.conf 文件中有详细的说明需要请自取。

## Wifi 网络

前面的章节我们在启动盘的系统上配置过网络，现在我们进入了已经安装好的系统。
有线网的配置方式同上，这里主要介绍无线网的配置。首先安装几个包：

```bash
pacman -S dialog wpa-supplicant broadcom-wl
```

其中 dialog 是 wifi-menu 需要；wpa-supplicant 用于 WiFi 验证，netct 加载 wireless 网络时需要；
broadcom-wl 是 MacBook 的无线网卡驱动。装好后把驱动载入内核：

```bash
rmmod b43 ssb bcma wl   # 这里有失败很正常，移除存在的模块即可
modprobe wl
```

无线网络通过 [netctl](https://wiki.archlinux.org/index.php/Netctl#Enabling_a_profile) 来管理，因此配置无线网络的方式就是生成 netctl 配置。
如果是开放网络或者用户密码方式的，可以拷贝 /etc/netctl/examples 下对应的配置文件到 /etc/netctl/。
或者使用 wifi-menu 命令，它会扫描网络并帮你生成配置。

但如果你是 WPA-EAP 的 wifi-menu 不太好使，需要拷贝一份 wireless-wpa-configsection。
比如拷贝到 wlan-mywifi，内容大概像这样：

```txt
Description="A wireless ..."
Interface=wlp3s0
Connection-wireless
Security=wpa-configsection
IP=dhcp
WPAConfigSection=(
    'ssid=<SSID>'
    'key_mgmt=<WPA-EAP>'
    'eap=<PEAP>'
    'group=<CCMP>'
    'pairwise=<CCMP>'
    'identity=<USER>'
    'password=<PASS>'
    'phase2="autheap=MSCHAPv2"'
)
```

其中 eap, group, pairwise, phase2 等配置可以从其他操作系统的上扣来，也可以找学校或公司网络管理员要。
然后通过 `netctl start wlan-mywifi` 启动。如果 OK 就让它自动启动：`netctl enable wlan-mywifi`。
下面提几个调试方法：

* 使用 wpa_supplicant 提供的 [wpa_cli](https://wiki.archlinux.org/index.php/WPA_supplicant) 调试验证。验证通过后要 `dpcpcd wlp3s0` 来分配 IP。
* netctl switch-to 可以启动一个的同时关掉既有的那个。
* systemctl status 和 journalctl -xe 可以看 netctl 的状态和输出。
* ip addr 来查看 IP 和 MAC 信息。
* ip link set wlp3s0 down/up 来开关网卡。

> 其实并不需要 ifconfig（包含在 net-tools 包中）

## 用户/组配置

到现在为止都是在 root 下进行操作，为了进行日常环境的配置需要创建一个日常用户。
从这个用户 startx 来启动 i3。

```bash
pacman -S sudo
groupadd video                          # 创建 video 组，下文会用到
useradd -m -g wheel -G video harttle    # -m 创建目录，-G 加入到组
```

/etc/sudoers 中配置让 harttle 所在的 wheel 组都有 sudo 权限：

```
%wheel ALL=(ALL) ALL
```

## 窗口管理器

因为我的需求只有打开一个 Shell，或者打开一个浏览器。
因此不打算安装桌面系统，直接找个窗口管理器，比如这个：<https://i3wm.org/docs/userguide.html>。
然后装需要的各种包：

```bash
pacman -S xorg i3-wm i3status i3blocks i3lock rxvt-unicode dmenu
```

其中 rxvt-unicode 就是 urxvt，dmenu 用于在 i3 中执行命令。
接下来重新登录到刚刚创建的普通用户 harttle，Shell 不够用的话可以 Fn+Ctrl+Alt+F2 来新开一个 TTY。
以下命令和文件都在 harttle 用户下进行操作和创建。首先拷贝一份 X11 init 配置。

```bash
cp /etc/X11/xinit/xinitrc ~/.xinitrc
```

在 `.xinitrc` 后面，删掉启动各种 wm 和 X11 软件的代码，加入一行：

```bash
exec /usr/bin/i3
```

然后在 ~/.profile 中直接启动 X：

```bash
if [[ ! $DISPLAY && $XDG_VTNR -eq 1 ]]; then
    exec startx
fi
```

注意 [ArchLinux 中登录 Bash Shell 不一定会读 .profile](https://nanxiao.me/en/why-doesnt-profile-take-effect-in-arch-linux/)，
需要在 .bash_profile 中 source 一下这个 .profile：

```bash
[[ -f ~/.profile ]] && . ~/.profile
```

这样在下次 harttle 登录时，就会直接启动 [i3](https://i3wm.org) 了！

## Ritina 屏幕

到此为止，除了 TTY 字体变大了，其他所有地方包括 i3 都还是小字。
为了解决这个问题我们需要配置多个地方，因为它们会分别被不同的软件读取。

首先改写 X11 的默认配置，在 ~/.Xresources 中增加：

```txt
Xft.dpi: 168
Xft.autohint: 0
Xft.lcdfilter:  lcddefault
Xft.hintstyle:  hintfull
Xft.hinting: 1
Xft.antialias: 1
Xft.rgba: rgb
```

并在 `~/.profile` 中给 GDK 和 QT 也设置好缩放参数：

```bash
export GDK_SCALE=2
export GDK_DPI_SCALE=0.5
export QT_AUTO_SCREEN_SCALE_FACTOR=1
```

现在从 i3 里创建的应用都可以缩放到正常大小了，但这些对 i3 的标题、底栏却不会发生变化，因为它有单独的配置。
在 ~/.config/i3/config 中把 font 改成 pango:DejaVu Sans Mono（这是一个支持 Retina 的字体）：

```txt
font pango:DejaVu Sans Mono 8
```

## 中文和输入法

关于输入法要安装 fcitx、文泉驿字体、Ubuntu 字体等。
其中 Ubuntu 和 wqy-microhei 字体用到 Console 中，noto 包提供 emoji 和中日韩字体。

```bash
pacman -S ttf-ubuntu-font-family noto-fonts-emoji noto-fonts-cjk wqy-microhei fcitx fcitx-rime fcitx-configtool fcitx-gtk2 fcitx-gtk3 fcitx-qt4 fcitx-qt5
```

用 fcitx-configtool 进行可视化的配置，配好之后把 `fcitx&` 加到 ~/.xinitrc 里 `exec i3` 之前。
重新登录即可使用默认的 Control+Space 打开输入法，URxvt 中的中文也可以正常显示了，但是比较丑。
我们可以在 .Xresources 里配置 URxvt 中文字体：

```
URxvt.font: xft:Ubuntu Mono:style=Regular:antialias=True:pixelsize=12,xft:WenQuanYi Micro Hei Mono:style=Regular:pixelsize=12
URxvt.boldFont: xft:Ubuntu Mono:style=Bold:antialias=True:pixelsize=12,xft:WenQuanYi Micro Hei Mono:style=Bold:pixelsize=12
```

X11应用中的字体比较丰富，需要认真配置。可以参考 Harttle 提供的 .fonts.conf：
<https://wiki.archlinux.org/index.php/Font_configuration/Examples#Chinese_in_Noto_Fonts>，基本使用 Noto 字体效果比较贴近主流设备的显示方式。
本次装系统没有涉及终端（VT）字体/中文的配置，感兴趣的同学可以自取一篇旧的文章：[ArchLinux TTY 中文字体渲染](/2016/06/13/archlinux-tty-font.html)

## 触摸板

我们要尽量发挥 Mac 触摸板的优势：双指滚动、自然滚动（反向）、轻击作为按下。
xorg-server 已经依赖了 [xf86-input-libinput](https://www.archlinux.org/packages/?name=xf86-input-libinput)，
在 /etc/X11/xorg.conf.d/90-libinput.conf 做简单的配置就可以用了：

```txt
Section "InputClass"
    Identifier "libinput touchpad catchall"
    MatchIsTouchpad "on"
    MatchDevicePath "/dev/input/event*"
    Driver "libinput"
    Option "NaturalScrolling" "true"
    Option "Tapping" "true"
    Option "ScrollMethod" "twofinger"
EndSection
```

可以参考 [Arch Wiki](https://wiki.archlinux.org/index.php/Mac#Touchpad)
或 [man libinput](https://jlk.fjfi.cvut.cz/arch/manpages/man/libinput.4)，
如果要配置三指、四指滑动等复杂交互，需要引入另一个驱动 xf86-input-mtrack，
Harttle 给了一个比较接近 OSX 手感的配置方法：
[Linux 下 MacBook 触摸板设置](https://harttle.land/2019/05/01/linux-macbook-trackpad-settings.html)。

## CPU 和图形

这里只介绍 Intel 集成显卡打配置，如果是独立显卡或 G 卡请直接参考
[官方文档](https://wiki.archlinux.org/index.php/Mac#Video)。
下面开始安装相应的软件：

```bash
pacman -S mesa xf86-video-intel vulkan-intel mesa-demos 
```

然后进入 /etc/X11/xorg.conf.d/20-intel.conf 给 X 初始化一个配置：

```txt
Section "Device"
  Identifier  "Intel Graphics"
  Driver      "intel"
EndSection
```

再在 CPU /etc/modprobe.d/i915.conf 配置 CPU 参数，
开启 Fastboot 和 Frame Buffer Compression。

```txt
options i915 fastboot=1
options i915 enable_fbc=1
```

到此为止 Harttle 的 CPU 就配置完成了，可以用 `glxgears` 来跑跑 FPS。
你的机器可能不同，下面做两点说明：

* 对于 Skylake CPU（2015 以后的 MacBook）还有 HuC、GuC 等功能，
可以参考 [Enable_GuC_/_HuC_firmware_loading](https://wiki.archlinux.org/index.php/Intel_graphics#Enable_GuC_/_HuC_firmware_loading) 进行开启。
* 如果碰到渲染抖动、无法启动等问题可以参考参考 <https://wiki.archlinux.org/index.php/Intel_graphics#Xorg_configuration>。

## 外接显示器

外接显示器需要配置 X11，使用 [xrandr](https://wiki.archlinux.org/index.php/Xrandr) 非常方便。

```bash
pacman -S xorg-xrandr
xrandr  # 查看接口名字和连接状态
xrandr --output HDMI2 --auto --left-of eDP1    # 让 HDMI2 的显示器放到主显示器的左边
```

调试好后把它存入 `/etc/X11/xorg.conf.d/10-monitor.conf`：

```txt
Section "Monitor"
    Identifier  "eDP1"
    Option      "Primary" "true"
EndSection

Section "Monitor"
    Identifier  "HDMI2"
    Option      "LeftOf" "eDP1"
EndSection
```

重启 X 后就会生效。对于 i3 的 workspace 怎么使用多显示器，官方有 [很详细的文档](https://i3wm.org/docs/userguide.html#multi_monitor)
比如把工作区 2 放到 HDMI2，并把所有打开的 Telegram 窗口也放到工作区2:

```i3
workspace 2 output primary
for_window [class="TelegramDesktop"] move window to workspace 2
```

## 电源管理

> 如果你使用了桌面系统，跳过本节。因为桌面系统会托管电源管理并禁用很多底层配置。

电源管理可以做的很定制很复杂，请参考 [这篇 Arch Wiki](https://wiki.archlinux.org/index.php/Power_management_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)#xss-lock)。
这里只介绍一个简单的例子：可以主动锁屏、可以设置闲置锁屏时间、断电时间等。
先安装 xlock，它实现了屏幕保护动画、密码验证、简单的电源管理功能：

```bash
pacman -S xlockmore
```

现在可以随时按下 xlock 来锁屏了，然后我们还要自动锁屏幕。
[从 AUR 安装][install-from-aur] [xss-lock-git](https://www.mankier.com/1/xss-lock)，
它可以监听 systemd 的 suspend, hibernate, lock-session 等事件。
把下面的一行加入 `~/.xinitrc` 启动 i3 之前（具体参数请 `man xlock`）：

```bash
xss-lock xlock -dpmsstandby 300 -dpmssuspend 600 -dpmsoff 1800 +resetsaver &
```

## 键盘映射

### Caps 和 Control 互换

MacOS 上 Harttle 有把 CapsLock 配置成 Control，现在需要设置 [Xmodmap](https://wiki.archlinux.org/index.php/xmodmap) 来替代。
创建一个 ~/.Xmodmap：

```
clear lock
clear control
keycode 66 = Control_L
add control = Control_L Control_R
```

确保它被 ~/.xinit 引用，可以用 `cat ~/.Xmodmap | xmodmap -` 来调试，很简单立即生效。
TTY 中的键盘映射需要通过 vconsole 的 [keymap](https://wiki.archlinux.org/index.php/Linux_console/Keyboard_configuration#Persistent_configuration) 来配置，由于巨难调试这里略过。

### 功能键作为 Fn

如果你的 Mac 用来编码想必已经开了“功能键默认作为Fn”键使用。
可以在 /etc/modprobe.d/hid_apple.conf 中添加一行：

```
options hid_apple fnmode=2
```

### 响应延迟和频率

在持续按下删除来删掉一行字打情况，或者按下回车来添加空白打时候，出字的速度就是这里说的 **频率**。
第一个字和第二个字之间的间隔就是这里说打 **延迟**。
在 ~/.xinitrc 的适当位置加入下面这一行可以更贴合 MacOS 的手感。

```
xset r rate 200 30
```

重启后即可生效，更多 Mac 键盘的配置可以参考<https://wiki.archlinux.org/index.php/Apple_Keyboard>。下一节我们介绍怎么恢复功能键原有的功能。

## 功能键绑定

显示器亮度、键盘背光、声音大小、静音等按键。
驱动已经在上述的图形、声音、蓝牙部分安装过，现在你可以在 /sys/class/ 的相关位置看到它们的状态了。
接下来要做两件事情：1. X11 按键绑定；2. 按键响应程序，调用和控制各种驱动程序。
本小节解决第一个问题，安装
[xbindkeys](https://wiki.archlinux.org/index.php/Xbindkeys#GUI_method) 
把 X11 解释的功能键绑定到具体命令。

```bash
sudo pacman -S xbindkeys
```

然后创建 ~/.xbindkeysrc 文件，注意其中的空行不得省略：

```txt
"pactl set-sink-volume @DEFAULT_SINK@ +1000"
    m:0x0 + c:123
    XF86AudioRaiseVolume 

"pactl set-sink-volume @DEFAULT_SINK@ -1000"
    m:0x0 + c:122
    XF86AudioLowerVolume 

"pactl set-sink-mute @DEFAULT_SINK@ toggle"
    m:0x0 + c:121
    XF86AudioMute 

"macbook-lighter-screen --inc 70"
    m:0x0 + c:233
    XF86MonBrightnessUp 

"macbook-lighter-screen --dec 70"
    m:0x0 + c:232
    XF86MonBrightnessDown 

"macbook-lighter-kbd --dec 10"
    m:0x0 + c:237
    XF86KbdBrightnessDown 

"macbook-lighter-kbd --inc 10"
    m:0x0 + c:238
    XF86KbdBrightnessUp 
```

可以看到 xbindkeys 用到的命令包括
`pactl`, `macbook-lighter-screen`, `macbook-lighter-kbd`，
后续小节中逐个安装。
现在我们把 xbindkeys 放到 ~/.xinitrcx 中合适的地方即可。
如果安装命令后功能键仍然不起作用，可以 [从 AUR 安装][install-from-aur] 安装一个
[xbindkeys_config-gtk2](https://aur.archlinux.org/xbindkeys_config-gtk2.git) 来调试和可视化配置：

## 声卡驱动

安装驱动、声卡测试程序、命令行接口
[PulseAudio](https://wiki.archlinux.org/index.php/PulseAudio#Installation)。

```bash
pacman -S alsa alsa-utils pulseaudio pulseaudio-alsa
```
alsa 需要配置 /etc/modprobe.d/50-sound.conf，
选项可以从 <https://wiki.archlinux.org/index.php/Mac#Sound> 查到。
比如我的 2013 Late（MacBookPro 11,1）对应的配置是：

```txt
options snd-hda-intel index=1,0 power_save=1
```

重启后使用 `speaker-test -c 2` 来播放白噪声测试，使用 `alsamixer` 可以调节音量。
如果都好使，我们来看 PulseAudio。

PulseAudio 为上述功能键提供来提供了 pactl 命令，
它是服务器-客户端架构，需要服务器启动 pactl 才好使。
服务两种启动方式：作为 daemon 单独启动、被客户命令调用时自动 spawn。
我们选择后者，在 /etc/pulse/client.conf 中确保：

```txt
autospawn = yes
```

重启后，音量控制功能键应该可以正常工作。

## 显示器/键盘背光

显示器背光是 Intel 提供的驱动（上述 CPU 和图形部分已经安装过），
键盘背光其实是 LED 驱动，不能叫 backlight。
但因为中文都叫背光，就在本小节中一起解决。
我们需要安装
[macbook-lighter](https://github.com/harttle/macbook-lighter)，
这又是一个 AUR 包，需要 [从 AUR 安装][install-from-aur]。

macbook-lighter 需要操作 /sys 文件系统，因此需要让你所在用户有权限。
因为上面“用户与组”部分配置了 video，现在只需要让这些文件对 video 组用户可读写。
创建一个 /etc/udev/rules.d/90-backlight.rules:

```txt
SUBSYSTEM=="backlight", ACTION=="add", \
  RUN+="/bin/chgrp video /sys/class/backlight/%k/brightness", \
  RUN+="/bin/chmod g+w /sys/class/backlight/%k/brightness"
SUBSYSTEM=="leds", ACTION=="add", \
  RUN+="/bin/chgrp video /sys/class/leds/%k/brightness", \
  RUN+="/bin/chmod g+w /sys/class/leds/%k/brightness"
```

重启后显示器亮度、键盘亮度功能键应当可以正常使用。
但是我们还要根据环境亮度自动调节呢：

```bash
sudo systemctl start macbook-lighter    # 立即启动
sudo systemctl enable macbook-lighter   # 开机自动启动
```

## 相关链接

下面是一些重要的链接，供安装时参考：

* 官方安装指导：<https://wiki.archlinux.org/index.php/Installation_guide>
* 在 Mac 上安装：<https://wiki.archlinux.org/index.php/Mac>
* 字体选择和配置：<https://wiki.archlinux.org/index.php/Fonts_(简体中文)>
* i3 官方教程文档：<https://i3wm.org/docs/userguide.html#multi_monitor>
* PulseAudio 文档：<https://wiki.archlinux.org/index.php/PulseAudio>
* 安装 AUR 软件包：<https://harttle.land/2019/04/30/install-aur-package.html>

[install-from-aur]: https://harttle.land/2019/04/30/install-aur-package.html
