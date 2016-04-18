---
layout: blog
title: 通过设定解析线路让百度收录Github Pages
tags: Git Github HTML HTTP 网络 搜索引擎
---

利用Github Pages创建博客的国内作者一定有这样的麻烦：
Github对Baidu Spider的用户代理都会返回403状态码，因而百度无法收录博客内容。
为解决此问题，小编在2016年01月21日在Gitcafe Pages（今Coding.net）创建镜像，
并设置域名解析百度线路来的harttle.com到该镜像。
如今百度已经可以正常收录harttle.com的文章了，撰文在此希望能帮到别人。

* *一个域名*：百度收录、Google收录、用户访问的域名是相同的。
* *免费使用*：不需要购买VPS或者CDN服务。
* *实时同步*：不存在CDN的不同步的问题，同时也不存在CDN线路选择不确定的问题。
* *不需备案*：使用Coding.net的域名做CNAME，不需自己备案。

# 最终效果

百度收录情况如下，21日创建镜像后22日就开始有页面被收录了。

![](/assets/img/blog/baidu-index@2x.jpg)

<!--more-->

近一月来的抓取频次如下图，每天都有5次左右的抓取。

![](/assets/img/blog/baidu-crawl@2x.jpg)

# 仓库同步

> 既然如今Gitcafe的Git仓库服务已经转移到了Coding.net，
> 下文中以Coding.net中的配置为例。

首先需要在Coding.net创建仓库并开启Pages服务。首先创建一个`coding-pages`分支，
然后把它push到Coding.net上的仓库。

```bash
git checkout -b coding-pages
git remote add coding.net git@git.coding.net:harttle/harttle.git
git push coding.net coding-pages
```

在Coding.net上看到自己的仓库代码后，在Pages设置页面中开启Pages服务。
此时，可以访问<http://harttle.coding.me>来测试了（可能会有一分钟左右的延迟，之间会404）。

# 域名配置

首先在Coding.net的Pages页面绑定一个自定义域名：harttle.com。
然后在域名解析控制台中，将百度线路来的harttle.com解析到pages.coding.me：

```
记录类型 	主机记录 	解析线路 	记录值	            TTL	
CNAME	    @	        百度	    pages.coding.me	    10分钟
```

这样从百度线路来的请求都会被解析到pages.coding.me，在HTTP请求头中仍然包含harttle.com主机的信息。
因为在Coding.net中设置了绑定harttle.com，所以Coding.net会很配合地接受该HTTP请求。

这样百度便可以正确地收到Github Pages页面了，我们只需要保持同步即可。

# 同步脚本

我在这里写了一个同步脚本：

```bash
git checkout coding-pages && \
echo '[harttle] Merging master' && \
git merge master -m 'merged master'&& \
echo '[harttle] Pushing to coding.net' && \
git push coding.net && \
git checkout master
```

你愿意的话也可以把它作为一个Github Hook来自动执行同步。

# 镜像重定向

上面在Coding.net创建的镜像站点有两种访问方式：

1. 从百度内部线路访问。
2. 通过<http://harttle.coding.me>访问。

通过上述渠道访问站点的用户应当重定向到harttle.com，同时百度Spider不应被重定向。
解决这个问题很简单，在coding-pages分支中的HTML Head中添加脚本的重定向即可：

```html
<script>
  location.href='http://harttle.com' + location.pathname;
</script>
```

这样，所有来自浏览器的访问就会被重定向到源站点，而搜索引擎则不会被影响。

# Github Pages问题何在

这不是技术问题。

继两年前被[大陆网络封锁事件][weibo]之后，2015年3月26日凌晨受到来自中国联通主干网的DDoS攻击。
攻击者劫持了百度统计并插入脚本，将流量导向[Greatfire][greatfire]和[纽约时报镜像][cnnytimes]Github仓库。
脚本片段如下，来源: <http://drops.wooyun.org/papers/5398>

```javascript
url_array = ["https://github.com/greatfire/", "https://github.com/cn-nytimes/"];
NUM = url_array.length;
 
function r_send2() {
    var a = unixtime() % NUM;
    get(url_array[a])
}
 
function get(a) {
    var b;
    $.ajax({
        url: a,
        ...
```

> 87 hours in, our mitigation is deflecting most attack traffic. We're aware of intermittent issues and continue to adapt our response.
> — GitHub Status(@githubstatus), March 29, 2015

> The DDoS attack has evolved and we are working to mitigate
> — GitHub Statu (@githubstatus), March 30, 2015

3月27日，[百度安全应急响应中心的微博][baidu]中否认了自身产品存在问题。
从此Github Pages对Baidu Spider总是返回403 Forbidden。

[wiki]: https://zh.wikipedia.org/wiki/GitHub
[weibo]: http://weibo.com/1197161814/zfGjQaBDB?type=comment#_rnd1459698644805
[greatfire]: https://github.com/greatfire
[cnnytimes]: https://github.com/cn-nytimes
[baidu]: http://weibo.com/3326069452/Caw7wsZ1L?type=comment#_rnd1459700002389
