---
title: 用Ag/Ack在Vim中搜索项目代码
tags: Ack Ag CLI Vim Vundle grep 快捷键
---

[Ag][ag](The Silver Searcher)和[Ack][ack]都是 CLI 的全局搜索工具，其中Ag更快一些，而Ack也比Vim自带的grep快很多。这些工具的Vim插件可以通过Vim Quickfix窗口来提供代码搜索的结果。
本文便来详细介绍如何在Vim中使用Ag全局搜索。

那么什么是Quickfix窗口呢？
[Quickfix][quickfix]是Vim的一个特殊编辑模式，该模式的提出最初是受启发于Aztec C编译器：
把编译错误写入一个文件中，然后从这个文件一一跳转到对应出错的源文件。

<!--more-->

# 安装Ag

Ag是一个命令行工具，用来全局搜索代码文件。
除了速度快之外，还会自动排除`.gitignore`, `.hgignore`里排除的文件。
当然你可以在`agignore`中设置其它要排除的文件。现在来安装它：

```bash
# OSX
brew install the_silver_searcher
# Archlinux
pacman -S the_silver_searcher
# Ubuntu
apt-get install silversearcher-ag
```

装好之后可以在 Shell 中试试：

```bash
ack test_blah ~/code/
```

# 安装Ack.vim

[Ack.vim][ack.vim] 是[Ack][ack]的Vim插件，通过[Quickfix][quickfix]来提供搜索结果。
但它允许用户定义外部程序，所以我们可以用它来显示[Ag][ag]的搜索结果。

在`~/.vimrc`中加入：

```vim
Plugin 'mileszs/ack.vim'
let g:ackprg = 'ag --nogroup --nocolor --column'
```

然后运行：

```bash
vim +PluginInstall
```

> 在运行`PluginInstall`前，需要确保安装了[Vundle][vundle]。
> Vundle是Vim插件的包管理工具，可以参见[如何用Vim搭建IDE?][vim-ide]。

# 基本使用

然后在Vim中输入`:Ack test_blah`便可以在当前项目代码中搜索`"test_blah"`了。
常用快捷键如下：

```
?           帮助，显示所有快捷键
Enter/o     打开文件
O           打开文件并关闭Quickfix
go          预览文件，焦点仍然在Quickfix
t           新标签页打开文件
q           关闭Quickfix
```

可以在`~/.vimrc`中为`:Ack`设置一个快捷键：

```bash
map <c-u> :Ack<space>
```

以后在普通模式下输入`Ctrl+U`便可以自动输入`:Ack `了。

[ag]: http://en.wikipedia.org/wiki/Silver
[ack]: http://beyondgrep.com/
[ack.vim]: https://github.com/mileszs/ack.vim
[quickfix]: http://vimdoc.sourceforge.net/htmldoc/quickfix.html#quickfix
[vundle]: github.com/gmarik/vundle
[vim-ide]: /2015/11/04/vim-ide.html

