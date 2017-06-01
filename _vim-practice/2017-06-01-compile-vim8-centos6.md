---
title: 在 CentOS 6 上编译 Vim 8
tags: CentOS Vim 编译
---

十年后 Vim 发布了 [8.0 版本][vim-github]，为了尝鲜只能手动编译 Vim 8。本文记录了整个过程以及其中的坑，最终达到这几个目的：

* Vim 8.0 版本（YouCompleteMe 要求 7.4.1578 以上，且编译有 Python 支持）
* CentOS 6（CentOS 7 貌似已经有 [相应的Repo 文件][cent7-vim-repo] 了）

<!--more-->

# 安装依赖

安装各种依赖，比如 Vim 编译需要的 Python/Ruby 等支持。

```bash
yum -y groupinstall 'Development Tools'
yum -y install ruby perl-devel python-devel ruby-devel perl-ExtUtils-Embed ncurses-devel
```

# 克隆源码

```bash
git clone https://github.com/vim/vim.git --depth=1 && cd vim/
```

# 编译

为了 [使用 YouCompleteMe][vim-ide]，`configure` 时添加 Python 支持的参数。

```bash
./configure --prefix=/usr/local --enable-multibyte  --with-tlib=tinfo  --enable-pythoninterp --enable-rubyinterp --with-ruby-command=/usr/bin/ruby --with-features=huge
make
sudo make install
```

> 注意在 CentOS 6 中 `--with-tlib` 参数要填写 `tinfo`，参考 [这篇文章][tlib]。

# 使用

`make install` 后 Vim 就在 `/usr/loca/bin` 中了，为了在命令行直接使用，确保该路径在 `PATH` 中：

```
$ export PATH=/usr/local/bin:$PATH
$ which vim
/usr/local/bin/vim
```

然后就可以使用最新的 Vim 了：

```
$ vim --version | head
vim --version |head                                                  [21:04:57]
VIM - Vi IMproved 8.0 (2016 Sep 12, compiled Jun  1 2017 21:04:21)
Included patches: 1-606
Compiled by harttle@harttle.com
Huge version without GUI.  Features included (+) or not (-):
+acl             +file_in_path    +mouse_sgr       +tag_old_static
+arabic          +find_in_path    -mouse_sysmouse  -tag_any_white
+autocmd         +float           +mouse_urxvt     -tcl
-balloon_eval    +folding         +mouse_xterm     +termguicolors
-browse          -footer          +multi_byte      +terminfo
++builtin_terms  +fork()          +multi_lang      +termresponse
```

[tlib]: http://cathay4t.blogspot.jp/2014/09/compile-vim-7473-in-rhel-6.html
[vim-github]: https://github.com/vim/vim/releases
[vim-ide]: /2015/11/04/vim-ide.html
[cent7-vim-repo]: https://copr.fedorainfracloud.org/coprs/mcepl/vim8/repo/epel-7/mcepl-vim8-epel-7.repo
