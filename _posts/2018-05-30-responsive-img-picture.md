---
title: 正确使用 HTML5 标签：img, picture, figure 的响应式设计
tags: HTML 响应式 媒体查询 图片
---

**TL;DR**: 相比 `img` 标签，`picture` 提供了更丰富的响应式资源选择方式；
`figure` 用于提供排版的图表概念，其中的图片仍然要使用 `picture` 或 `img`；
在支持 HTML5 的浏览器中，可以基于[视口宽度][viewport]、设备像素密度、缩放级别、
以及图片格式的支持程度来选择图片资源。
图片替代文本（`alt` 属性）的目的是替代图片内容，可以增强网页在很多场景下的可用性。
此外对于纯装饰性的图片不建议使用任何 HTML 标签，可以利用 CSS 实现。

<!--more-->

## 图片相关的元素

[img](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img) 是 HTML4 时就有的标签，
至今仍然是在网页中嵌入图片的最常用的方式。 与 `<span>`, `<em>` 等标签一样属于行内标签
（准确地说属于 [Phrasing Content][phrasing-content]）。下面是一个示例：

```html
<img src="https://harttle.land/assets/img/avatar.jpg" alt="the author">
```

[picture](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture) 是 HTML5 中定义新标签，
其中可以定义若干个 `<source>`，浏览器会匹配 `<source>` 的 `type`, `media`, `srcset` 等属性，
来找到最适合当前布局、[视口宽度][viewport]、*设备像素密度* 的一个去下载。
为了向下兼容不识别 `<picture>` 和 `<source>` 的浏览器，`<picture>` 中还可以写一个 `<img>` 作为 fallback。

```html
<picture>
 <source srcset="harttle-land-avatar.png" media="(min-width: 750px)">
 <img src="harttle-land-banner.png" alt="a banner for harttle.land">
</picture>
```

[figure](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure)
与 `<img>`, `<picture>` 不同的是它提供的是排版中的图表概念，而非技术上的图片资源。
比如 `<figure>` 可以有自己的 `<figurecaption>`，其中不一定要有图片，还可以是文字说明、代码片段等。

```html
<figure>
  <img src="https://harttle.land/assets/img/avatar.jpg" alt="the author">
  <figcaption>Harttle's Avatar</figcaption>
</figure>
```

## 响应式：基于视口宽度

[响应式设计](https://en.wikipedia.org/wiki/Responsive_web_design) 是一种 Web 页面设计方式，
使得不同 [视口宽度][viewport] 和 *设备像素密度* 下内容都可以很好地展示，都可以保证可用性和用户满足。

提到响应式多数开发者都会想到 CSS 媒体查询，但 HTML5 中还定义了元素属性的媒体查询。
这使得可以通过媒体查询来根据元素渲染宽度 *选择资源* 和 *图片占位*：

```html
<img src="avatar.png" 
     srcset="avatar-200.png 200w, avatar-400.png 400w"
     sizes="(max-width: 600px) 200px, 50vw">
```

浏览器会根据 `sizes` 的媒体查询来决定渲染大小；此后根据实际的渲染大小来决定选择哪个资源。
比如屏幕宽度为 `500px`，那么就会调整图片大小为 `200px`，
然后选择 `srcset` 中最匹配这个大小的 `avatar-200.png` 去下载。

## 响应式：基于设备像素比

支持 HTML5 的浏览器中还可以基于 *设备像素比* 来选择资源。
在刚出现 Retina 屏幕时有些网页图片展现模糊，
就是因为在高像素密度（比如 2 倍设备像素比）的屏幕上仍然显示 1 倍大小的图片。
`<img>` 元素的 src 和 srcset 属性都支持 x 描述符来提供不同大小的图片。

```html
<img src="avatar-1.0.png" srcset="avatar-1.5.png 1.5x, avatar-2.0.png 2x">
```

用户代理可以根据用户屏幕像素密度、缩放级别，甚至用户的网络条件选择任何一个给出的资源。
这里同时给出 `src` 也是为了向后兼容。

## 响应式：基于媒体查询

上文提到在 `<img>` 元素的 `sizes` 中可以写媒体查询来计算宽高。
`<picture>` 中也可以通过媒体查询来选择 `<source>` 可以给不同的设备大小下载不同的图片。
区别在于 **基于视口宽度** 的资源选择侧重于对不同大小的屏幕选择宽度适合的，同样内容的图片。
**基于媒体查询** 的资源选择侧重于对不同的屏幕选择不同内容的图片。

比如在移动设备上只显示头像，在大屏幕显示器上则显示完整的大图。

```html
<picture>
 <source srcset="avatar.png" media="(max-width: 640px)">
 <source srcset="avatar-with-background.png" media="(min-width: 640px)">
 <img src="avatar.png" alt="smiling harttle">
</picture>
```
基于媒体查询的选择在 HTML5 标准中称为
[Art Direction](https://html.spec.whatwg.org/multipage/images.html#art-direction)。

## 响应式：基于图片格式

`<source>` 元素的 `type` 属性可以指定图片格式，浏览器可以选择自己支持的去下载。
基于图片格式的选择可以用于性能优化，有些格式我们知道压缩比非常好但并非所有浏览器都支持。
这时就可以提供多种格式的图片让浏览器来选择。

```html
<picture>
 <source srcset="avatar.webp" type="image/webp">
 <source srcset="avatar.jxr" type="image/vnd.ms-photo">
 <img src="avatar.jpg" alt="" width="100" height="150">
</picture>
```

在这个例子中，如果用户代理支持 WebP 就会选择第一个 `<source>` 元素。
如果不支持 WebP，但支持 JPEG XR 就会选择第二个 source 元素。
如果这两种都不支持，就会选择 img 元素。（这个例子来自 [HTML Standard](https://html.spec.whatwg.org/multipage/images.html#image-format-based-selection)）

## 编写替代文本

使用 `<img>` 元素最容易出错的地方其实在于容易忽略 [替代文本][alt-text]。
大多数场景下替代文本指的就是其 `alt` 属性（见上述例子）。
替代文本是当用户代理不支持图片或网络情况不允许载入图片时，显示给用户的用来替代图片的文本。

容易忽略替代文本是因为开发/测试时的浏览器都可以正常访问。
但 Web 的开放平台，你的页面可能被任何网络环境下的任何设备和浏览器访问。
比如在信号不好的地方通过网页查询信息，比如邮件中的图片以及邮件被多次转发后的图片，
甚至比如在 Linux 下的 Emacs 中浏览一个链接。
当然我还没有提给盲人用的屏幕阅读器，替代文本的重要性不亚于无障碍人行道。

**编写替代文本的原则是：如果你没法在这里引入图片时会怎么写？**这是一个不合格的例子：

```html
这是一张照片，
<img src="https://harttle.land/assets/img/avatar.jpg" alt="照片">
他是一个前端搬砖工，还好会写博客。
```

因为屏幕阅读器会把它读作：“这是一张照片，harttle 的照片，
他是一个不太专业的 H5 制作工程师，还好会写博客。”一个合格的例子是这样：

```html
这是一张照片，
<img src="https://harttle.land/assets/img/avatar.jpg" alt="像红衣主教一样的一个人，正在吹笛子">
他是一个前端搬砖工，还好会写博客。
```

## 不适用标签的情况

[内容与样式分离](https://en.wikipedia.org/wiki/Separation_of_content_and_presentation)
是 Web 设计中的重要概念。这样的设计有利于可维护性，机器可读和互操作性等，总之就是让 HTML 更漂亮。
外链样式表和 HTML5 语义标签都有这个用意。这方面 `<img>` 元素只需要注意一点：
**纯装饰性的图片不建议使用 `<img>` 写在 HTML 中，尽量用 CSS 替代。**

比如站点主题中的图片，其实不属于当前网页的内容。
在网页 HTML 中添加这些图片标签会让爬虫、屏幕阅读器等非视觉用户代理难以理解。
使用 CSS `background-image` 属性也可以达到显示图片的效果，CSS 还有很多对装饰性图片很有用的属性比如
`background-repeat`, `background-size`, `background-attachment` 等，参考：
<https://developer.mozilla.org/en-US/docs/Web/CSS/background>


[alt-text]: https://html.spec.whatwg.org/multipage/images.html#alt
[phrasing-content]: https://html.spec.whatwg.org/#phrasing-content
[viewport]: /2016/04/21/viewport.html
