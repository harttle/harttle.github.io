---
layout: article
category: linux
title: Vim 使用
tags: 
---

Vim是从vi发展出来的一个文本编辑器。代码补全、编译及错误跳转等方便编程的功能特别丰富，在程序员中被广泛使用。和Emacs并列成为类Unix系统用户最喜欢的编辑器。

文档参见：http://vimdoc.sourceforge.net/htmldoc/

中文文档：http://vimcdoc.sourceforge.net/doc/

# 基础使用

![vim-key](/assets/img/blog/vim-key.png)

查看帮助：`:help`，`<Ctrl>]` 进入标签，`<Ctrl>O` 返回。

<!--more-->

# 配置文件

## 初始化过程

正如多数 linux 软件，vim 的配置文件分为系统配置文件 `/etc/vimrc`，`/usr/share/vim/` 和用户配置文件 `~/.vimrc`，`~/.vim/`。

vim 的配置文件载入过程为：

1. `/etc/vimrc`
1. `$HOME/.vim/`，`$HOME/.vimrc`
2. `$VIMRUNTIME/.vim`，`$VIMRUNTIME/.vimrc`
3. `$HOME/.vim/after/`

> 通过运行 `vim -V` 可查看整个初始化过程。

## 示例配置

一个示例配置文件如下：

```vim
" .vimrc
" See: http://vimdoc.sourceforge.net/htmldoc/options.html for details

" For multi-byte character support (CJK support, for example):
" set fileencodings=ucs-bom,utf-8,cp936,big5,euc-jp,euc-kr,gb18030,latin1
       
set tabstop=4       " Number of spaces that a <Tab> in the file counts for.
 
set shiftwidth=4    " Number of spaces to use for each step of (auto)indent.
 
set expandtab       " Use the appropriate number of spaces to insert a <Tab>.
                    " Spaces are used in indents with the '>' and '<' commands
                    " and when 'autoindent' is on. To insert a real tab when
                    " 'expandtab' is on, use CTRL-V <Tab>.
 
set smarttab        " When on, a <Tab> in front of a line inserts blanks
                    " according to 'shiftwidth'. 'tabstop' is used in other
                    " places. A <BS> will delete a 'shiftwidth' worth of space
                    " at the start of the line.
 
set showcmd         " Show (partial) command in status line.

set number          " Show line numbers.

set showmatch       " When a bracket is inserted, briefly jump to the matching
                    " one. The jump is only done if the match can be seen on the
                    " screen. The time to show the match can be set with
                    " 'matchtime'.
 
set hlsearch        " When there is a previous search pattern, highlight all
                    " its matches.
 
set incsearch       " While typing a search command, show immediately where the
                    " so far typed pattern matches.
 
set ignorecase      " Ignore case in search patterns.
 
set smartcase       " Override the 'ignorecase' option if the search pattern
                    " contains upper case characters.
 
set backspace=2     " Influences the working of <BS>, <Del>, CTRL-W
                    " and CTRL-U in Insert mode. This is a list of items,
                    " separated by commas. Each item allows a way to backspace
                    " over something.
 
set autoindent      " Copy indent from current line when starting a new line
                    " (typing <CR> in Insert mode or when using the "o" or "O"
                    " command).
 
set textwidth=79    " Maximum width of text that is being inserted. A longer
                    " line will be broken after white space to get this width.
 
set formatoptions=c,q,r,t " This is a sequence of letters which describes how
                    " automatic formatting is to be done.
                    "
                    " letter    meaning when present in 'formatoptions'
                    " ------    ---------------------------------------
                    " c         Auto-wrap comments using textwidth, inserting
                    "           the current comment leader automatically.
                    " q         Allow formatting of comments with "gq".
                    " r         Automatically insert the current comment leader
                    "           after hitting <Enter> in Insert mode. 
                    " t         Auto-wrap text using textwidth (does not apply
                    "           to comments)
 
set ruler           " Show the line and column number of the cursor position,
                    " separated by a comma.
 
set background=dark " When set to "dark", Vim will try to use colors that look
                    " good on a dark background. When set to "light", Vim will
                    " try to use colors that look good on a light background.
                    " Any other value is illegal.
 
set mouse=a         " Enable the use of the mouse.
 
filetype plugin indent on
syntax on
```


# 进阶技巧


## 块编辑

* **可视** 模式：`v` 可进入visual模式，使用标准快捷键移动光标可选择文本块，之后可输入标准编辑命令。

* **列编辑** 模式：`<Ctrl>v` 进入列编辑模式，移动光标将按列进行选中。例如：
	> 删除块注释：`<Ctrl>v` 进入列编辑模式，`ikjl` 选中注释列，`<N>x` 删除N个字符；
	
	> 添加块注释：`<Ctrl>v` 进入列编辑模式，`ikjl` 选中要注释的行，`I` 进入插入模式，输入几个注释字符，`<Esc>` 推出列编辑。
	

## 文件识别

Vim可针对特定的文件，加载指定插件。以此来实现文件类型的特殊配置以及语法高亮。

参见：http://vimcdoc.sourceforge.net/doc/filetype.html#filetype-plugins

`filetype on` 将开启文件识别，Vim 会在载入时做如下工作：

1. 执行`$RUNTIMEPATH/filetype.vim`，根据文件名判断类型
2. 如果需要的话，执行 `$RUNTIMEPATH/scripts.vim`，进一步判断文件类型
3. 设置 Vim 的 `filetype` 变量

> 我们也可以通过诸如 `:set filetype=c` 的命令来手动设置文件类型
> 如果不使用文件识别，我们可以运行 `au BufNewFile,BufRead *.plt  source ~/.vim/after/ftplugin/plt.vim` 来使用 `plt.vim` 初始化 `*.plt` 文件。

> 更多关于`RUNTIMEPATH` ：http://vimcdoc.sourceforge.net/doc/options.html#'runtimepath'

## 插件加载

`filetype plugin on` 允许Vim加载文件类型的插件，Vim会在载入时寻找并加载 `$RUNTIMEPATH/ftplugin.vim`，该脚本会寻找并加载 `$RUNTIMEPATH/ftplugin/<filetype>.vim`。

例如：`~/.vim/ftplugin/cpp.vim` 将在 cpp 文件类型被识别后自动载入。

> 同样，`~/.vim/after/ftplugin/cpp.vim` 会在最后被调用，进而覆盖之前的配置。
> 另外，`filetype indent on` 允许Vim加载该文件类型的缩进设置。即执行`RUNTIMEPATH/indent.vim`。

## 语法高亮

`syntax on` 允许 Vim 加载文件类型的语法高亮配置，Vim会在载入时寻找并加载 `RUNTIMEPATH/syntax/<filetype>.vim`。

例如：`~/.vim/syntax/markdown.vim` 将会对文件类型`markdown` 进行语法高亮。


## 键盘映射

Vim支持定义键盘映射来完成快捷键的功能，也就是将特定的按键映射为一系列按键与函数的序列。

例如将 `F7` 映射为编译当前java文件：

```vim
map <F7> <Esc>:!javac %<<CR>
```

> `:` 为进入Ex模式，`!` 指定下面的命令在vim外执行，`%` 为当前文件名，`%<` 为不带扩展名的当前文件名，`<CR>` 为回车。

## 函数

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

