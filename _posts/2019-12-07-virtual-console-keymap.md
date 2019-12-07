---
title: VT 下的键盘映射设置
tags: ArchLinux keycode TTY X11 vconsole
---

最近遇到在 X11 下切换到 TTY 可以用 Ctrl+LeftAlt+Fn 或 Ctrl+RightAlt+Fn，但从 TTY 切换回 X11 只能使用 Ctrl+LeftAlt+Fn 的问题。
为了手感比较一致今晚解决了这个问题并记录在这里，希望能帮助遇到同样问题的人。

具体原因是 X11 下的键盘映射由 xkbmap 来管理，它默认提供了比较复杂的配置；但 VT 直接运行在内核上没有经过 X11 它的配置更直接和简单。
这两份配置的不同导致了在 VT 下 RightAlt 不能正确映射。
这里我们关心的是 keycode 到 keysym 的映射关系，
更过关于 scancode, keycode, keysym 的概念解释可以先参考
[ArchLinux 键盘映射](https://harttle.land/2019/08/08/linux-keymap-on-macbook.html) 的第一小节。
这个 keycode 到 keysym 的映射关系就是我们常说的 keymap，
就是装各种系统时要选的键盘布局。
所有的 keymap 都存在 `/usr/share/dbd/keymaps` 中：

```bash
find /usr/share/kbd/keymaps/ -type f
```

关键在于 X11 和 VT 中如何选择这些文件，其中每个 .map.gz 文件解压后得到的 .map 文件即为键盘布局文件。文件中的数字表示 keycode，Alt、Control 这样的词即为 keysym。

<!--more-->

## 查看 X11 下的键盘映射

X11 的键盘映射可以通过 `setxbdmap` 打印出来，可以看到它合并了很多个 keymap 文件：

```bash
> setxkbmap -print -verbose 10
...
xkb_keymap {
        xkb_keycodes  { include "evdev+aliases(qwerty)" };
        xkb_types     { include "complete"      };
        xkb_compat    { include "complete"      };
        xkb_symbols   { include "pc+us+inet(evdev)+terminate(ctrl_alt_bksp)"    };
        xkb_geometry  { include "pc(pc104)"     };
};
```

在 X11 下可以通过 `xev` 来看每个键对应的 keycode 和 keysym。

## 配置 X11 下的键盘映射

设置 X11 键盘映射可以使用 `setxbdmap`, `localectl`，也可以配置在 xorg.conf 里。比如 `/etc/X11/xorg.conf.d/00-keyboard.conf` 文件中：

```
Section "InputClass"
    Identifier "system-keyboard"
    MatchIsKeyboard "on"
    Option "XkbLayout" "cz,us"
    Option "XkbModel" "pc104"
    Option "XkbVariant" ",dvorak"
    Option "XkbOptions" "grp:alt_shift_toggle"
EndSection
```

这里的 XkbLayout 的值即对应 `/usr/share/kbd/keymaps/` 下的映射文件。
可以查阅 [ArchWiki](https://wiki.archlinux.org/index.php/Xorg/Keyboard_configuration) 有更详细的教程。

## 查看 VT 下的键盘映射

VT（Virtual Terminal）就是 Linux 内核提供的虚拟终端，通常使用 Ctrl+Alt+Fn 来切换，X11 通常运行在 Ctrl+Alt+F7 上面。
可以通过 Ctrl + Alt + F2 切到第二个 VT 上。
本文的上下文中 VT 和 TTY 是指同一个东西，叫做 TTY 是因为它的设备名叫做 ttyN。
比如在任何一个 VT 或 Terminal Emulator（比如 Termite、Konsole、Urxvt）中执行：

```bash
echo hello > /dev/tty2
```

你可以在第二个 VT 上看到 `"hello"` 字样输出。还分不清 VT、Shell、Terminal 概念的请看这篇扫盲文章：
[Shell 的相关概念和配置方法](https://harttle.land/2016/06/08/shell-config-files.html)。
VT 下的键盘映射可以通过 `dumpkeys` 来查看：

```bash
> dumpkeys | less
...
keycode  56 = Alt             
keycode 100 = AltGr           

keycode  59 = F1               F13              Console_13      
control	alt	keycode  59 = Console_1       

keycode  60 = F2               F14              Console_14      
control	alt	keycode  60 = Console_2       
...
```

VT 下可以通过 `showkey` 可以看到左右 Alt 对应的 keycode：

```bash
> showkey
keycode 56 press    # 按下 Left Alt
keycode 56 release
keycode 100 press   # 按下 Right Alt
keycode 100 release
```

因此 Alt（56）是指 Left Alt，AltGr（100）是指 Right Alt。
`dumpkeys` 显示 control alt F1 映射到 Console_1，但 control altgr F1 没有映射，
因此 Control+RightAlt+F1 无法切换 VT。原因已经明确接下来我们想办法把 AltGr 的映射也加进去。

## 设置 VT 下的键盘映射

VT 下的 keymap 由 `/etc/vconsole.conf` 中的 `KEYMAP` 字段来配置（可以 `man vconsole.conf` 来查看这个配置文件的语法）。
如果你的文件中也没有这项配置，那么你跟 Harttle 一样用的默认布局 `us`，
即这个文件：`/usr/share/kbd/keymaps/i386/qwerty/us.map.gz`。
我们解压后看这个 us.map 文件内容：

```
> cp /usr/share/kbd/keymaps/i386/qwerty/us.map.gz keymap.map.gz
> gunzip keymap.map.gz && cat keymap.map
...
keycode  56 = Alt
```

接下来我们在解压后的 keymap.map 中添加如下内容并另存为 `/home/harttle/.config/keymap.map`。

```
control altgr	keycode  59 = Console_1       
control altgr	keycode  60 = Console_2       
control altgr	keycode  61 = Console_3
control altgr	keycode  62 = Console_4       
control altgr	keycode  63 = Console_5       
control altgr	keycode  64 = Console_6       
control altgr	keycode  65 = Console_7       
control altgr	keycode  66 = Console_8       
control altgr	keycode  67 = Console_9       
control altgr	keycode  68 = Console_10       
control altgr	keycode  87 = Console_11
control altgr	keycode  88 = Console_12
```

然后在 `/etc/vconsole.conf` 中把 KEYMAP 配置到我们的新文件：

```
KEYMAP=/home/harttle/.config/keymap.map
```

重启后在 VT 中左右 Alt 都可以正常切换 TTY 了。也可以在 VT 中先用 `loadkeys`（这就是启动时 systemd 执行的命令）验证：

```bash
loadkeys /home/harttle/.config/keymap.map
```
