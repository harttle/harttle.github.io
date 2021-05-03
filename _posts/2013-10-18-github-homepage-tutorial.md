---
title: 在 Github 上搭建自己的博客
tags: Github 博客 Markdown
---

Github 提供了免费的静态文件服务，对于希望自建博客但又懒得自己买机器的朋友是个不错的选择。只需要注册一个 Github 账号并推送博客内容上去，就可以在线访问了！本博客的所有内容都是通过 Github 发布的。

目前 Github Pages 已经提供了完整的中文文档，本文的目的是帮助理解 Github 博客是怎么工作的，大概怎么搭建，以及一些常见问题。对于技术博客而言，会涉及怎么实现以下功能：

* 代码片段高亮。代码高亮就是把你的代码片段按照指定的编程语言语法进行高亮，类似 IDE 里看到的五颜六色的代码。从 [这篇文章](https://harttle.land/2018/09/29/es6-iterators.html) 可以看到显示效果。
* LaTex 公式渲染。对于需要在博客中编写数学公式的朋友，引入 LaTex 或 MathML 可以答复提升写博客的效率。从 [这篇文章](https://harttle.land/2018/06/29/javascript-numbers.html) 可以看到公式的显示效果。
* Google 统计。我们可以通过添加简单的代码实现 Google 统计，或者百度统计等，whatever。

准备好电脑和网络后，我们就开始吧！

<!--more-->

## 搭建步骤

在 <https://github.com/join> 注册 GitHub 账号后，跟随 [使用 Jekyll 创建 GitHub Pages 站点](https://docs.github.com/cn/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll) 的步骤，即可创建一个可以在线访问的 Github Pages 站点。大概步骤是这样的：

1. 每个用户对应一个 Github Pages，因此需要创建一个特殊名字的仓库。比如我的用户名是 harttle，对应的仓库需要是 harttle/harttle.github.io。
2. 把创建好的仓库克隆下来，利用 Jekyll（静态站点创建工具）生成网站内容并提交到 Git 仓库里。
3. 把提交后的仓库推送到 Github，大约 10 分钟后就可以访问了。

## Jekyll 入门

Github Pages 是一个静态文件服务，而 Jekyll 是 Github Pages 支持的一个静态站点生成器。也就是说 Github Pages 会用 Jekyll 把你推送上去的仓库里的代码生成静态 HTML 文件，并为这些 HTML 提供静态 HTTP 服务。

因此我们的博客代码怎么写，就需要学习 Jekyll。参考官网 <http://jekyllrb.com/docs/home/>。一个典型的 Jekyll 项目目录结构如下：

```
.
├── _config.yml		// 站点的配置文件
├── _drafts		    // 博客草稿
|   ├── begin-with-the-crazy-ideas.markdown
|   └── on-simplicity-in-technology.markdown
├── _includes		// 供引入的 HTML 模块
|   ├── footer.html
|   └── header.html
├── _layouts		// 视图模板
|   ├── default.html
|   └── post.html
├── _posts		    // 博客文章
|   ├── 2007-10-29-why-every-programmer-should-play-nethack.markdown
|   └── 2009-04-26-barcamp-boston-4-roundup.markdown
├── _site		    // Jekyll 编译生成的站点
└── index.html
```

- 其中 `_config.yml` 是 Jekyll 的配置文件。其语法见：<http://www.yaml.org/spec/1.2/spec.html>。
- 其中的 HTML 采用 Liquid 模板语言，见 <http://docs.shopify.com/themes/liquid-basics>。
- 其中的文章一般选 Markdown 语言，其语法见：<http://daringfireball.net/projects/markdown/>。

## 本地预览

同样可以参考 [使用 Jekyll 在本地测试 GitHub Pages 站点](https://docs.github.com/cn/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)。基本上，你需要在本机安装 Ruby 和 Jekyll。所以也可以参考 [Jekyll 的 Installation 文档](https://jekyllrb.com/docs/installation/)。

安装好后 Jekyll 后，在你的 Shell 里执行：

```bash
jekyll serve
```

打开浏览器，访问 <http://localhost:4000>，你就可以看到本地的 Jekyll 网站了。

出于安全性的考虑，GitHub Pages 上的 Jekyll 通过 `--safe` 参数执行，会禁用 [白名单](https://pages.github.com/versions/) 之外的 Jekyll 的插件。所以本地预览成功的效果推送上去不一定成功。

如果希望使用自定义的 Jekyll 插件，只能关闭 GitHub 的 Jekyll 引擎，在本地编译好之后再 Push 到 Github。可以在单独的分支维护源码，把编译好的 `_site` 目录推送到 Github。

## 网站统计

添加网站统计后，可以随时看到网站的流量情况。可以选 Google 统计、百度统计等。

1. 先去注册一个 Google 统计账号，拿到一个 ID 或一段脚本。
2. 把这段脚本加到 Jekyll 站点的基础模板里，通常是 `_layouts/default.html`。

例如下面这样。注意其中的 `{{site.ga}}` 是站点变量，需要在 `_config.yml` 中加入一行 `ga: 'XXXXX'`。当然你也可以把它直接写死。

```html
<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create', '{{site.ga}}', 'auto');ga('send', 'pageview');
</script>
```

## 使用 Jekyll 变量

上面例子中的 `{{site.ga}}` 属于站点变量，其实 Jekyll 中变量有三个来源：

1. 在 `_config.yml` 中定义的变量，在模板中可以通过 `site.xxx` 来访问。
2. 页面的 [Front Matter](https://jekyllrb.com/docs/front-matter/) 中定义的变量，或者文章页的变量，可通过 `page.xxx` 访问。
3. Jekyll 内置变量。比如在 `_layout` 模板中，`content` 变量表示子模板的内容。

更多变量的使用方式，请参考：<https://jekyllrb.com/docs/variables/>

## 代码高亮

Jekyll 内置了代码高亮功能，在 `_config.yml` 中可以直接配置代码高亮插件。加入下面一行即可：

```yml
highlighter: rouge
```

可以去 [rouge](https://github.com/jneen/rouge) 查看技术细节。

## 支持 LaTex

[MathJax](http://www.mathjax.org/) 支持 LaTex、MathML 等语言，可以渲染为 SVG，HTML 等多种格式。

在相应的页面上引入下面的脚本会把页面里的 `$` 与 `$` 中内容转换为行内公式（inline），将 `$$` 与 `$$` 中内容转换为独立的公式行（block）：

```html
<script type="text/x-mathjax-config">  
    MathJax.Hub.Config({
        tex2jax: {
            inlineMath: [['$', '$']],
            displayMath: [['$$', '$$']],
            processEscapes: true,
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        }
    });
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@2.7.5/MathJax.js?config=TeX-AMS_HTML"></script>
```

## 自定义域名

Github Pages 支持自定义域名，可以先去 [namesillo](https://www.namesilo.com/pricing?rid=4a60637ec) 注册一个域名（居然支持支付宝），再按照 [Github 文档](https://docs.github.com/cn/pages/configuring-a-custom-domain-for-your-github-pages-site) 来配置 GitHub Pages 站点的自定义域。

## 常见问题

### 1. 克隆和推送超时

在国内有些运营商的网络下，访问 Github 存在丢包、限速甚至 ping 不通的情况。

- 端口屏蔽。每个仓库都有 https, ssh 两种克隆地址可选。有时 https 会被某些运营商墙掉，这时换用 ssh 地址会好一些。
- 域名污染。有些运营商会污染 Github 域名，可以换用 8.8.8.8（Google DNS）并清除 DNS 缓存再试，或者用最新的 IP 写到 hosts 中。

也可以使用 [Gitee 极速下载](https://gitee.com/mirrors) 这种 GitHub 镜像服务。

### 2. 推送上去的文章不显示

根据 [关于 GitHub Pages 站点的 Jekyll 构建错误](https://docs.github.com/cn/pages/setting-up-a-github-pages-site-with-jekyll/about-jekyll-build-errors-for-github-pages-sites)，推送上去的 Jekyll 构建失败时你会收到具体问题的通知。

如果确实构建成功了，文章仍然没有显示，还有可能是文件名里的文章日期在未来。这种情况 Jekyll 默认是不产出 HTML 的。但也有可能是你所在的时区比 Github Pages 服务所在的时区更提前，如果要强制未来日期的文章都显示，可以在 `_config.yml` 里加入 `future: true` 配置。

### 3. 半角引号被渲染为全角引号

中文博客里通常希望区分半角和全角标点。比如代码和英文引用里保留半角引号，中文内容里采用全角引号。但 kramdown 默认开启了 `smart_quotes`，会把引号都搞成全角。要禁用这一行为，可以在 `_config.yml` 里加入：

```yml
kramdown:
  # 前指定左右单引号渲染结果，后两个指定左右双引号渲染结果
  smart_quotes: ["apos", "apos", "quot", "quot"]
```

Kramdown 参数说明请参考 <https://kramdown.gettalong.org/options.html>。