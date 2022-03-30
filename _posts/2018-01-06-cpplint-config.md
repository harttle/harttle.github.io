---
title: Vim 中配置 C++ 编码风格检查
tags: cpplint Syntastic C++ Vim
---

[cpplint][cpplint] 是 Google C++ 代码规范的静态检查工具，是一个简单的 Python 脚本。
借助 [Syntastic][syntastic] 工具，可以配置为 C++ 文件的检查工具。
本文只介绍 C++ Linting 的配置，关于代码所进、注释、自动补全、括号匹配等
配置方式请参考 [这篇文章](/2015/07/18/vim-cpp.html)。先上图：

![vim-cpplint](/assets/img/blog/vim/cpplint-vim@2x.png)

<!--more-->

## 安装 Syntastic

Syntastic 是 Vim 中的语法检查框架，可以对不同的文件应用不同的外部检查工具。
并将所有检查错误聚合并显示在 Vim 中。如果你在使用 [Vundle][vundle]，
安装 Syntastic 很方便，在 `~/.vimrc` 加一行配置：

```vim
Plugin 'scrooloose/syntastic'
```

在 Vim 中执行 `:PluginInstall` 即可安装成功。
如果你本地安装有 `gcc` 就已经有 C++ 语法检查功能了，打开一个 C++ 文件。
左侧会显示所有语法错误的位置，光标所在行的错误信息在状态栏给出。

![syntastic cpp](/assets/img/blog/vim/syntastic-cpp@2x.png)

现在给出的错误是通过一次编译得到 **语法错误**，不是 **代码风格问题**。
如果没有 gcc，你可以把你的编译器设置上去：

```vim
let g:syntastic_cpp_compiler = 'clang++'
```

参考文档：<https://github.com/vim-syntastic/syntastic/wiki/(v3.1.0)---C--:---gcc>

## 安装 cpplint

除了编译期的 **语法检查** 外，为了便于团队协作，通常需要引入 **代码风格检查**。
统一所有在这个仓库里开发的人的代码风格，比如如何使用空格、如何使用缩进、以及如何命名。
这时我们就需要 [cpplint][cpplint]，这时一个外部程序。先安装这个工具（可能需要管理员权限）：

```bash
pip install cpplint
```

cpplint 装好之后就立即可用了，下图中我执行了 `cpplint /tmp/hello-world.cpp`，
它说我没有 Copyright 文件头，不应该使用 `using namespace std;`，
调用 `string` 构造时多一个空格。

![syntastic cpp](/assets/img/blog/vim/cpplint@2x.png)

> 上图中的 `[5]` 表示错误级别是 5，可以通过这个级别进行错误过滤，见下文。

但有时会出现特殊情况，就是要写 `using namespace std;`，还有不要 Copyright 声明。
可以在项目根目录中加入 `CPPLINT.cfg` 文件，其内容如下：

```
filter=-build/namespace,-legal/copyright
```

多个 filter 以逗号分隔，更多参数请参考 `cpplint --help`。

## 配置到 Vim

现在 cpplint 已经可以用了，我们把这个外部工具配置到 Syntastic，
用作 C++ 文件类型的检查就大功告成了。

在 `~/.vimrc` 中，除了上述的语法检查（gcc）之外，我们再定义一个 `cpplint`。
把它加到 `checkers` 中。

```vim
let g:syntastic_cpp_cpplint_exec = 'cpplint'
let g:syntastic_cpp_checkers = ['cpplint', 'gcc']
" 设置 cpplint 的错误级别阈值（默认是 5），级别低于这一设置的不会显示
let g:syntastic_cpp_cpplint_thres = 1
```

注意需要设置 *错误聚合*，才能同时显示两个 checker 的错误：

```vim
let syntastic_aggregate_errors = 1
```

参考文档：<https://github.com/vim-syntastic/syntastic/wiki/(v3.1.0)---C--:---cpplint>

## 最终效果

至此，Vim 中已经可以同时显示语法错误和代码风格错误了。
语法错误显示为 "✗"，代码风格错误显示为 "!"：

![vim-cpplint](/assets/img/blog/vim/cpplint-vim@2x.png)

有没有发现 Vim 左侧的错误标识和你的不一样？这些标识字符可以设置的，
下面的设置分别是语法错误标识、语法警告标识、风格错误标识、风格警告标识：

```vim
let g:syntastic_error_symbol = "✗"
let g:syntastic_warning_symbol = "⚠"
let g:syntastic_style_error_symbol = '!'
let g:syntastic_style_warning_symbol = '?'
```

[cpplint]: https://github.com/google/styleguide/tree/gh-pages/cpplint
[syntastic]: https://github.com/vim-syntastic/syntastic
[vundle]: https://github.com/gmarik/vundle#about
