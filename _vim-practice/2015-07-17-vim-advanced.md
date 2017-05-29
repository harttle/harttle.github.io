---
layout: blog
title: 感受Vim的强大：进阶技巧
tags: Bash Markdown Unix Vim 宏 寄存器 快捷键
---

Vim是从vi发展出来的一个文本编辑器。代码补全、编译及错误跳转等方便编程的功能特别丰富，在程序员中被广泛使用。和Emacs并列成为类Unix系统用户最喜欢的编辑器。
如果你还没有使用过Vim，建议你先去看这个：[Vim初级：配置和使用][vim-basic]。本文介绍一些Vim的高级特性。包括块编辑、宏录制、语法高亮、键盘映射、函数定义、文件类型识别与对应插件加载等。

<!--more-->

* 英文文档：<http://vimdoc.sourceforge.net/htmldoc/>
* 中文文档：<http://vimcdoc.sourceforge.net/doc/>

# 块编辑

* **可视** 模式：`v` 可进入visual模式，使用标准快捷键移动光标可选择文本块，之后可输入标准编辑命令。

* **列编辑** 模式：`<Ctrl>v` 进入列编辑模式，移动光标将按列进行选中。例如：
	> 删除块注释：`<Ctrl>v` 进入列编辑模式，`ikjl` 选中注释列，`<N>x` 删除N个字符；
	
	> 添加块注释：`<Ctrl>v` 进入列编辑模式，`ikjl` 选中要注释的行，`I` 进入插入模式，输入几个注释字符，`<Esc>` 推出列编辑。

vim所有的模式（即工作状态）如下：

1. (o) 普通模式: 输入命令时。
2. (x) 可视模式: 可视区域高亮并输入命令时。
3. (s) 选择模式: 类似于可视模式，但键入的字符对选择区进行替换。
4. (o) 操作符等待模式: 操作符等待中 ("d"，"y"，"c" 等等之后)。
5. (i) 插入模式: 也用于替换模式。
6. (c) 命令行模式: 输入 ":" 或 "/" 命令时。

> **行尾块** ：因行尾参差不齐，块编辑一般用于行首、行间；行尾编辑要有一些技巧：`gg`到文件头，`<Ctrl-v>`进入块编辑模式，`G`选择所有内容；`$A`到行尾并进入插入模式，输入要插入的字符，`<Esc>`完成。

# 文件类型识别与对应插件加载

Vim可针对特定的文件，加载指定插件。以此来实现文件类型的特殊配置以及语法高亮。

> 参见：http://vimcdoc.sourceforge.net/doc/filetype.html#filetype-plugins

`filetype on` 将开启文件识别，Vim 会在载入时做如下工作：

1. 执行`$RUNTIMEPATH/filetype.vim`，根据文件名判断类型
2. 如果需要的话，执行 `$RUNTIMEPATH/scripts.vim`，进一步判断文件类型
3. 设置 Vim 的 `filetype` 变量

> 我们也可以通过诸如 `:set filetype=c` 的命令来手动设置文件类型
> 如果不使用文件识别，我们可以运行 `au BufNewFile,BufRead *.plt  source ~/.vim/after/ftplugin/plt.vim` 来使用 `plt.vim` 初始化 `*.plt` 文件。

> 更多关于`RUNTIMEPATH` ：http://vimcdoc.sourceforge.net/doc/options.html#'runtimepath'

`filetype plugin on` 允许Vim加载文件类型的插件，Vim会在载入时寻找并加载 `$RUNTIMEPATH/ftplugin.vim`，该脚本会寻找并加载 `$RUNTIMEPATH/ftplugin/<filetype>.vim`。

例如：`~/.vim/ftplugin/cpp.vim` 将在 cpp 文件类型被识别后自动载入。

> 同样，`~/.vim/after/ftplugin/cpp.vim` 会在最后被调用，进而覆盖之前的配置。
> 另外，`filetype indent on` 允许Vim加载该文件类型的缩进设置。即执行`RUNTIMEPATH/indent.vim`。

# 语法高亮

`syntax on` 允许 Vim 加载文件类型的语法高亮配置，Vim会在载入时寻找并加载 `RUNTIMEPATH/syntax/<filetype>.vim`。

例如：`~/.vim/syntax/markdown.vim` 将会对文件类型`markdown` 进行语法高亮。


# 键盘映射

Vim支持定义键盘映射来完成快捷键的功能，也就是将特定的按键映射为一系列按键与函数的序列。

例如将 `F7` 映射为编译当前java文件：

```vim
map <F7> <Esc>:!javac %<<CR>
```

> `:` 为进入Ex模式，`!` 指定下面的命令在vim外执行，`%` 为当前文件名，`%<` 为不带扩展名的当前文件名，`<CR>` 为回车。



`map` 命令有多种工作模式，如下表。

map模式 | 描述
:---:  | ----
n	|	普通
v	|	可视和选择
s	|	选择
x	|	可视
o	|	操作符等待
!	|	插入和命令行
i	|	插入
l	|	插入、命令行和 Lang-Arg 模式的 ":lmap" 映射
c	|	命令行


其中，`map`模式可作为`map`命令的前缀以指定其工作模式：

命令    |       左边  |       右边   |          模式      
----    | -------     |     ----     |           ----  
:map     |    {lhs}  |   {rhs}  |       mapmode-nvo   
:nm[ap]  |  {lhs}    |  {rhs}    |    mapmode-n       
:vm[ap]  |  {lhs}    |  {rhs}    |    mapmode-v       
:xm[ap]  |  {lhs}    |  {rhs}    |    mapmode-x       
:smap    |   {lhs}   |   {rhs}   |    mapmode-s      
:om[ap]  |  {lhs}    |  {rhs}    |    mapmode-o      
:map!    |   {lhs}   |   {rhs}   |    mapmode-ic     
:im[ap]  |   {lhs}   |   {rhs}   |    mapmode-i     
:lm[ap]  |   {lhs}   |   {rhs}   |    mapmode-l     
:cm[ap]  |  {lhs}    |  {rhs}    |    mapmode-c     

另外，可添加`nore`指定非递归方式（取消传递性）。如`inoremap`为插入模式下工作的`map`，并且没有递归。


# 函数

现在我们可以自定义快捷键了，如果希望在键盘映射中执行更复杂的功能，我们需要定义Vim函数。

* 函数名必须以大写字母开始
* 函数可以有返回值：`return something`
* 函数可以有范围前缀。定义：`function s:Save()`，调用：`call s:Save()`

下面是函数调用的例子，按键F8时，进入拷贝模式（取消行号，鼠标进入visual模式）。

```vim
" key mapping
map <F8> <Esc>:call ToggleCopy()<CR>

" global variable
let g:copymode=0

" function
function ToggleCopy()
    if g:copymode
        set number
        set mouse=a
    else
        set nonumber
        set mouse=v
    endif
    let g:copymode=!g:copymode
endfunction
```

# 录制宏

用户录制的宏保存在寄存器中，我们先来看看什么是寄存器。vim的寄存器分为数字寄存器和字母寄存器。

* 数字寄存器为`0-9`，`0`保存着上次复制的内容，`1-9`按照最近的顺序保存着最近删除的内容。
* 字母寄存器为`a-z`，拷贝3行到寄存器`c`：`c3yy`.

现在开始录制宏。假如有如下的文件，我们希望将第二列的类型用`` ` ``分隔起来。

```
1 | BOOL  | Boolean
2 | SINT  | Short integer
3 | INT   | Integer 
4 | DINT  | Double integer 
5 | LINT  | Long integer 
6 | USINT | Unsigned short integer 
7 | UINT  | Unsigned integer 
```

1. 首先按几次`<Esc>`进入normal模式，光标移到第一行，开始录制并存入m寄存器`qm`。
2. 光标到行首`^`，到第二列词首`ww`，进入插入模式`i`，插入分隔符`` ` ``，退出到normal模式`<Esc>`，到词尾`e`，进入插入模式`i`，插入分隔符`` ` ``，退出到normal模式`<Esc>`，光标到下一行`j`。
3. 结束录制`q`。
4. 光标到第二行，在normal模式执行100次寄存器m中的宏`100@m`。

宏会在`j`执行错误后自动结束，得到如下文件：


```
1 | `BOOL`  | Boolean
2 | `SINT`  | Short integer
3 | `INT`   | Integer 
4 | `DINT`  | Double integer 
5 | `LINT`  | Long integer 
6 | `USINT` | Unsigned short integer 
7 | `UINT`  | Unsigned integer 
```

[vim-basic]: /2013/11/08/vim-config.html

