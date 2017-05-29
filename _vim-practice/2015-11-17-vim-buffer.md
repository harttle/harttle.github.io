---
title: Vim 多文件编辑：缓冲区
tags: Bash Linux Vim 内存
---

感谢[idear][idear]网友的支持，现在把"Vim多文件编辑"的最后一篇文章更新上来了！本文介绍Vim下**缓冲区(Buffer)**的使用，
至于**标签页(tab)**、**窗口(window)**可以移步另外两篇文章： 
[Vim 多文件编辑：标签页][vim-tabpage]和[Vim 多文件编辑：窗口][vim-window]

<!--more-->

引用Vim官方解释，**缓冲区**是一个文件的内容占用的那部分Vim内存：

> A buffer is an area of Vim's memory used to hold text read from a file. In addition, an empty buffer with no associated file can be created to allow the entry of text. --[vim.wikia][vim-buffer]

先来回顾一下Tab，Window，Buffer的关系吧！

![tabs windows buffers][twb]

基于缓冲区的多文件编辑是Vim最为推荐的做法，Vim维护着你在当前打开的这些Buffer里的所有跳转，
`Ctrl+o`和`Ctrl+i`可以遍历这些光标位置（参考：[在Vim中进行快速光标移动][vim-cursor]）。
但一个窗口内只有一个Buffer是处于可见状态的，所以Buffer的用法最不直观。

学习Vim就要克服那些不直观的操作！因为Vim本身就是基于CLI的，而我们相信CLI就是效率。本文便来总结一下Buffer相关的命令与操作。

# 打开与关闭

不带任何参数打开多个文件便可以把它们都放入缓冲区（Buffer）：

```bash
vim a.txt b.txt
```

> 当你使用`:q`关闭文件时？是否看到过`1 more file to edit`的警告？那就是缓冲区中的文件。

进入Vim后，通过`:e[dit]`命令即可打开某个文件到缓冲区。还记得吗？使用`:new`可以[打开一个新窗口][vim-window]。
关闭一个文件可以用`:q`，移出缓冲区用`:bd[elete]`（占用缓冲区的文件对你毫无影响，多数情况下不需要这样做）。

> 如果Buffer未保存`:bd`会失败，如果强制删除可以`:bd!`。

# 缓冲区跳转

缓冲区之间跳转最常用的方式便是 `Ctrl+^`（不需要按下Shift）来切换当前缓冲区和上一个缓冲区。
另外，还提供了很多跳转命令：

```
:ls, :buffers       列出所有缓冲区
:bn[ext]            下一个缓冲区
:bp[revious]        上一个缓冲区
:b {number, expression}     跳转到指定缓冲区
```

`:b`接受缓冲区编号，或者部分文件名。例如：

* `:b2`将会跳转到编号为2的缓冲区，如果你正在用`:ls`列出缓冲区，这时只需要输入编号回车即可。
* `:b exa`将会跳转到最匹配`exa`的文件名，比如`example.html`，**模糊匹配打开文件正是Vim缓冲区的强大之处**。

# 分屏

在[Vim 多文件编辑：窗口][vim-window]中已经介绍了Vim中分割屏幕的操作。
其实分屏时还可以指定一个Buffer在新的Window中打开。

```
:sb 3               分屏并打开编号为3的Buffer
:vertical sb 3      同上，垂直分屏
:vertical rightbelow sfind file.txt
```

注意`sfind`可以打开在Vim PATH中的任何文件。这当然需要我们设置PATH，一个通用的做法是在`~/.vimrc`中添加：

```vim
" 将当前工作路径设为Vim PATH
set path=$PWD/**
```

# 利用通配符进行缓冲区跳转

这是缓冲区最强大的功能之一。我们可以使用通配符来指定要跳转到的缓冲区文件名。
在此之前，我们启动`wildmenu`并设置匹配后文件选择模式为`full`。
`wildchar`为选择下一个备选文件的快捷键，
而`wildcharm`用于宏定义中（语义同`wildchar`），比如后面的`noremap`。

```vim
set wildmenu wildmode=full 
set wildchar=<Tab> wildcharm=<C-Z>
```

比如现在按下打开这些文件：

```
vehicle.c vehicle.h car.c car.h jet.c jet.h jetcar.c jetcar.h
```

然后按下`:b <Tab>`便可看到Vim提供的备选文件列表了，
按下`<Tab>`选择下一个，按下回车打开当前文件。

```vim
:b <Tab>       " 显示所有Buffer中的文件
:b car<Tab>    " 显示 car.c car.h
:b *car<Tab>   " 显示 car.c jetcar.c car.h jetcar.h
:b .h<Tab>     " 显示 vehicle.h car.h jet.h jetcar.h
:b .c<Tab>     " 显示 vehicle.c car.c jet.c jetcar.c
:b ar.c<Tab>   " 显示 car.c jetcar.c
:b j*c<Tab>    " 显示 jet.c jetcar.c jetcar.h
```

我们可以为`:b <Tab>`设置一个快捷键`<c-n>`，这时便用到上文中设置的`wildcharm`了：

```vim
noremap <c-n> :b <c-z>
```

[vim-window]: /2015/11/14/vim-window.html
[vim-tabpage]: /2015/11/12/vim-tabpage.html
[vim-buffer]: http://vim.wikia.com/wiki/Buffers
[vim-cursor]: /2015/11/07/vim-cursor.html
[twb]: /assets/img/blog/tabs-windows-buffers.png
