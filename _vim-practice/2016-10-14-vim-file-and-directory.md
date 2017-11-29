---
title: 在 Vim 中进行文件目录操作
tags: Vim 剪切板 寄存器 快捷键
---

很多时候我们希望在Vim中可以操作文件和目录，例如备份当前文件、
重命名当前文件、创建和删除旧文件、创建和删除目录等。
这些操作在Bash中当然可以很好地完成，但退出Vim会丢失光标位置、Buffer等信息，
Harttle当然希望在Vim中完成这些操作。

本文介绍文件和目录的增删改查，同时编辑多个文件请参考这几篇文章：

* [Vim 多文件编辑：缓冲区](/2015/11/17/vim-buffer.html)
* [Vim 多文件编辑：窗口](/2015/11/14/vim-window.html)
* [Vim 多文件编辑：标签页](/2015/11/12/vim-tabpage.html)

<!--more-->

# 当前文件名

我们知道Vim有48个寄存器，其中`%`只读寄存器中保存着当前文件路径。
例如在`/home/harttle/`下打开`src/main.cpp`，我们打印`%`的值：

```
:echo @%                " 文件路径 src/main.cpp
```

通过关键字展开可得到绝对路径、所在目录等信息：

```
:echo expand('%:t')     " 文件名     main.cpp
:echo expand('%:p')     " 绝对路径   /home/harttle/src/main.cpp
:echo expand('%:p:h')   " 所在目录   /home/harttle/src
:echo expand('%:p:h:t') " 所在目录名 src
```

> `:p`理解为path, `:h`理解为head, `:t`理解为tail。可参考`:help expand`。

# 利用 % 进行文件操作

备份当前文件`main.cpp`到`main.cpp.bak`:

```
:w % %.bak
```

打开在同目录下的`main.h`：

```
:e %:p:h/main.h
```

插入当前文件名：

```
"%p
```

拷贝当前文件名到剪切板，当然你可以把它做成快捷键：

```
:let @*=expand("%:t")
```

# 直接打开目录

Harttle发现Vim不仅可以打开文件，而且可以打开目录。
直接`vim /home/harttle`即可打开，也可以在vim打开目录：

```
:e ./harttle    " 编辑该目录
:Explore .      " 浏览该目录
:Sexplore .     " 在水平分割窗口中浏览该目录
:Vexplore .     " 在垂直分割窗口中浏览该目录
```

打开目录后`Enter`进入下一层，`-`返回上一层，`R`重命名，`D`删除。

> 这里的水平分割是指上下两个窗口，垂直分割为左右两个窗口。
> 貌似TMUX和VIM对水平和垂直的定义恰恰相反，Harttle也是醉了。

# 万能方法

如果你找不到合适的Vim命令，随时都可以在Vim中直接执行Bash命令。
只需要在Ex模式中添加前导的`!`字符，例如：

```
# 列出文件
:!ls
# 删除文件
:!rm foo.txt
```

> 此外，[NERDTree][nerdtree]插件可以在Vim中显示文件目录树。
> 当然也集成了文件和目录操作，需要熟悉其快捷键。


# 参考阅读

* <http://vim.wikia.com/wiki/Get_the_name_of_the_current_file>
* <http://harttle.land/2016/07/25/vim-registers.html>
* <http://vim.wikia.com/wiki/File_explorer>

[nerdtree]: https://github.com/scrooloose/nerdtree
