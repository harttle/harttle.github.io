---
title: ArchLinux TTY 中文字体渲染
tags: ArchLinux Shell Linux Windows 字体
---

[ArchLinux][arch]的[User Centrality][arch-way]原则中提出，
该发行版意图满足贡献者的需求，而不是吸引尽量多的用户。
正是这一原则使得[ArchLinux][arch]吸引了大量的开发者，
其[AUR][aur]也成为了更新最为迅速的Linux软件包仓库，几乎可以满足开发者的任何需求。

这一原则也会造成一些准入门槛，
因为在[ArchLinux][arch]中几乎所有软件都需要用户安装和配置。
对于新手而言，字体渲染就成了一个重要的问题。
Harttle找到了一种简单的配置方式，使得[ArchLinux][arch]可以显示漂亮的中英文字体。
因为Harttle的[ArchLinux][arch]没有安装桌面系统，就只给出终端（TTY）字体的配置。

<!--more-->

# The Arch Way

在诸多Linux发行版中，系统提供了很漂亮的默认字体渲染效果（比如Ubuntu的文泉驿正黑）。
与此同时，要在这些发行版中自定义字体则会需要大量的配置更改。
因为不同字体的最佳渲染方式是不一样的。这也是为什么微软雅黑只在Windows上非常漂亮:)

因此[ArchLinux][arch]不提供系统默认字体及其渲染效果，
把选择字体的权利和责任都交给用户。
要做到漂亮的字体渲染需要学习大量的知识，尤其是国人还要求有漂亮的中文字体，
这一配置过程可能非常耗时。

下文中给出一种在终端（TTY）显示中英文的方式，以及相应的字体渲染配置。

# TTY显示中文字体

> [Shell配置文件：.profile, .bashrc, .login][shell-config]一文详细介绍了终端、终端模拟器、Shell等概念的区别。

TTY是字符终端只接受键盘的字符输入并显示字符输出，
并未提供Unicode字符的渲染和显示。这时我们需要一个终端模拟器。
恰恰有一个可以在很好地显示中文的终端模拟器：[`fbterm`][fbterm]，
以及中文输入法软件[`fcitx`][fcitx]的`fbterm`插件叫做：`fcitx-fbterm`。

安装相关软件：

```bash
yaourt -S fbterm fcitx fcitx-fbterm
# To run fbterm as a non-root user, do:
sudo gpasswd -a YOUR_USERNAME video
# To enable keyboard shortcuts for non-root users, do:
sudo chmod u+s /usr/bin/fbterm
```

设置 X11 的默认输入法，配置文件为`.xprofile`（KDM, GDM, LightDM 或 SDDM）或
`.xinitrc`（startx 或 Slim）。

```
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
```

## 配置FBTerm

`fbterm`的配置文件在`~/.fbtermrc`，在里面配置一下该终端（Terminal）的输入法，
以及字体大小和光标形状：

```
# 输入法
input-method=fcitx-fbterm
# 字体大小
font-size=20
# 光标形状: 0 = 下划线, 1 = 块
cursor-shape=1
# 光标闪动时间: 毫秒计，0 = 不闪动
cursor-interval=500
```

> 设置20号字是因为Harttle近视又不愿意戴眼镜，你可以适当调小一点。

## 登录Shell启动FBTerm

在登录Shell时，自动运行FBTerm这个终端模拟器，同时启动`fcitx`中文输入法：

```bash
# file: ~/.bash_login
if [[ $(tty) = /dev/tty1 ]] ; then
    fcitx > /dev/null 2>&1 &
    exec fbterm 
fi
```

`~/.bash_login`是用户登录时会执行的Bash配置文件，参见[Shell配置文件：.profile, .bashrc, .login][shell-config]一文。

# 字体渲染相关概念

## 反锯齿（Anti-aliasing）

显示矢量字体时，需要把它变成格点才能输出到显示器上。
这一过程叫做[光栅化][raster]，在光栅化过程中，字体可能会出现锯齿。
为了提高显示效果，往往需要开启字体渲染的反锯齿功能。

因为不是所有字体都需要进行反锯齿，[ArchLinux][arch]中反锯齿是默认禁止的。

## 字体微调（Hinting）

[Hinting][hinting]是通过数学指令去调整字体显示的外形，
使得字体更加鲜明和易读。同样地，并不是所有字体都需要Hinting。

## Autohinter

Autohinter是指自动进行字体微调，而无视既有的字体微调规则。
同样地，Autohinter并不是总是产生好的效果。
[ArchLinux][arch]也默认禁止了Autohinter。

## Subpixel Renderering（亚像素渲染）

亚像素渲染使得字体更加圆滑，但[ArchLinux][arch]需要知道显示器的类型才能正确地进行亚像素渲染。
在字体渲染配置中，需要给出的是显示屏的类型。
多数显示器都采用RGB标准，但也存在BGR、V-RGB、V-BGR等其他标准。
同样，亚像素渲染也是默认禁用的。

## LCD Filter

使用亚像素渲染时需要启用LCD Filter来消除色差，[ArchLinux][arch]提供了多种过滤器：`lcddefault`，`lcdlight`，`lcdlegacy`等。

# 安装和配置字体

## 安装字体文件

字体文件是一种包含了某种字体的符号、形状、字母等信息的电子文件。
[ArchLinux][arch]中每一种字体都需要单独安装，
但[AUR][aur]中有成千上万的字体供你选择。
Harttle提供的方案中，使用Adobe字体来显示中文，dejavu来显示英文：

```bash
yaourt -S adobe-source-han-sans-cn-fonts ttf-dejavu
```

> 注意：安装何种字体与下面的渲染配置是对应的。

## 配置文件路径

字体渲染的配置文件为`/etc/fonts.conf`（系统级别），
在`/etc/fonts/conf.d`中包含了更多的按优先级载入的字体配置文件。
用户级别的配置文件为`~/.fonts.conf`。

[ArchLinux][arch]虽然不提供默认字体，但给出了很多预设配置文件来支持不同的需求。
这些文件在`/etc/fonts/conf.aval/`下。如果要使用这些预设，可以直接创建软链接，比如：

```
cd /etc/fonts/conf.d
ln -s ../conf.avail/10-sub-pixel-rgb.conf .
```

下文中我们只对当前用户做配置，配置的文件是`~/.fonts.conf`。

## 字体渲染配置

经过无数次的尝试，Harttle发现Adobe和Dejavu这两种字体只需要进行反锯齿和LCD Filter配置即可很好地显示。这是我的`~/.fonts.conf`：

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <match target="font">
    <edit name="antialias" mode="assign">
      <bool>true</bool>
    </edit>
    <edit name="lcdfilter" mode="assign">
      <const>lcddefault</const>
    </edit>
  </match>
</fontconfig>
```

# 扩展阅读

* Fontconfig：<https://wiki.archlinux.org/index.php/Font_configuration#Presets>
* The Arch Way: <https://wiki.archlinux.org/index.php/Arch_terminology#The_Arch_Way>

[arch]: https://www.archlinux.org/
[aur]: https://wiki.archlinux.org/index.php/Arch_User_Repository
[raster]: https://en.wikipedia.org/wiki/Font_rasterization
[hinting]: https://en.wikipedia.org/wiki/Font_hinting
[shell-config]: /2016/06/08/shell-config-files.html
[arch-way]: https://wiki.archlinux.org/index.php/Arch_terminology#The_Arch_Way
[fcitx]: https://wiki.archlinux.org/index.php/Fcitx
[fbterm]: https://wiki.archlinux.org/index.php/Fbterm
