---
title: 熟悉 Bash 快捷键来提高效率
tags: Bash GNU Linux 快捷键
---

[Bash][bash]快捷键其实是[GNU Readline][readline]快捷键，
[GNU Readline Library][readline]是一个来接受用户输入的GNU软件包。
它是包括[Bash][bash]在内的绝大多数Shell的底层库，
甚至OSX/Windows/Linux下的绝大多数软件都采用与之兼容快捷键。
因此这些快捷键可以在很大程度上支持纯键盘操作，尤其是在Linux/OSX下。

> [Bash][bash]是GNU计划的一部分，是多数Linux发行版提供的默认Shell。
> Linux的精髓就在于命令行的高效，而学习命令行的第一步便是学习如何快速地输入Bash命令。

<!--more-->

## 光标移动

快捷键 | 描述
--- | ---
`Ctrl + a` | 移动光标到行首
`Ctrl + e` | 移动光标到行尾
`Alt + b`  | 移动光标后退一个单词（词首）
`Alt + f`  | 移动光标前进一个单词（词首）
`Ctrl + f` | 光标前进一个字母
`Ctrl + b` | 光标后退一个字母
`Ctrl + xx`| 当前位置与行首之间光标切换

## 剪切粘贴

快捷键 | 描述
--- | ---
`Ctrl + k` | 删除从光标到行尾
`Ctrl + u` | 删除从光标到行首
`Ctrl + w` | 从光标向前删除一个单词
`Alt + d`  | 从光标向后删除一个单词
`Ctrl + d` | 删除光标下一个字母
`Ctrl + h` | 删除光标前一个字母
`Alt + t`  | swap(当前单词, 上一个单词)
`Ctrl + t` | swap(当前字母, 上一个字母)
`Ctrl + y` | 粘贴上一次删除的文本

## 大小写转换

快捷键 | 描述
--- | ---
`Alt + c` | 大写当前字母，并移动光标到单词尾
`Alt + u` | 大写从当光标到单词尾
`Alt + l` | 小写从当光标到单词尾

## 历史命令

快捷键 | 描述
--- | ---
`Ctrl + r` | 向后搜索历史命令
`Ctrl + g` | 退出搜索
`Ctrl + p` | 历史中上一个命令
`Ctrl + n` | 历史中下一个命令
`Alt + .`  | 上一个命令的最后一个单词

## 终端指令

快捷键 | 描述
--- | ---
`Ctrl + l` | 清屏
`Ctrl + s` | 停止输出（在Zsh中为向前搜索历史命令）
`Ctrl + q` | 继续输出
`Ctrl + c` | 终止当前命令
`Ctrl + z` | 挂起当前命令
`Ctrl + d` | 结束输入（产生一个EOF）

## 纯键盘写邮件？

绝大多数操作系统（OSX，Windows，Linux）中的绝大多数软件（GUI的、命令行的）
在底层都使用GNU Readline兼容的库来读取用户输入。
**因此Bash快捷键完全可以胜任纯键盘写邮件**：

* 同一行内移动光标：`Ctrl-B`, `Ctrl-F`, `Ctrl-A`, `Ctrl-E`等。
* 上下行移动光标：`Ctrl-P`, `Ctrl-N`。
* 剪切/粘贴：`Ctrl-W`, `Alt-D`等。

## 相关阅读

* <http://www.skorks.com/2009/09/bash-shortcuts-for-maximum-productivity/>
* <http://ss64.com/bash/syntax-keyboard.html>
* GNU readline：<http://www.bigsmoke.us/readline/shortcuts>
* [Shell 中的变量作用域](/2017/04/03/shell-variable-scope.html)

[bash]: http://www.gnu.org/software/bash/
[readline]: http://tiswww.case.edu/php/chet/readline/rltop.html
