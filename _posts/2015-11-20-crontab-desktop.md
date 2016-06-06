---
title: 用 Cron 定时任务更新壁纸
tags: Bash HTML Linux Unix Vim awk crontab grep sed
---

最近看到[Set Desktop to NASA Astronomy Picture of the Day][nasa-automator]一文，这个OSX下的Automator脚本可以每天自动去NASA（美国宇航局）下载“每日一图”，并设置为桌面。居然有这么酷的事情！于是harttle按照这篇文章的指示，完成了这个脚本。

第二天早上发现壁纸自动更新时harttle真是兴奋不已，然而第三天壁纸却没有更新... harttle也找不到Automator的日志在哪里，后来发现日历中的Automator触发器失效了？无奈之下，harttle又回到了Linux Way：使用 Cron 定时任务更新壁纸。现在稳定多了！

<!--more-->

# 下载壁纸脚本

```bash
#!/usr/local/bin/bash

# 下载HTML到/tmp
base='http://apod.nasa.gov/apod/'
wget -O /tmp/nasa ${base}astropix.html

# 找到其中的<img>标签的src参数
href=${base}`cat /tmp/nasa | grep -i '<img' | awk -F '"' '{print $2}'`

# 计算src的文件后缀
ext=${href##*.}

# 计算保存到的文件地址
file=/Users/harttle/Pictures/nasa/`date +"%Y-%m-%d"`.$ext

# 下载img
wget -O $file $href
```

> 如果你是Linux环境，在文件头只需要`#!/usr/bin/bash`。

然后保存这个脚本到`~/bin/nasa-pic-of-day.sh`。运行一下！发现`~/Pictures/nasa/`下多了一个图片！OK，脚本正确。

# Cron定时任务

[Cron][cron]是Unix系统中用于周期执行任务的守护进程，被定时的任务由`crontab`文件提供。我们来写一个自己的`crontab`文件，保存为`~/bin/daily.cron`：

```
SHELL=/usr/local/bin/bash
30 6 * * *       $HOME/bin/nasa-pic-of-day.sh >> /var/harttle/cron 2>&1
```

其中`30`表示分钟，`6`表示小时，后面的依次是日、月、星期。同时将输出重定向到`/var/harttle/cron`（当然你需要确保这个目录存在）。
`2>&1`是奖错误输出重定向至标准输出，这样我们的日志中将会同时包含标准输出和错误输出。
然后`crontab`命令载入我们的这个文件：

```bash
crontab ~/bin/daily.cron
```

此后呢，我们的脚本就会在每天早上6:30执行。如果有问题我们可以查看日志文件`/var/harttle/cron`，这里有脚本的一切输出。

# 编辑 crontab

crontab会把刚才载入的文件保存起来，以后我们可以通过`crontab -e`直接更改它（注意更改原文件是不起作用的）。
在Mac上保存更改时会有错误：

```
crontab: temp file must be edited in place
```

并且编辑确实未保存，可以在`~/.vimrc`后面加一行：

```bash
autocmd filetype crontab setlocal nobackup nowritebackup
```

这样就可以直接编辑crontab文件啦。

# Cron 运行环境

Cron运行脚本的环境和交互式Shell是不一样的，这一点需要注意。你的脚本可以在交互式Shell中正常运行，但Cron中可能会有错误。

> Cron always runs with a mostly empty environment. HOME, LOGNAME, and SHELL are set; and a very limited PATH.

推荐的做法是在Cron运行的脚本中显式地声明那些环境变量、`source ~/.bashrc`，来手动设置需要的环境。
比如在Mac上，你可能会需要这一项设置：

```bash
PATH=/usr/local/bin:$PATH
```

参考链接：

* [serverfault: crontab execution doesn't have the same environment ...][crontab-stack]
* [Set Desktop to NASA Astronomy Picture of the Day][nasa-automator]

[crontab-stack]: http://serverfault.com/questions/337631/crontab-execution-doesnt-have-the-same-environment-variables-as-executing-user
[nasa-automator]: https://www.macosxautomation.com/automator/apod/index.html
[cron]: https://zh.wikipedia.org/wiki/Cron
