---
title: Vim 中的变量赋值、引用与作用域
tags: Vim 作用域 寄存器 环境变量 变量
---

使用 `let` 进行变量赋值，`echo` 打印变量的值, `unlet` 销毁变量。
对于 Vim 选项还可用 `set` 来更方便地操作，比如 `set {option}`, `set no{option}`, `set {option}?`。
普通变量可以直接引用，环境变量要加前缀 `$`、寄存器变量要加前缀 `@`、Vim 选项要加前缀 `&`。
变量默认作用域取决于定义的位置，函数内则为函数作用域，外部则为全局变量。
赋值和引用变量时可以使用 `b:`,`g:`,`l:`,`t:` 等前缀来指定要操作哪个作用域的变量。

<!--more-->

## 命令模式与 Ex 模式

和其他编程语言一样，Vim 脚本也可以定义和使用变量。
变量操作通常发生在命令模式（commandline mode）、Ex模式（Ex-mode）和 Vim 脚本中。
进入和退出这些模式的方法如下：

* 在正常模式键入 `:` 即可进入命令模式，输入一些命令后按下回车便可执行，
命令执行后 Vim 会自动回到正常模式。
* 在正常模式键入 `Q` （大写）即可进入 Ex 模式，该模式与命令模式相似，但 Vim 不会回到正常模式因此可以连续输入很多命令。
* Vim 脚本中也可以写任何 Vim 命令（`.vimrc`就是一个 Vim 脚本），可以通过 `:source /path/to/script.vim` 来执行一个外部脚本。

上述“正常模式”（normal mode）就是进入 Vim 后默认所处的模式，除非你设置了 easy 模式。
下面是一个例子，首先在正常模式按下 `Q` 进入 Ex 模式，然后键入以下命令：

```vim
:let str = "Hello World!"
:echo str
```

可以看到变量打印输出 `"Hello World"`。这就是一个简单的赋值+打印，这是一个普通的变量。
下面介绍一些特殊变量，以及分析普通变量的作用域问题。

## 环境变量

[在 Vim 可以操作环境变量][env-var]，引用环境变量时需要添加 `$` 前缀。
在下面的例子中，打印出 Vim 所处 Shell 的 `PATH` 环境变量，并新增一个 PATH 目录：

```vim
:echo $PATH
:let $PATH .= ':/foo:/bar'
:echo $PATH
```

`.=` 运算符在 Vim 中用来做字符串拼接并赋值。

## 使用选项变量

Vim 选项是控制着 Vim 编辑器行为的一些变量，比如是否显示行号，使用哪种剪切板。
引用选项变量时需要添加 `&` 前缀。例如：

```vim
" 显示行号
:let &number = 1
" 不显示行号
:let &number = 1
```

Vim 提供了 `set` 命令来更方便地操作选项变量，对于布尔选项：

1. `set {option}` 把布尔选项设为 1。例如 `set number` 设置显示行号。
2. `set no{option}` 把布尔选项设为 0。例如 `set nonumber` 设置不显示行号。
3. `set {option}?` 显示布尔选项的当前值。例如 `set number?` 输出 `number` 为显示行号，输出 `nonumber` 为不显示行号。

对于其他选项

1. `set {option}=<value>` 设置选项值。例如 `set shiftwidth=4` 设置缩进为 4 空格。
2. `set {option}?` 查看选项值。
3. `set {option}` 查看选项值。

上述命令通常会写在 `~/.vimrc` 中，但你也可以进入命令模式后直接输入。
更多 `:set` 的用法请参考 `:help set`。

## 使用寄存器变量

Vim 共有 10 类 48 个寄存器，[使用 Vim 寄存器](/2016/07/25/vim-registers.html) 文中有详细的介绍。
如果能使用这些寄存器作为变量来操作，可以编写极具动态特性的脚本。
寄存器变量的前缀是 `@`：

```vim
" 打印当前文件名
echo @%
" 把刚才拷贝的内容放到 a 寄存器中
let @a = @"
```

## 变量作用域

每种编程语言都定义有自己的变量作用域，比如 JavaScript 的函数作用域、C 语言的块作用域。
Vim 作为文本编辑器，有[缓冲区][vim-buffer]作用域、[窗口][vim-window]作用域、[标签页][vim-tab]作用域等，
引用时可以通过变量前缀来区分。

当你在命令模式随便敲一些命令式大可不去理会这些作用域，但如果你的编写 Vim 脚本或者插件，就要注意其中区别了。
举个例子，使用 `b:` 前缀来定义当前 Buffer 内有效的变量，该变量在其他 Buffer 中是未定义的。下面的命令可以拿去试试：

```vim
:let b:foo = 'foo'
:echo b:foo
```

`b:` 变量虽然对其他 Buffer 不可见，但对其他窗口或标签页中的同一 Buffer 仍然可见，哇！
不指定前缀时（比如本文刚开始的例子），变量默认作用域取决于定义的位置，函数内则为函数作用域，外部则为全局变量。
下面是所有的作用域前缀：

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

可查阅 `:help internal-variables` 获取更多变量作用域的使用方式。

[stevelosh]: http://learnvimscriptthehardway.stevelosh.com/chapters/19.html
[env-var]: http://vim.wikia.com/wiki/Environment_variables
[vim-tab]: http://vim.wikia.com/wiki/Using_tab_pages
[vim-window]: /2015/11/14/vim-window.html
[vim-buffer]: /2015/11/17/vim-buffer.html
[vim-tab]: /2015/11/12/vim-tabpage.html
