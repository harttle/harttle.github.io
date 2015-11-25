---
layout: blog
categories: linux
title: 熟悉 Bash 快捷键来提高效率
tags: Bash 快捷键
---

[Bash][bash]是GNU计划的一部分，是多数Linux发行版提供的默认Shell。
Linux的精髓就在于命令行的高效，而学习命令行的第一步便是学习如何快速地输入命令。

> 其实包括Bash在内的多数Linux Shell都是使用一个叫[GNU Readline Library][readline]的库来接受用户输入。
> 所以这些快捷键在多数Shell下都适用~

<!--more-->

# 命令编辑

快捷键 | 描述
--- | ---
`Ctrl + a` | go to the start of the command line
`Ctrl + e` | go to the end of the command line
`Ctrl + k` | delete from cursor to the end of the command line
`Ctrl + u` | delete from cursor to the start of the command line
`Ctrl + w` | delete from cursor to start of word (i.e. delete backwards one word)
`Ctrl + y` | paste word or text that was cut using one of the deletion shortcuts (such as the one above) after the cursor
`Ctrl + xx` | move between start of command line and current cursor position aand back again
`Alt + b` | move backward one word (or go to start of word the cursor is currently on)
`Alt + f` | move forward one word (or go to end of word the cursor is currently on)
`Alt + d` | delete to end of word starting at cursor (whole word if cursor is at the beginning of word)
`Alt + c` | capitalize to end of word starting at cursor (whole word if cursor is at the beginning of word)
`Alt + u` | make uppercase from cursor to end of word
`Alt + l` | make lowercase from cursor to end of word
`Alt + t` | swap current word with previous
`Ctrl + f` | move forward one character
`Ctrl + b` | move backward one character
`Ctrl + d` | delete character under the cursor
`Ctrl + h` | delete character before the cursor
`Ctrl + t` | swap character under cursor with the previous one

# 历史命令

快捷键 | 描述
--- | ---
`Ctrl + r` | search the history backwards
`Ctrl + g` | escape from history searching mode
`Ctrl + p` | previous command in history (i.e. walk back through the command history)
`Ctrl + n` | next command in history (i.e. walk forward through the command history)
`Alt + .` | use the last word of the previous command

# 命令控制

快捷键 | 描述
--- | ---
`Ctrl + l` | clear the screen
`Ctrl + s` | stops the output to the screen (for long running verbose command)
`Ctrl + q` | allow output to the screen (if previously stopped using command above)
`Ctrl + c` | terminate the command
`Ctrl + z` | suspend/stop the command
`Ctrl + d` | end of input

参考链接：

* http://www.skorks.com/2009/09/bash-shortcuts-for-maximum-productivity/
* http://ss64.com/bash/syntax-keyboard.html

[bash]: http://www.gnu.org/software/bash/
[readline]: http://tiswww.case.edu/php/chet/readline/rltop.html
