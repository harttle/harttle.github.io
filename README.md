HarttleLand 博客主题
=================

本仓库是 **[Harttle Land](https://harttle.land)** 的源码，欢迎 Clone 和 Fork。

## 功能

* 代码高亮
* Markdown 支持 LaTex 公式
* 基于 Github Issue 的评论
* 自动生成页内导航

## 授权

本仓库提供的主题和内容使用 [CC-BY 4.0](http://creativecommons.org/licenses/by/4.0/) 进行许可，
你可以自由地使用（包括商业用途）、修改、重新发布本仓库的代码和文章，只要在合适的地方保留来源或作者。

对于套用主题的情况，需要标明 Harttle Land 网站地址或本仓库地址，例如：

```
Theme by <a href="https://harttle.land">Harttle Land</a>.
```

对于转载文章的情况，需要给出原文链接，例如：

```
原文链接：<a href="https://harttle.land/2016/08/08/vim-search-in-file.html">Vim 中搜索和替换</a>
```

## 使用

> 前置依赖：在使用本主题之前，需要安装 Node.js, Ruby，以及 Bundle。

克隆并安装依赖

```bash
git clone git@github.com:harttle/harttle.github.io.git
bundle install
```

更改配置，尤其是移除 `ga`（Google Analytics）和 `disqus`（Disqus 评论），或替换为你自己的账号。

```bash
vim _config.yml
```

执行 `npm start` 启动，即可访问： <http:/localhost:4000>

[license]: https://github.com/harttle/harttle.github.io/blob/master/LICENSE
