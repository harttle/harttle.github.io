HarttleLand 博客主题
=================

本仓库是 **[Harttle Land](http://harttle.land)** 的源码，欢迎 Clone 和 Fork。

## 功能

* 代码高亮
* laTex 公式
* 社交分享
* 标签云
* 文章目录

## 授权

本仓库提供的**主题**使用 [MIT][license] 协议授权。这一主题包括除文章（`*.md`）之外的任何样式、模板，以及脚本。

你可以自由地使用（包括商业用途）、修改、发布本仓库提供的主题，
只要保留一份 [LICENSE][license] 文件，以及在合适的地方保留如下 HTML：

```
Theme by <a href="http://harttle.land">Harttle</a>
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
