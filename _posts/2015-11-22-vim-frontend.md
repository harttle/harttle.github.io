---
title: 打造前端开发的 Vim 环境
tags: Bash CSS HTML JavaScript Vim Vundle YCM 快捷键 NPM
---

前不久harttle着手搭建了[类似IDE的Vim环境][vim-ide]，然而对于前端开发者这还远远不够。
本文便记录一下如何实现前端开发者关心的那些特性：不同文件类型的缩进、HTML标签匹配注释移除、HTML/CSS/Javascript自动补全、代码风格检查等等。让我们来打造一个适合前端开发的Vim！

<!--more-->

# 文件类型设置

前端文件有不同的类型，而每个人对于缩进又有不同都要求。Vim中我们可以为每种文件设置不同的缩进和Tab行为。

## 查看当前文件类型

使用`:set filetype`命令可以查看当前文件的类型。例如：

```
filetype=html.handlebars
```

## 配置文件

那么我们知道文件类型是`html`，子类型是`handlebars`。我们对这种文件类型的配置文件位于：`~/.vim/after/ftplugin/html.vim`，
如果没有就创建一个。该文件的格式与`~/.vimrc`完全一致，在每次打开`filetype=html`的文件时都会被载入，我的配置是这样的：

```vim
set ts=4
set sw=4
set expandtab autoindent
```

`ts`设置Tab的大小是4，`sw`设置缩进大小是4，`wxpandtab`会将所有Tab展开为空格，`autoindent`会在换行时保持当前行的缩进。

> 如果是JavaScript文件，则对应的配置目录是`~/.vim/after/ftplugin/javascript.vim`。

# HTML

你是否了解过[Jade模板引擎][jade]？Emmet提供了类似Jade语法的编写HTML的方式。
例如输入`div>p#foo$*3>a`，按下快捷键`<c-y>,`，就会生成下面的HTML：

```html
<div>
    <p id="foo1">
        <a href=""></a>
    </p>
    <p id="foo2">
        <a href=""></a>
    </p>
    <p id="foo3">
        <a href=""></a>
    </p>
</div>
```

完整的Emmet功能在[这里][emmet]可以查到。如果你在使用Vundle，可以在`~/.vimrc`里直接添加这个插件：

```vim
Plugin 'mattn/emmet-vim'
```

Emmet快捷键`<c-y>/`可以注释当前HTML Tag，我把它映射成了更通用的注释快捷键`Ctrl+/`：

```vim
autocmd filetype *html* imap <c-_> <c-y>/
autocmd filetype *html* map <c-_> <c-y>/
```

> 之所以上面写`<c-_>`是因为，由于历史原因Vim不会收到`Ctrl+/`键盘消息的，但多数键盘布局上绑定`<c-_>`具有同样的效果(你按下 的仍然是`Ctrl+/`。

Emmet 中有用的快捷键还有：

* `<c-y>n`：到下一个编辑点
* `<c-y>N`：到上一个编辑点
* `<c-y>d`：选中整个标签
* `<c-y>D`：选中整个标签的内容
* `<c-y>k`：删除当前标签

# CSS 语法

CSS语法高亮可以引入这个插件：

```vim
Plugin 'hail2u/vim-css3-syntax'     
```

如果你还希望LESS支持，可以继续引入：

```vim
Plugin 'groenewege/vim-less'
```

CSS的语法中，前后大括号是要匹配的。可以用[delimitMate][dm]来自动补全后大括号，它支持大多数的编程语言。

```vim
Plugin 'Raimondi/delimitMate'
```

在之前的文章中，介绍过[YouCompleteMe的使用][vim-ide]。它会调用`omnifunc`来完成自动补全。
但对于CSS的自动补全有点麻烦，因为多数CSS的语法是上下文相关的，而YCM的自动补全触发器只考虑当前行。
较好的补救办法是手动设置一下触发器，在`~/.vimrc`中添加：

```vim
let g:ycm_semantic_triggers = {
    \   'css': [ 're!^\s{4}', 're!:\s+'],
    \   'html': [ '</' ],
    \ }
```

这样，在以四空格起始的行，以及冒号后+空格的情况出现时，会触发自动补全。另外，当HTML关闭标签时，也可以触发一下自动补全。

# Javascript

JavaScript 语法高亮只需要引入这个插件：

```vim
Plugin 'pangloss/vim-javascript'
```

它还支持高亮写在JavaScript中的CSS和HTML，在`~/.vimrc`中加入以下配置：

```vim
let javascript_enable_domhtmlcss = 1
```

Javascript 有时会有较多的缩进，如果你希望能够比较明显地显示缩进范围的话，可以引入这个：

```vim
Plugin 'nathanaelkane/vim-indent-guides'
```

Javascript 的自动补全仍然是使用YCM，但我们用一个叫tern的插件来提供强大的JavaScript omnifunc：

```vim
Plugin 'marijnh/tern_for_vim'
```

如果你有很好的编程习惯，想必会需要下面这个Linting工具。

```vim
Plugin 'scrooloose/syntastic'
```

它像YCM一样，通过调用外部Linter来完成代码风格检查。所以你还需要安装一个外部工具：

```bash
npm install -g jshint
```


[jade]: https://github.com/jadejs/jade
[vim-ide]: {% post_url 2015-11-04-vim-ide %}
[emmet]: https://github.com/mattn/emmet-vim
[dm]: https://github.com/Raimondi/delimitMate
