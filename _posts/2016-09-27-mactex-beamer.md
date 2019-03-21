---
title: Mac 下编写中文 Beamer
tags: Mac 字体 LaTeX XeTeX 中文
---

TEX 是一个文档排版系统，通过内容与样式的分离使作者能够专注于文本内容。
例如：可以使用`\chapter{<title>}`来添加一个章节标题，而不需手动地去选择18号粗体。

> TEX is a document preparation system that enables the document writer to concentrate on the contents of their text, without bothering too much about the formatting of it. For example, chapters are indicated by \chapter{⟨title⟩} rather than by selecting 18pt bold. -- texdoc clsguide

不得不承认LaTeX的学习曲线堪比VIM，但熟悉LaTeX带来的回报也是其他排版工具难以企及。
神奇的是LaTeX最大的门槛居然在于中文排版。
本科时与LaTeX一起度过的那些昼夜，基本都是在从Windows到Ubuntu拷贝字体，
以及调试CTEX宏包或者XeLatex配置。

本文给出如何在Mac下舒服地编写TEX演示文稿，包括引入中文，以及使用Beamer。

<!--more-->

## 安装MacTex

可以说[MacTex][mactex]是Mac下使用LaTeX的最佳选择，
其中包括Tex Live以及一些Mac平台的工具。
现在已发布MacTex 2016，再也不用担心字体模糊的问题了。

MacTex下载：<https://tug.org/mactex/mactex-download.html>

如果你像Harttle一样热爱CLI，可以添加TEX Bin到你的`PATH`：

```bash
# file: ~/.zshrc or ~/.bash_profile
PATH="/usr/local/texlive/2016/bin/x86_64-darwin/:$PATH"
```

然后就可以在命令行调用各种TEX编译器啦：

```bash
latex
xetex
ps4pdf
```

## XeTeX

在多念奋战于LaTeX后的今天，Harttle已经投入[XeTeX][xetex]的怀抱了。
零四年XeTex第一个版本就发布在Mac平台且只支持Mac，难道这都是宿命！

> 时到今日，TexLive 和 MiKTeX 两大发行版中均已包含了XeTex。

XeTeX是一种使用Unicode的TeX排版引擎，可以在不进行额外配置的情况下直接使用操作系统中安装的字体。因此中文支持最为方便，再也不需要去Windows拷贝字体了！

> XeTeX直接使用操作系统字体的方式会造成跨平台问题，因此源文件在跨平台编译时需要重新设置字体。

## 使用中文字体

我们引入一个叫[fontspec][fontspec]的字体选择工具，它是XeTex下非常健壮和强大的工具。
引入后我们分别设置主字体（用于正文）、无衬线字体（用于强调和标题），
以及等宽字体（用于代码）。

```tex
\usepackage{fontspec}

\setmainfont[BoldFont=STZhongsong, ItalicFont=STKaiti]{STSong}
\setsansfont[BoldFont=STHeiti]{STXihei}
\setmonofont{Consolas}
```

> 可以打开Mac下的字体选择器，选择你喜欢的任何字体！

然后就可以写中文啦！

## 关键字的中文翻译

即使我们可以编写中文文本，LaTeX默认的一些关键字仍然是英文。
例如Contents（目录），Table（表），Figure（图），`\today`（当前日期）等等。

Beamer使用一个内置的叫做[translator][translator]的包来进行语言间的翻译。
一般来讲指定`\uselanguage`和`\languagepath`即可进行国际化。
然而，中文没有。我们来手动实现汉化，仍然使用[translator][translator]提供的机制：

```tex
\uselanguage{chinese}
\languagepath{chinese}

% 设置翻译
\deftranslation[to=chinese]{Contents}{目录}
\deftranslation[to=chinese]{Table}{表}
\deftranslation[to=chinese]{Figure}{图}
\deftranslation[to=chinese]{Theorem}{定理}
\deftranslation[to=chinese]{Corollary}{推论}
\deftranslation[to=chinese]{Definition}{定义}
\deftranslation[to=chinese]{Definitions}{定义}
\deftranslation[to=chinese]{Lemma}{引理}
\deftranslation[to=chinese]{Problem}{问题}
\deftranslation[to=chinese]{Solution}{解}
\deftranslation[to=chinese]{Fact}{事实}
\deftranslation[to=chinese]{Proof}{证明}
```

然而有些命令并不是按照关键字来渲染的（或者搓比Harttle没找到关键字叫啥）。
我们来`\renewcommand`或重新`\def`它们，例如：

```tex
% 重置这个命令
\renewcommand{\today}{\number\year 年\number\month 月\number\day 日}
% \begin{proof} 环境的标题
\def\proofname{证明.}
```

## 一个例子

在此推荐一个简单的、现代化的Beamer模板：

<https://github.com/harttle/a-modern-beamer-template>

[latex-presentation]: https://en.wikibooks.org/wiki/LaTeX/Presentations
[mactex]: https://tug.org/mactex/
[xetex]: https://zh.wikipedia.org/wiki/XeTeX
[fontspec]: https://www.ctan.org/pkg/fontspec
[translator]: https://www.ctan.org/tex-archive/macros/latex/contrib/beamer/base/translator
