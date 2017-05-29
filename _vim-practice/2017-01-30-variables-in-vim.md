---
title: Vim 中的变量类型与作用域
tags: Vim 作用域 寄存器 环境变量 变量
---

有没有想查看一个 vim 变量的值却无从下手？
有没有被 Vim 变量作用域前缀搞晕？
有没有在 Vim 脚本中不知如何变量赋值？
本文梳理了 Vim 变量的赋值、取值与打印，以及在脚本中如何使用变量及其作用域。

# TL;DR

* 在命令模式、Ex 模式或 Vim 脚本中都可以操作变量。
* 使用 `let`, `echo`, `unlet` 进行赋值输出和销毁，Vim 选项还可用 `set` 来操作。
* `$`前缀表示环境变量、`@`前缀表示寄存器变量、`&`表示 Vim 选项。
* 使用 `b:`,`g:`,`l:`,`t:` 等前缀可以限制变量的作用域。

<!--more-->

# 命令模式与 Ex 模式

正如其他所有的编程语言，Vim 命令或脚本中也可以定义和使用变量。
这些变量操作工作在命令模式（commandline mode）、Ex模式（Ex-mode）、以及 Vim 脚本中。

* 在正常模式（normal mode）键入 `:` 即可进入命令模式，输入一些命令后按下回车便可执行，
命令执行后 Vim 会自动回到正常模式。
* 在正常模式键入 `Q` （大写）即可进入 Ex 模式，该模式与命令模式相似，但 Vim 不会回到正常模式因此可以连续输入很多命令。
* Vim 脚本中也可以写任何 Vim 命令（`.vimrc`就是一个 Vim 脚本），可以通过 `:source /path/to/script.vim` 来执行一个外部脚本。

我们体验一下最简单的变量使用方式，进入 Ex 模式并键入以下命令，即可看到变量打印输出：

```vim
:let str = "Hello World!"
:echo str
```

使用 `let` 和 `echo` 就可以简单地操作变量了！下面会介绍不同的变量类型以及变量作用域，
你会看到更多的变量操作方法。

# 环境变量

使用`$`前缀可以[在 Vim 中操作环境变量][env-var]，
比如打印出当前 Vim 的 `PATH` 环境变量，并新增一个 PATH
（`.=` 运算符用来做字符串拼接并赋值）。

```vim
:echo $PATH
:let $PATH .= ':/foo:/bar'
:echo $PATH
```

#  Vim 选项变量

Vim 选项是控制着 Vim 编辑器行为的一些选项，可以在每一级 `/.vimrc` 中设置，
也可以在运行时通过 Vim 命令来设置，这些 Vim 选项也可以作为变量来操作。
在此之前先重温一下 Vim 选项的设置方法：

```vim
" 启用行号
:set number
" 禁用行号
:set nonumber
" 查看行号选项的值
:set number?
```

> 直接 `set` 来置 1，使用 `no` 前缀来置 0，使用 `?` 后缀来打印。
> `:set` 其实很多精彩的使用方式，请参考 `:help set`。

Vim 选项也可以作为变量使用，只要添加 `&` 前缀。
这样就可以使用 Vim 表达式了！（当然我们一般不需要这么复杂）
下面的代码来自[learnvimscriptthehardway.stevelosh.com][stevelosh]：

```vim
" 选项操作方式
:set textwidth=100
:set textwidth?

" 变量操作方式
:let &textwidth = &textwidth + 10
:echo &textwidth
```

# 寄存器变量

在[使用 Vim 寄存器](/2016/07/25/vim-registers.html)一文中提到 Vim 有10类48个寄存器。
如果能使用这些寄存器作为变量来操作，可以编写极具动态特性的脚本。
你没猜错，也是加一个前缀：`@`：

```vim
" 打印当前文件名
echo @%
" 将刚才 yank 的内容放到 a 寄存器中
let @a = @"
```

# 变量作用域

如果你来自于其他的编程语言（C、Java、Ruby、Python、JavaScript），
一定知道不同编程语言的作用域机制会很不同，比如 JavaScript 的函数作用域、
C 的块作用域。Vim 中是通过变量前缀来区分不同作用域的，比如：

使用 `b:` 前缀来定义当前 Buffer 内有效的变量，
该变量在其他 buffer 中是未定义的
（但对其他 window 或 tab 的同一 buffer 仍然可见，哇！）。

> 如果你还不了解 window、tab、buffer 是什么，可以参考这几篇文章：
> [Vim 多文件编辑：标签页][vim-tab]、[Vim 多文件编辑：缓冲区][vim-buffer]、[Vim 多文件编辑：窗口][vim-window]。

```vim
:let b:foo = 'foo'
:echo b:foo
```

当你在命令模式随便敲一些命令式大可不去理会这些作用域，
但如果你的编写 Vim 脚本或者插件，就要注意其中区别了：

```
|buffer-variable|    b:	  Local to the current buffer.
|window-variable|    w:	  Local to the current window.
|tabpage-variable|   t:	  Local to the current tab page.
|global-variable|    g:	  Global.
|local-variable|     l:	  Local to a function.
|script-variable|    s:	  Local to a |:source|'ed Vim script.
|function-argument|  a:	  Function argument (only inside a function).
|vim-variable|       v:	  Global, predefined by Vim.
```

> 可查阅 `:help internal-variables` 获取更多变量作用域的使用方式。

[stevelosh]: http://learnvimscriptthehardway.stevelosh.com/chapters/19.html
[env-var]: http://vim.wikia.com/wiki/Environment_variables
[vim-tab]: http://vim.wikia.com/wiki/Using_tab_pages
[vim-window]: /2015/11/14/vim-window.html
[vim-buffer]: /2015/11/17/vim-buffer.html
[vim-tab]: /2015/11/12/vim-tabpage.html
