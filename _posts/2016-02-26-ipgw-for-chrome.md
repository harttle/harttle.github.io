---
layout: blog
title: "PKU 网关 Chrome 插件 PKUWebmaster 升级到 2.0 啦！"
tags: JavaScript Chrome PKU
---

早在2013年，为了方便PKU的Chrome用户连接校内网官，包括Rea和我在内的[鸟人团队][birdmen]一起编写了[PKUWebmaster][store]。
此后该插件历经了Chrome `Notification` 的标准化、PKU 网关接口的变化、以及整个Web前端技术的革新，
[鸟人团队][birdmen]于近期意识到更新该插件的必要性。现已修复了既有BUG，并重写了设置页面。

# 安装与使用

2.0版本已经更新在Chrome商店了：

[https://chrome.google.com/webstore/detail/pkuwebmaster（北京大学网关插件）/bnlipdfmheddpljigcaaamjpnbhhklkb][chrome-store]

如果你希望使用最新的版本，可以下载Github仓库：

[https://github.com/pku-birdmen/pkuwebmaster][repo]

并将`src`目录拖动至Chrome的『扩展程序』页面即可。

<!--more-->

# 安全与隐私

网关登录涉及到PKU用户可能关注的账号隐私问题。所有用户信息是保存在本地的（HTML5的`localStorage`），[鸟人团队][birdmen]不会获取和保存你的任何信息。
在Chrome的『扩展程序』页面也可以审查整个后台程序的源码。

为了更加安全和透明，我们已将整个项目开源：

[https://github.com/pku-birdmen/pkuwebmaster][repo]

# 反馈与意见

如果有任何的反馈意见或Bug报告，可直接在[Github Issue 页面][issue]创建一个Issue，改进或修复后你会得到通知。

同时也欢迎Fork，欢迎贡献你的代码！

[repo]: https://github.com/pku-birdmen/pkuwebmaster
[birdmen]: https://github.com/pku-birdmen
[chrome-store]: https://chrome.google.com/webstore/category/apps 
[store]: https://chrome.google.com/webstore/detail/pkuwebmaster（北京大学网关插件）/bnlipdfmheddpljigcaaamjpnbhhklkb
[issue]: https://github.com/pku-birdmen/pkuwebmaster/issues

