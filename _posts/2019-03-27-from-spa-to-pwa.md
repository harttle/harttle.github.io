---
title: 从 SPA 到 PWA
tags: Web PWA SPA
---

从 [AJAX][ajax]（Asynchronous JavaScript + XML，异步JavaScript和XML）开始应用，
尤其是 [AngularJS][ng] 推出之后 [SPA][spa]（Single Page App，单页应用）已经成为前端 App 的必选方案。
SPA 可以在客户端提供完整的路由、页面渲染、甚至一部分数据处理；
这往往需要一个比 jQuery 时代更重的 JavaScript 框架，来实现这些原本发生在后端的逻辑。
多数框架如 [React][react]、[Vue][vue] 还会内置组件化机制来帮助开发者组织代码，
它们甚至进化到专门负责视图组件的程度，路由和数据交由各种插件来处理，
比如 [vuex][vuex]、[Redux][redux]、[Vue Router][vue-router] 等等。
这些工具已经相当先进和完整，提供了路由方案、服务器端渲染方案、前端状态管理方案。

但 SPA 的本质还是浏览器端 App，底层技术仍然依赖
[history API][history]、[defineProperty][defineProperty]、[AJAX][ajax]。
这些 API 的能力和完备性，决定了 SPA 能达到的用户体验和上层架构设计。
也正是这些底层 API 的不足和缺陷使得 SPA 很难企及原始 Web 的架构优势。
比如在内容可访问性（Accessibility）、服务的独立部署和演化（Independent Deployment）
等方面远不及十年前搭建的同类站点。同时还在不同程度上破坏了 HTTP、URL、HTML 的语义，
这些缺陷使我们需要花费大量精力去修复日志统计、性能优化、首屏渲染、静态分析和测试等环节。
**而陷阱在于决策使用 SPA 方案时不一定能有足够的远见看到这些问题对架构带来的深远影响。**

与此同时 Web 标准也在持续迭代，诸如 Web Bluetooth、Push API、Web of Things、[Service Worker][sw]
的标准已经在主流浏览器（尤其考虑国内 webkit 内核的普及程度）有不同程度的支持。
尤其是 [PWA][pwa]（Progressive Web App，渐进式 Web 应用）概念的提出，
**给出了一种在不破坏 Web 架构的前提下实现流畅用户体验的方式。**
本文就 SPA 架构的一些不足展开讨论，
并探讨 PWA 方案（这里说是方案，其实更是一种技术方向的选择）的价值和私有平台的最佳演化方式。

<!--more-->

## 我们想要怎样的 Web App？

Web 页面尤其是动态 Web 页面和 Web App 的区别非常模糊，
但为了更清晰地讨论 SPA、PWA 这些技术方案，还是先来定性地**分析一下 Web App 背后的产品需求**：

1.	平滑的、不被打断的交互体验。如果交互过程中，页面重新加载而丢失状态、网络原因使得页面无法显示，这样用户体验就会被打断，就不够 App。
2.	与设备相适应的布局。例如在移动浏览器中展示 PC 页面的完整布局，就会使用户需要缩放和拖动才能查看信息，就不是 App 的体验。
3.	快速的呈现和响应。进入每一页都需要漫长的等待，或者用户操作后得不到立即反馈，可能是 Web 页面常见的问题。
4.	符合移动端的交互习惯。移动端特有的硬件使其 Native API 更加丰富，例如蓝牙、二维码、相机、支付、手势滑动、手势缩放、触感反馈等。

以上是笔者对 Web App 需求的理解（欢迎留下评论），下文基于此展开讨论。

## Web 架构的优势

值得思考的是，即使 Web 页面与我们对移动 App 的需求相差甚远，
Web 技术仍然是当前移动 App 的架构中必备的组成部分。
我们依赖 Web 技术的地方正是 Web 架构的优势：

1.	可链接。Web 在技术分类上属于分布式文档，这些文档通过 URL 相互链接。无论是单个网站内的不同页面还是跨网站的页面之间，都可以直接打开而无需下载安装。这里要强调一个隐含的功能：Deep Linking，即从一个 App 跳转进入另一个 App 内的指定页面，甚至还可以定位到特定的浏览位置。
2.	可访问。HTML 是 Web 的基石之一，一方面提供了内容和样式的分离，使得机器和人都可以阅读也便于开发更复杂的样式和交互；另一方面统一的标记语言有更好的可访问性，这是其他平台很难建设的，比如可以选择和复制，盲人可以启用屏幕阅读器，甚至可以找命令行中查看一个 Web 页面。
3.	零门槛。你不需要任何许可或付费就可以参与开发和提供 Web 服务。这意味着同时存在无数种方式来开发一个网站，在一定程度上促成了 Web 技术的繁荣。
4.	独立部署。不同的 Web 服务之间，甚至同一 Web 服务的各部分，都可以独立地部署和演化。新旧网站可以同时运行在这一平台上，这一点也是 HTML5 标准的迭代原则。
5.	健壮性。Web页面拥有分布式系统特有的健壮性。Web页面和它所依赖的图片、视频、脚本、样式等资源没有硬性依赖：一方面部分资源挂掉页面的其他功能仍然可用；另一方面Web App可以一边下载一边执行，这是其他平台很难具有的健壮性。

在 SPA 大行其道之后广泛讨论的兼容性、响应式设计、可访问性（或称无障碍）、页面性能等问题，
本来都是 Web 体系结构的优势，这是一个略带调侃的示例页面：
<https://motherfuckingwebsite.com/>
这个只有 81 行的网页，不仅传递了相当多的内容；
而且它在兼容性、响应式设计、可访问性、页面性能方面都表现优异。
重要的是这个页面使用的技术都来自Web早期，换句话说这些非功能需求正是 Web 与生俱来的优势。
既然我们正在费力解决的这些问题不来自于 Web 本身，那么这些问题到底来自哪里？
是重 JavaScript 框架的问题，还是组件化方案的问题，还是[掉进开发者体验陷阱][dev-exp]？

## SPA 方案的困难

本文不去讨论某个具体的 SPA 框架的成败或优缺点，只讨论采用 SPA 方案来实现我们想要的 Web App 存在哪些困难，以及 SPA 方案对既有 Web 页面的影响。
下面列举 SPA 方案对架构产生的一些比较重要的影响，从可链接性（URL）、可访问性，服务的独立性等方面具体分析。

### SPA 是一组高度耦合的页面（页面耦合）

**SPA 方案要求 App 内所有页面位于同一服务实例上**，
也就是说处理 SPA 页面请求的每个实例都必须拥有 App 内所有页面的信息，
这一信息通常是页面组件的声明。

这是因为 SPA 要求页面切换不发生浏览器跳转。设想操作流程『打开页面A -> pushState 到页面 B -> 刷新 -> 返回』，这时浏览器不会重新加载 A，而只是触发 popstate 事件给 B。
因此对于任意页面 A，点出到的任意页面 B，B 页面反过来都需要 A 的信息，当然页面 A 也知道页面 B 的信息，因此任意两个有跳转关系的页面，都需要相互了解对方的信息，或引用对方组件。

这样相互耦合的一组页面，就构成了一个 SPA 方案的 Web App。
这样的 App 内所有页面都不再能够『独立部署』，因此也不能独立迭代演化。
这往往意味着它们的开发调试、前端编译、部署过程都是耦合在一起的，
这些都是 SPA 方案带来的成本：

* 开发依赖：因为要能够打开一个页面必须引用对应的组件，这些组件在开发和调试阶段一定需要绑在一起。如果两个页面涉及到业务会跨团队，无疑会增加很多成本。
* 编译依赖：考虑使用 MD5 戳的编译方法，相互引用的一组文件必须一起编译上线，这会降低协作效率因为它们本属于不同的业务或团队。当然也可以不使用 MD5 戳并分别上线，动态调整引用关系，这样的问题在于无法平衡 HTTP 缓存和快速生效的矛盾。

此外，由于浏览器的[同源策略][same-origin]，一个 Web App 被限制共享一个域名。
否则在富交互的场景下跨域将会是一个[非常复杂的问题][cors-preflight]，
当然如果你愿意使用 JSONP 这么不安全的接口另当别论。

### 强组件化容易陷入技术竖井（技术封闭）

**SPA 方案伴随着强组件化方案，容易陷入封闭的技术竖井**。
换句话说就是容易一条路走到黑，失去 Web 应有的架构优势。
这是因为异步页面拥有异步的天性。
浏览器[重新渲染一个页面][static-render]时，
全局变量、定时器、事件监听器都会初始化为全新的，这是『刷新』的含义。
而异步页面却不然：

* 异步页面间，全局变量、定时器是共享的，没有托管很容易乱掉。
* 异步页面的 `<script>` 之间，[执行顺序是不保证的][dynamic-script]，没有托管极易出错。

因此绝大多数 SPA 方案都不会让你直接插入 `<script>` 来编写业务代码，
与此相反，会提供类似 [模块][ng-module]、[组件][comp] 之类的概念来托管一切。
你可能需要存储、需要网络、需要路由、需要通信，你需要把所有 Web API 都封装一遍。

这是各种 SPA 框架全家桶背后的逻辑。
最终业务的运行环境不再是浏览器，而是这套组件化方案。
而社区的组件化方案不会像 Web 标准一样去迭代，也不一定向下兼容，这在版本升级或框架迁移时会产生非常大的成本。

### URL 不再能定位资源（URL 弱化，可访问性差）

对于原始 Web 页面，URL 不仅能定位资源的页面，甚至还能[定位到页面种的具体浏览位置][id]。
但是在 SPA 里页面由 SPA 框架渲染，经典的配置是对于所有 URL 都返回同一个资源，
浏览器端脚本通过 `location.href` 渲染不同的页面。所以这有啥问题？

1. 首屏性能差。浏览器端渲染，在页面下载过程中是白屏的；浏览器直接渲染页面是流式的，下载多少渲染多少。
2. 机器不可读。搜索引擎、CLI 用户代理等不支持脚本的用户代理无法解析页面，因为不同 URL 页面内容是一样的。
3. 无法定位浏览位置。因为浏览器不再托管整页渲染也无法记录和恢复浏览位置。

可以看到不仅链接（URL）的概念被弱化，而且可访问性天生就很差。
比较先进的 SPA 框架会提供服务器端渲染（[SSR][ssr]）来补救，但对架构有额外的要求：
前后端都可以进行页面渲染，通常会要求前后端同构。

既然浏览器不再记录浏览位置，就需要 SPA 框架来实现。但由于 Web App 内可以局部地渲染任何一块内容。
**页面的概念在 SPA 中就变得很模糊**，
而树状 DOM 结构确实无法映射到线性的 URL 结构（除非你打算继续破坏 REST 把数据塞到 URL 里）。
因此即使花费大力气去做，也无法实现完美的浏览位置记录。

### History API 不完备（体验不稳定）

[History API][history] 是指浏览器提供的浏览历史相关的 BOM API，
包括 pushState 方法，popstate 事件，history.state 属性等。
先不提在某些浏览器下 API 缺失的问题，在当前标准和主流浏览器如 Safari 和 Chrome 中的表现就有许多问题。
这些问题会导致非常不稳定的体验，例如前进后退无效，URL 与页面内容不对应、甚至出现交互没有响应的情况。
总之对于一个追求极致体验的 Web App 来讲是无法接受的。下面罗列一些笔者遇到过的：

* [同步渲染的页面资源][static-render] 加载会延迟 popstate 事件。这使得页面未加载完时可以通过 pushState 点出但无法返回。
* [PopStateEvent.state][popstate-event] 总是等于 `history.state`。因此当 popstate 事件发生时，谁都无法获取被 pop 出的 state，这让 state 几乎不可用。
* popstate 事件处理函数中无法区分是前进还是后退。考虑刷新页面的场景不能只存储为变量，只能存储在 [`sessionStorage`][local-store] 中，但这是同步调用会增加路由的延迟，而且需要维护配额不是一个简单可靠的方案。
* 有些高端浏览器（比如某些华为内置浏览器）`history.state`，但支持 pushState 和 popstate。
* iOS 下所有浏览器中，设置 [scrollRestoration][sr] 为 `manual` 会使得手势返回时页面卡 1s，这让恢复浏览位置也不存在简单可靠的方案。
* 没有 URL 变化事件。在 pushState/replaceState 时不会触发 popstate 事件。因此没有统一的 URL 变化事件，通常需要一个路由工具来包装这些不一致。
* 手势前进/返回的行为在标准中没有定义。这意味着有些浏览器会做动画，有些不会。因为这些动画没有定义任何 API 所以 SPA 框架接管页面切换动画无法保证一致的体验。

### Referer 的语义不再是来源（日志错误）

在 Web 时代，[Referer HTTP Header][referer] 用来标识一个请求的来源，主要用于日志、统计和缓存优化。
典型的 SPA 框架会破坏 Referer 的语义。

SPA 中页面跳转分两种情况：一种是用户与 DOM 交互由脚本 [pushState][pushState] 来改变 URL；
另一种是用户与浏览器交互比如前进后退按钮或手势，此时浏览器触发 [popstate 事件][popstate] 来通知脚本。
对于后一种情况，popstate 事件发生时页面 URL 已经发生变化，此时才会通知到 SPA 框架载入下一页内容。
因此这时发出的请求 Referer 头的值一定 **是当前页的 URL 而不是来源页的 URL**。

## PWA 带来的机会

还不了解 PWA 的同学建议先去阅读笔者在 2017 年给的调研：
[PWA 初探：基本特性与标准现状](https://harttle.land/2017/01/28/pwa-explore.html)，
除了目前 PWA 已经得到 [所有主流浏览器][sw-ready] 的支持外，其他内容仍然有效。
此外 [Harttle Land](https://harttle.land) 也在年初支持了 PWA，你现在就可以把它添加到桌面，或添加到主屏，
也可以离线浏览（比如现在切断网络，刷新本页面）。

PWA 一词出自 Alex Russell 的 [Progressive Web Apps: Escaping Tabs Without Losing Our Soul][pwa]，
从这篇文章标题也可以看到 PWA 的精髓：在实现 App 体验的同时不丢失 Web 架构的优势。
因此可以规避上述 SPA 的问题，同时能够充分发挥 Web 的优势。

### 渐进式改善

Progressive 是指 PWA 的构建过程。构成 PWA 的标准都来自 Web 技术，
它们都是浏览器提供的、向下兼容的、没有额外运行时代价的技术。
因此可以把任何现有的框架开发的 Web 页面改造成 PWA，而且与 SPA 方案不同，
没有强组件化机制，因此不需要一把重构可以逐步地迁移和改善。

### 性能的提升

PWA 对性能的提升主要靠 [Service Worker][sw]，它是在传统的 Client 和 Server 之间新增的一层。
性能提升程度取决于这一层的具体策略。例如：

1. 如果使用缓存优先策略。加载时间必然明显更短。但用户可能看到过时的内容。
2. 如果使用网络优先策略。加载时间必然更长，因为增加了额外的缓存查询时间。

当然还可以应用 Race 策略，总之性能如何取决于我们怎样控制。
PWA 使得我们有机会来定制这个策略，当然是值得探索的。

### 体验的增强

PWA 方案更接近于 Web 的方式，它是 Web 的增强而不是替代。
因此 Web 应该有的交互体验会得到保证，此外 PWA 还提供了一些 App 方面的增强。
具体地，相比于 SPA，PWA 可达到的体验效果主要表现在：

* 稳定的交互反馈。页面切换直接由浏览器托管，这就可以避免使用 history API，尤其是前进后退等涉及浏览历史栈的操作会更加稳定，交互反馈也更加可预期。
* 离线可用。这或许是 PWA 最明显的体验优势，可以明显提升媒体时长和交互次数。
* 设备集成度更好。PWA 有一些新的浏览器能力，比如添加到桌面、推送通知等，是 SPA 所不具有的。
* 页面浏览位置。相比 SPA 省去了庞大的实现代码，但浏览位置保持却更稳定、更健壮。

PWA 的不足之处在于无法托管页面切换，这一交互必须由浏览器实现。
PWA 对速度的收益也需要额外说明：
如果既有系统可能已经做过更激进的优化（例如此前已经做过资源打包或本地存储），

* PWA 方案对加载时间可能并没有提升，但对于 [TTI][tti] 和真实用户的感受应当有可感知的提升。因为 PWA 更接近浏览器容易理解的原始 Web 页面，因此可以更好地利用浏览器优化，比如 HTTP 缓存、文件为单位的编译缓存等。
* 另一方面 PWA 方案的架构更简单和解耦。长期来看页面倾向于比 SPA 体积更小，加载更快速。这方面建议多从架构的长期演化上考虑，见下一节的讨论。

### 架构上的优势

笔者更看好 PWA 是因为它在架构上的优势，这对软件的迭代效率和长期演化都有好处。
选择好的架构可能没有立竿见影的收益，但是却会有利于软件的演化和团队的发展，反过来也能更好地支持业务需求。

1. 独立部署和演化

    PWA 方案不要求页面组件之间存在引用关系，甚至不要求页面之间有相同的组件抽象。
    这意味着**页面之间是解耦的**。

    因此服务/页面仍然可以独立部署和演化，不同的页面仍然可以选择适合自身业务的技术栈去开发。
    不仅可以减轻团队管理的复杂度，也有利于各业务线的迭代效率。

2. 业务开发更加轻量

    为了应付日渐庞大的 Web 页面，经过优化的 JavaScript 引擎已经可以和一些编译语言的速度相提并论。但[今天的 Web 页面脚本都大的离谱][less-js]，庞大的脚本不仅会影响加载速度，过度依赖脚本还会让页面的可访问性变得很差，交互也变得不可预期。

    采用 PWA 方案有利于减小页面体积，提升页面的加载性能。
比如省去了庞大的 SPA 框架，更重要的是**页面的解耦让页面开发更加轻量**。

3. 更多可能性

    Service Worker 使得除了客户端、服务器、中间代理之外，还可以存在一层定制的策略。
    Service Worker 可以用于性能优化，甚至实现客户端容灾。
    **这是 Web 体系结构上新的架构元素，可能大有所为**。

4. 架构更加简单

    对架构而言，简单性是稳定性的前提。充分利用浏览器和已有 Web 架构，能够让前端更加简单。

    * 不去托管资源加载，把它完全交给浏览器，请求 Referer 也就自然不会错了。
    * 不去操作浏览历史，把页面切换交互交给浏览器，不仅页面间可以解耦，交互效果也更稳定。

    获取简单性的关键在于不要和浏览器对着干，而是着力于改进浏览器。
    使用 Web 的方式解决问题，就仍然走在 Web 的道路上，就不会损失 Web 应有的体验和架构优势。

### 参与标准建设

对一个大型网站来讲，无论是业界的 SPA 方案还是 PWA 系列技术，都会存在不足和缺陷。
重要的是这二者的改进方式完全不同：

* 改进 SPA 方案往往意味着在 Web 前端（即浏览器端）建设更复杂的抽象和全站统一的组件化；
* 改进 PWA 方案则意味着从浏览器端入手，通过与端的协作来解决问题，同时保持 Web 前端架构的简单。

前端与浏览器端的协作在业界已经有很完善的实践方式，
包括兴趣收集、准入和评审等环节都有[现成的方法][w3c-process]。
Web 前端和私有平台（自有端）的协作也应当采用这样的方式。
不仅可以通过与标准化组织的协作来维持架构的先进性，也可以通过紧密的社区协作来确保技术的包容性，
这样自有端才能有自己的技术生态，也更容易融入标准的迭代。这也是私有平台技术影响力的一个来源。

## 结论和建议

我们想要的只是一个快速的、流畅的、功能丰富的 Web App。
SPA 方案和 PWA 方案的区别在于解决问题的方式。

* SPA 的思路是封装一切，让开发者面向框架而非 Web 本身。架构足够复杂以至于没有明显的问题。
* PWA 是网页的渐进增强，技术上是中立的让开发者仍然面对 Web。架构足够简单以至于明显没有问题。

SPA 的复杂性在于业务之间因为框架技术（尤其是组件化）而产生耦合，
技术栈深而且封闭，重 JavaScript 的页面可访问性和稳定性也会变差，
而且 JavaScript 框架替代浏览器托管页面加载这样新的交互方式，
也会在用户交互、日志统计等方面产生误差和麻烦。
与此相反，PWA 概念涉及的技术是 Web 标准迭代的产物，
不强制任何组件模块框架，可以在任何已有 Web 页面上渐进增强，
也允许不同的业务可以独立迭代，因此更容易产出体积小的、加载速度快的页面。
同时新的 Service Worker 技术也使 Web 架构有更多的技术可能。

因此对于大型 Web App 建议先上 PWA 方案。
因为 PWA 是 Web 标准的一部分，是 JavaScript 框架中立的，
不强制任何组件化方案也没有引入额外的架构约束，
因此不会给后续架构迭代造成负担。
如果拥有自有端，大可按照 Web 标准的方式去迭代。
以 Web 方式提供的 API 也更加便于参与 W3C 标准，可以保持不落后于社区。

## 参考文献

以下是本文参考和引用的资源，感谢 MDN、Infreqently Noted、W3C、Wikipedia、React、Vue、HarttleLand 等。

* <https://calibreapp.com/blog/time-to-interactive/>
* <https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration>
* <https://harttle.land/2016/11/26/static-dom-render-blocking.html>
* <https://harttle.land/2016/11/26/static-dom-render-blocking.html>
* <https://harttle.land/2016/11/26/dynamic-dom-render-blocking.html>
* <https://harttle.land/2017/01/16/dynamic-script-insertion.html>
* <https://angular.io/api/core/NgModule>
* <https://angular.io>
* <https://reactjs.org/docs/react-component.html>
* <https://harttle.land/2016/11/26/static-dom-render-blocking.html>
* <https://zh.wikipedia.org/wiki/%E5%8D%95%E9%A1%B5%E5%BA%94%E7%94%A8>
* <https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState>
* <https://developer.mozilla.org/zh-CN/docs/Web/Events/popstate>
* <https://developer.mozilla.org/zh-CN/docs/Web/API/PopStateEvent>
* <https://harttle.land/2015/08/16/localstorage-sessionstorage-cookie.html>
* <https://harttle.land/2017/01/28/pwa-explore.html>
* <https://reactjs.org/>
* <https://cn.vuejs.org/index.html>
* <https://vuex.vuejs.org/zh/guide/>
* <https://redux.js.org/api/store>
* <https://router.vuejs.org/zh/>
* <https://harttle.land/2017/04/09/service-worker-now.html>
* <https://harttle.land/2017/12/24/launch-app-from-browser.html>
* <https://harttle.land/2016/12/30/cors-preflight.html>
* <https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty>
* <https://developer.mozilla.org/zh-CN/docs/Web/API/History>
* <https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy>
* <https://en.wikipedia.org/wiki/Fragment_identifier>
* <https://medium.com/@baphemot/whats-server-side-rendering-and-do-i-need-it-cb42dc059b38>
* <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer>
* <https://jakearchibald.github.io/isserviceworkerready/>
* <https://infrequently.org/2015/06/progressive-apps-escaping-tabs-without-losing-our-soul/>
* <https://infrequently.org/2017/10/can-you-afford-it-real-world-web-performance-budgets/>
* <https://www.w3.org/2019/Process-20190301/#Reports>
* <https://developer.mozilla.org/zh-CN/docs/Web/Guide/AJAX>
* <https://harttle.land/2019/03/14/the-developer-experience-bait-and-switch-zh.html>

[sr]: https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
[dynamic-script]: https://harttle.land/2017/01/16/dynamic-script-insertion.html
[pwa]: https://infrequently.org/2015/06/progressive-apps-escaping-tabs-without-losing-our-soul/
[less-js]: https://infrequently.org/2017/10/can-you-afford-it-real-world-web-performance-budgets/
[ng-module]: https://angular.io/api/core/NgModule
[ng]: https://angular.io
[comp]: https://reactjs.org/docs/react-component.html
[static-render]: https://harttle.land/2016/11/26/static-dom-render-blocking.html
[pushState]: https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState
[popstate]: https://developer.mozilla.org/zh-CN/docs/Web/Events/popstate
[popstate-event]: https://developer.mozilla.org/zh-CN/docs/Web/API/PopStateEvent
[local-store]: https://harttle.land/2015/08/16/localstorage-sessionstorage-cookie.html
[pwa]: https://harttle.land/2017/01/28/pwa-explore.html
[react]: https://reactjs.org/
[vue]: https://cn.vuejs.org/index.html
[vuex]: https://vuex.vuejs.org/zh/guide/
[redux]: https://redux.js.org/api/store
[vue-router]: https://router.vuejs.org/zh/
[sw]: https://harttle.land/2017/04/09/service-worker-now.html
[deep-link]: https://harttle.land/2017/12/24/launch-app-from-browser.html
[cors-preflight]: https://harttle.land/2016/12/30/cors-preflight.html
[same-origin]: https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy
[id]: https://en.wikipedia.org/wiki/Fragment_identifier
[ssr]: https://medium.com/@baphemot/whats-server-side-rendering-and-do-i-need-it-cb42dc059b38
[referer]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer
[sw-ready]: https://jakearchibald.github.io/isserviceworkerready/
[w3c-process]: https://www.w3.org/2019/Process-20190301/#Reports
[tti]: https://calibreapp.com/blog/time-to-interactive/
[static-render]: https://harttle.land/2016/11/26/static-dom-render-blocking.html
[sync]: https://harttle.land/2016/11/26/static-dom-render-blocking.html
[async]: https://harttle.land/2016/11/26/dynamic-dom-render-blocking.html
[ajax]: https://developer.mozilla.org/zh-CN/docs/Web/Guide/AJAX
[spa]: https://zh.wikipedia.org/wiki/%E5%8D%95%E9%A1%B5%E5%BA%94%E7%94%A8
[defineProperty]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
[history]: https://developer.mozilla.org/zh-CN/docs/Web/API/History
[dev-exp]: https://harttle.land/2019/03/14/the-developer-experience-bait-and-switch-zh.html
