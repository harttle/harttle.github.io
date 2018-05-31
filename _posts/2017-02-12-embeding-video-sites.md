---
title: 国内主要视频网站的嵌入方式
tags: Flash iframe 视频 HTML5
---

来一篇水文，整理一下国内各大视频网站的视频嵌入方式，或许有一点用处。
爱奇艺、优酷、搜狐视频、腾讯视频、酷6、土豆、乐视。
这些视频站绝大多数都采用 Flash 的方式播放，很多也提供了 iframe 的播放方式。

> 根据最新标准应当使用 `<object>`，可以添加 `<embed>` 作为Fallback。

但目前正在逐步地支持 HTML5 的原生 `<video>` 标签，这需要大量的开发工作。
因为 `<video>` 会被绝大多数国内手机浏览器劫持产生各种出乎意料的渲染结果，
只有 iOS 可以完美地使用 `<video>`。

> 2.5.6 Apps that browse the web must use the appropriate WebKit framework and WebKit Javascript. -- [App Store Review Guidelines][apple-guidlines]

<!--more-->


# 爱奇艺

【嵌入文档】<http://open.iqiyi.com/lib/player.html>

【嵌入方式】Flash(Object, Embed), Iframe

Flash 嵌入代码：

```html
<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" width="680" height="520">
  <param name="movie" value="http://dispatcher.video.qiyi.com/disp/shareplayer.swf?vid=ade484a7c87734eee38f7f77cd9f3159&tvId=250912700&coop=&cid=&bd=1"/> 
  <param name="quality" value="high"/> 
  <param name="wmode" value="transparent"/> 
  <param value="true" name="allowFullScreen"/> 
  <embed src="http://dispatcher.video.qiyi.com/disp/shareplayer.swf?vid=ade484a7c87734eee38f7f77cd9f3159&tvId=250912700&coop=&cid=&bd=1" wmode="transparent" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="680" height="520" allowfullscreen="true"/>
</object>
```

Iframe 嵌入代码：

```html
<iframe src='http://open.iqiyi.com/developer/player_js/coopPlayerIndex.html?vid=0c2340bbe6cce1bde14e94e50cd754ac&tvId=386549000&accessToken=2.f22860a2479ad60d8da7697274de9346&appKey=3955c3425820435e86d0f4cdfe56f5e7&appId=1368&height=100%&width=100%' frameborder='0' width='320px' height='180px' allowfullscreen='true'></iframe>
```

# 优酷

【嵌入文档】<http://www.youku.com>

【嵌入方式】Flash(Embed), Iframe

Flash 嵌入代码：

```html
<embed src='http://player.youku.com/player.php/sid/XMTc1OTEwNTEwOA==/v.swf' allowFullScreen='true' quality='high' width='480' height='400' align='middle' allowScriptAccess='always' type='application/x-shockwave-flash'></embed>
```

Iframe 嵌入代码：

```html
<iframe height=498 width=510 src='http://player.youku.com/embed/XMTc1OTEwNTEwOA==' frameborder=0 'allowfullscreen'></iframe>
```

# 搜狐视频

【嵌入文档】<http://lm.tv.sohu.com/union/open_platform.do>

【嵌入方式】Flash（Embed），JS SDK (HTML5)

Flash 嵌入代码：

```html
<embed wmode="Transparent" allowfullscreen="true" allowscriptaccess="always" quality="high" src="http://share.vrs.sohu.com/2316624/v.swf&topBar=1&autoplay=false&plid=8399917&pub_catecode=0&from=page" type="application/x-shockwave-flash" /></embed>
```

搜狐视频的 JS SDK 需要创建应用并审核，需要经历一定的周期，不能立即使用。

# 腾讯视频

【嵌入文档】无

【嵌入方式】Flash（Embed），JS SDK (HTML5)

Flash 方式：

```html
<embed src="http://static.video.qq.com/TPout.swf?vid=k0015trfczz&auto=0" allowFullScreen="true" quality="high" width="480" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>
```

Iframe 方式：

```hmtl
<iframe frameborder="0" width="640" height="498" src="http://v.qq.com/iframe/player.html?vid=k0015trfczz&tiny=0&auto=0" allowfullscreen></iframe>
```

# 酷6

【嵌入文档】<http://dev.ku6.com/>

【嵌入方式】Flash（Object），JS SDK（Embed）

Flash 嵌入代码：

```html
<object id="video_player" type="application/x-shockwave-flash" data="http://player.ku6.com/refer/y5dVmbq9y8-q9cgAwLfczA../v.swf" height="300" width="400">
  <!--[if lt IE 9.0]>
  <param name="movie" value="http://player.ku6.com/refer/live.swf">
  <![endif]-->
  <param name="quality" value="high">
  <param name="allowScriptAccess" value="always">
  <param name="allowFullScreen" value="true">
  <param name="wMode" value="transparent">
  <param name="swLiveConnect" value="true">
  <param name="flashvars" value="p=910">
</object>
```

Javascript API 方式：

```html
<script src="http://player.ku6.com/mini/v.js"></script>
<script>
  (function() {
    var vid = "N9pqJprg6I2yqLId,joLz6gfDhGzCXEavYft7AQ..";
    var img = "http://i2.ku6img.com/cms/military/201108/05/jian.jpg,http://gug.ku6cdn.com/201112/ku620111222155210859.jpg";
    var thistitle = "歼10战斗机,何洁 音乐微电影《是不是爱情》预告片";
    var thisurl = "http://v.ku6.com/show/N9pqJprg6I2yqLId.html,http://v.ku6.com/show/joLz6gfDhGzCXEavYft7AQ...html"

    XEmbed(vid, img, thistitle, thisurl, {
      width: '300',
      height: '250',
      id: 'miniPlayer'
    });
  })();
</script>
```

# 土豆

【嵌入文档】<http://api.tudou.com/wiki/index.php/%E7%AB%99%E5%A4%96%E6%92%AD%E6%94%BE%E5%99%A8%E8%AF%B4%E6%98%8E>

【嵌入方式】Flash（object，embed）

Flash 嵌入代码：

```html
<embed src="http://www.tudou.com/v/I7C_srs6TYo/&autoPlay=true/v.swf" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="opaque" width="480" height="400"></embed>
```

# 乐视视频

【嵌入文档】无

【嵌入方式】Flash（object，embed）

Flash 嵌入代码：

```html
<object width='541' height='450'><param name='allowFullScreen' value='true'><param name='movie' value='http://img1.c0.letv.com/ptv/player/swfPlayer.swf?autoPlay=0&id=26849015'/><embed src='http://img1.c0.letv.com/ptv/player/swfPlayer.swf?autoPlay=0&id=26849015' width='541' height='450' allowFullScreen='true' type='application/x-shockwave-flash'/></object>
```

[apple-guidlines]: https://developer.apple.com/app-store/review/guidelines/
