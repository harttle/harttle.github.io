---
title: iPhone 各机型的 iOS 和 Safari 版本
tags: iOS 版本 iPhone Safari
---

Web 开发时关心 iPhone 的兼容性，其实就是关心各 Safari 版本的市场占有率。而后者取决于 iPhone 各版本的市场占有率。比如某些 iPhone 已经绝版了，那么它对应的 Safari 版本也不再需要去支持了。此外更现实的问题是，老板说“我的 iPhone X 下这个页面挂了”，这时就需要猜他的 Safari 版本，再对应 [caniuse.com](https://caniuse.com/) 就能知道哪些特性把页面搞挂了。iOS Safari 的发版有这么几个规律：

1. **iPhone 的 Safari 是随着 iOS 发版的**。也就是说你的 iOS 版本直接决定了 Safari 版本，而想要更新 Safari 版本，就得更新 iOS 版本。
2. **每个 iPhone 有支持的 iOS 范围**。这个范围从它搭载的首个 iOS 版本直到它不能再支持的最高 iOS 版本。比如：
    - iPhone 12 发布时搭载的初始系统是 iOS 14.1，但可以升级到最新的 iOS 15.3.1，那么 iPhone 12 的 iOS 版本范围就是 [14.1, 15.3.1]。
    - 一些旧的 iPhone 无法支持 iOS 13，所以它们的最高 iOS 版本就锁定在了 12.5.5，它搭载的 Safari 12.1.2 就成了分水岭，类似 IE6 的角色。
3. **最近的 iOS 和 Safari 主版本是一致的**。比如 Safari 13 随着 iOS 13 发布，Safari 14 随着 iOS 14 发布。

<!--more-->

<table class="full-width">
  <tbody><tr>
    <th>设备</th>
    <th>发布日期</th>
    <th>初始 iOS</th>
    <th>最高 iOS</th>
    <th>最低 Safari</th>
    <th>最高 Safari</th>
  </tr>
  <tr>
    <td>iPhone 13 Pro / 13 Pro Max</td>
    <td rowspan="2">2021</td>
    <td rowspan="2">15</td>
    <td rowspan="14">15 (latest)</td>
    <td rowspan="2">15.0</td>
    <td rowspan="14">15.3 (latest)</td>
  </tr>
  <tr>
    <td>iPhone 13 / 13 mini</td>
  </tr>
  <tr>
    <td>iPhone 12 Pro / 12 Pro Max</td>
    <td rowspan="3">2020</td>
    <td rowspan="2">14</td>
    <td rowspan="2">14.0</td>
  </tr>
  <tr>
    <td>iPhone 12 / 12 mini</td>
  </tr>
  <tr>
    <td>iPhone SE (gen 2)</td>
    <td rowspan="3">13</td>
    <td rowspan="3">13.0</td>
  </tr>
  <tr>
    <td>iPhone 11 Pro / 11 Pro Max</td>
    <td rowspan="2">2019</td>
  </tr>
  <tr>
    <td>iPhone 11</td>
  </tr>
  <tr>
    <td>iPhone XS / XS Max</td>
    <td rowspan="2">2018</td>
    <td rowspan="2">12</td>
    <td rowspan="2">12.0</td>
  </tr>
  <tr>
    <td>iPhone XR</td>
  </tr>
  <tr>
    <td>iPhone X</td>
    <td rowspan="2">2017</td>
    <td rowspan="2">11</td>
    <td rowspan="2">11.0</td>
  </tr>
  <tr>
    <td>iPhone 8 / 8 Plus</td>
  </tr>
  <tr>
    <td>iPhone 7 / 7 Plus</td>
    <td rowspan="2">2016</td>
    <td>10</td>
    <td>10.0</td>
  </tr>
  <tr>
    <td>iPhone SE (gen 1)</td>
    <td rowspan="2">9</td>
    <td rowspan="2">9.0</td>
  </tr>
  <tr>
    <td>iPhone 6s / 6s Plus</td>
    <td>2015</td>
  </tr>
  <tr>
    <td>iPhone 6 / 6 Plus</td>
    <td>2014</td>
    <td>8</td>
    <td rowspan="2">12</td>
    <td>8.0</td>
    <td rowspan="2">12.1.2</td>
  </tr>
  <tr>
    <td>iPhone 5s</td>
    <td rowspan="2">2013</td>
    <td rowspan="2">7</td>
    <td rowspan="2">7.0</td>
  </tr>
  <tr>
    <td>iPhone 5c</td>
    <td rowspan="2">10</td>
    <td rowspan="2">10.0</td>
  </tr>
  <tr>
    <td>iPhone 5</td>
    <td>2012</td>
    <td>6</td>
    <td>6.0</td>
  </tr>
  <tr>
    <td>iPhone 4s</td>
    <td>2011</td>
    <td>5</td>
    <td>9</td>
    <td>5.1</td>
    <td>9.0</td>
  </tr>
  <tr>
    <td>iPhone 4</td>
    <td>2010</td>
    <td>4</td>
    <td>7</td>
    <td>4.0.5</td>
    <td>7.0</td>
  </tr>
  <tr>
    <td>iPhone 3GS</td>
    <td>2009</td>
    <td>3</td>
    <td>6</td>
    <td>4.0</td>
    <td>6.0</td>
  </tr>
  <tr>
    <td>iPhone 3G</td>
    <td>2008</td>
    <td>2</td>
    <td>4</td>
    <td>3.1.1</td>
    <td>5.0.2</td>
  </tr>
  <tr>
    <td>iPhone (gen 1)</td>
    <td>2007</td>
    <td>1</td>
    <td>3</td>
    <td>3.0</td>
    <td>4.0</td>
  </tr>
</tbody></table>


更多链接

* Safari Release Notes: <https://developer.apple.com/documentation/safari-release-notes>
* Safari version history: <https://en.wikipedia.org/wiki/Safari_version_history#iOS>
* iOS version by device: <https://iosref.com/ios#iphone>
