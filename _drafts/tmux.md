---
layout: blog
categories: reading
title: tmux入门：安装与配置
tags: Vim tmux
---

# 恢复用户空间

一般在mac的命令行下，open可以用来打开某个文件或者程序，就像在GUI下双击一样，很方便。 但是最近发现如果用了tmux，open命令经常会报错：

The window server could not be contacted. open must be run with a user logged in at the console, either as that user or as root.
开始以为是环境变量有问题，用env将两个环境下的环境变量输出并diff之后，并没有发现可疑的地方，只好Google之。 最终在这里找到了答案

解决办法如下：

升级你的reattach-to-user-namespace程序，这个是被tmux用来执行其他程序的。 brew update; brew upgrade reattach-to-user-namespace
将以下内容添加到.tmux.conf配置文件中： set -g default-command "reattach-to-user-namespace -l /usr/local/bin/zsh"

