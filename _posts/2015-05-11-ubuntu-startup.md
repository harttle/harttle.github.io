---
layout: blog
categories: linux
title: Ubuntu 学习笔记
tags: Ubuntu 操作系统 Bash
redirect_from:
  - /linux/ubuntu-startup.html
  - /2015/05/11/ubuntu-startup/
---

小编从2010年开始使用Ubuntu，直至2012年。也有3个年头了，历经了很多次从04升级到10，从10升级到04……
现已全面转入ArchLinux和MacOS了，还是在此记录下Ubuntu使用过程中遇到的那些坑。


## Grub

### 写入MBR

```bash
mount /dev/sda7 /mnt/linuxsys
mount /dev/sda6 / mnt/linuxsys/boot    #如果/boot 单独分区
grub-install --boot-directory=/mnt/linuxsys/boot /dev/sda     #grub1.99与以后（grub2）
grub-install --root-directory=/mnt/linuxsys /dev/sda  #grub1.98与以前（grub1）
```

> Grub经常变化，建议从ubuntu官方查看文档


### 配置文件  

Grub配置文件路径：

* grub1：`/boot/grub/grub.cfg`  
* grub2：`/etc/default/grub`

更新内核列表：

```bash
update-grub     #ubuntu grub
update-grub2    #ubuntu grub2
grub-mkconfig -o /boot/grub/grub.cfg    #arch

设置内核启动顺序：

```bash
GRUB_DEFAULT=0,1,2...saved    #如果是saved, 旧版grub需设 GRUB_SAVEDEFAULT=true() #需要更新内核列表
```

### Grub rescue

系统盘被破坏或磁盘分区发生变动时，进入Grub Rescue模式，使用grub1.99启动Ubuntu。

```bash
ls #查看可选驱动器
ls (hdX,Y)/boot/grub #试试哪个里面是Linux
set prefix=(hdX,Y)/boot/grub
insmod (hdX,Y)/boot/grub/linux.mod #可选，为了方便接下来的命令
set root=(hdX,Y)
linux /vmlinuz root=/dev/sda5  #与下面两条命令可以选用别的内核，如/boot/vmlinuz.0.62.XXX
initrd /initrd.img
boot
```

##  软件包管理

```bash
apt-cache search（查询） show（显示详细信息）
apt-get install -f(修复) --reinstal（重装）
apt-get remove（卸载） purge（同时删除配置）
apt-get update（更新库） upgrade（更新软件） dist-upgrade（升级系统）
dpkg -l（查询已安装） -i（安装） -u（卸载）
```

## TTY中文

1. 安装 `fbterm`, `fcitx-frontend-fbterm`
2. 非根用户运行`fbterm`

    ```bash
    sudo gpasswd -a YOUR_USERNAME video 
    ```
    
3. 非根用户可使用键盘快捷方式

    ```bash
    sudo setcap 'cap_sys_tty_config+ep' /usr/bin/fbterm 或：sudo chmod u+s /usr/bin/fbterm 
    ```
    
4. 写入`~.profile`：

    ```
    alias fbterm='LANG=zh_CN.UTF-8 fbterm'                                                                       
    export DISPLAY=:0                                                                                            
    fbterm -i fcitx-fbterm                                                                                     
    ```
    
> tty 初始化时读取`~/.profile`，fbterm 初始化时读取`~/.bashrc`

## X11问题

装驱动后显示不正常可直接删除`/etc/X11/xorg.conf`后重启。

在KUBUNTU12.04中，显卡驱动损坏可以修改`/etc/X11/xorg.conf`中，Device配置数据块内的Option选项：

```
Option            "ModeValidation" "NoTotalSizeCheck"
```
