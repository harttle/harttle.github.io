---
title: Vue 服务器端渲染（SSR）源码分析
tags: SSR Vue
---

本文从框架开发者而非使用者的角度，学习和探讨 Vue SSR 的源码。
希望能让更多人理解 SSR 魔法的工作原理和实现思路。
因此本文不会介绍最终接口的详细参数，如 createRenderer() 的具体参数、createBundleRenderer() 的配置方法，
只聚焦在 SSR 相关代码的详细设计，介绍其中比较重要的对象、方法和流程。

如果你在找 [Vue][vue] 的使用文档，或者是否应该使用 [Vue SSR](https://ssr.vuejs.org/)，请移步 Vue 官网：<https://ssr.vuejs.org/>。

<!--more-->

## vue-server-renderer

`vue-server-renderer` 是一个维护在 [vuejs/vue 仓库][vue] 里的 NPM 包。
根据 [Vue SSR 官网](https://ssr.vuejs.org/zh/) 的说明，
使用 vue-server-renderer 这个包就可以在服务器端渲染一个 Vue App：

```javascript
const Vue = require('vue')
const app = new Vue({ template: `<div>Hello World</div>` })
const renderer = require('vue-server-renderer').createRenderer()

// 输出：<div data-server-rendered="true">Hello World</div>
renderer.renderToString(app).then(html => console.log(html))
```

这里的核心就是来自 vue-server-renderer 里的 `.renderToString()` 方法。
它的输入是一个 Vue 实例，输出是渲染得到的 html 字符串。
这个包其实提供了两个 API：

- createRenderer()：输入为 Vue App，输出为 HTML。
- createBundleRenderer()：输入为 webpack 打包后的 Vue App（以及资源清单），输出为 HTML。

后者借由前者实现但多一些功能，下一节中我们先讨论 createBundleRenderer() 多哪些功能，再深入到 createRenderer() 的细节。
下图大致描述了 vue-server-renderer 里下文会提到的对象之间的关系
（找不到合适描述 JavaScript 的图，如上类图只是示意，那些类其实是闭包和函数）：

![vue ssr class diagram](/assets/img/blog/vue/vue-ssr-class.svg)

## createBundleRenderer

createBundleRenderer() 使用起来和 createRenderer() 也基本没有区别，都返回一个 `{ renderToString, renderToStream }` 对象。
只是传入的 App 现在变成了传入 webpack bundle。
Bundle Renderer 的 `renderToString()` 会先加载并执行 Bundle，
再去调用 createRenderer() 得到的 renderToString()，流程图大概如下：

![bundleRenderer.renderToSring](/assets/img/blog/vue/bundle-renderer.svg)

因为有 webpack 给的资源清单，它能解决很多开发阶段的问题：
比如支持 source map、支持 hot reload 和资源注入。

**值得关注的的一点是 bundle 代码的执行时机**。
在 createRenderer() 中 Vue App 是创建好传递给 SSR；而 createBundleRenderer() 中传递给 SSR 的是一个 webpack bundle。
这时就有机会控制 bundle 的执行时机：

- 是每次渲染时都重新执行整个 bundle？
- 还是只执行一次 bundle，每次渲染都重复使用得到的 Vue App？

Vue 把这个 `runInNewContext` 选项留给使用者，如果你的 [代码干净][code-guide] 就把它关闭以提升性能，
否则就把它打开来确保每次渲染整个 App 的状态都是全新的。
此外还有两个不太容易注意到的重要细节：

* **懒执行 bundle**：即使是在关闭 `runInNewContext` 选项的情况下（意味着每次渲染 Vue App 都在同一个代码上下文），也会在第一次渲染时才执行 bundle。这样才能确保能够在调用渲染时捕获到错误，而不是服务一启动就崩。
* [vm.Script][runinnewcontext]：这是 Node.js 提供的一个内置模块，提供了在独立上下文中执行 JavaScript 源码字符串的方法。可以用来隔离每次渲染用到的代码上下文，只需要提供给 [vm][vm] 一个 sandbox 对象，把需要封装的 API 都放在里面。

## createRenderer

createRenderer() 用来创建一个渲染器，返回的渲染器接受 **组件** 和 **数据上下文**，返回渲染结果的 **字符串**。
支持渲染为字符串，也支持渲染为字符串流。

- `.renderToString()` 接受 Vue 组件，输出 HTML。
- `.renderToStream()` 接受 Vue 组件，输出一个 HTML 流。

如上两个 API 只是一个包装，我们先关注 `.renderToString()`（下一小节单独介绍流式渲染机制），
`.renderToString()` 的具体实现过程组合了这几个类：

* TemplateRenderer：负责整个 HTML 框架的渲染，包括资源预加载/预取之类的 [Resource Hint][html-cache]，包括 `<!--vue-ssr-outlet-->` 标记的识别。
* createRenderFunction：它返回一个 `render()` 函数，它是 Vue 组件服务器端渲染的入口。负责创建渲染上下文、组件 render 方法的 normalize、设置 `component._ssrNode`。
* RenderContext：渲染上下文里维护了 SSR 的几乎所有所有状态，包括用户数据、当前组件、缓存、模块映射等。

`render()` 会先调用组件自身的 `component._render()` 生成 VNode，
再把得到的 VNode 交给 `renderNode()` 来“递归地”渲染（其实是迭代地，详见下一小节）：

```javascript
function renderNode (node, isRoot, context) {
  if (node.isString) {
    renderStringNode$1(node, context);
  } else if (isDef(node.componentOptions)) {
    renderComponent(node, isRoot, context);
  } else if (isDef(node.tag)) {
    renderElement(node, isRoot, context);
  } else if (isTrue(node.isComment)) {
    if (isDef(node.asyncFactory)) {
      renderAsyncComponent(node, isRoot, context);
    } else {
      context.write(("<!--" + (node.text) + "-->"), context.next);
    }
  } else {
    context.write(
      node.raw ? node.text : escape(String(node.text)),
      context.next
    );
  }
}
```

上述逻辑比较直观，取决于 VNode 的不同类型，调用具体的渲染逻辑，其中发现子组件再递归到 `renderNode()`。
上文中提到的 `component._render()` 逻辑属于 Vue 运行时，维护在 [src/core/instance/render.js][render.js]。
**因此 Vue SSR 的逻辑事实上依赖于 Vue 核心**：由 Vue 核心产生 VNode，SSR 递归地把它输出为 HTML，
这是使用时 vue 和 vue-server-renderer 版本要对应的原因。

## 流式渲染

HTTP 和 HTML 是 Web 的基石，它们有个共同的特点就是支持流式传输和呈现。
我们使用 SSR 的目的也正是传输来的 HTML 不需下载完成、不需经客户端渲染就可以渐进地呈现给用户。
服务器端流式渲染可以把这一点利用到极致。

也许你注意到了 `render()` 写入 HTML 的方式是间接的，经过了一个叫做 `context.write` 的代理。这个代理是流式渲染的关键，它使得调用方可以控制它 **写入到哪里。** 下一个问题是调用方如何控制它 **写入的时机**：比如 `renderStream.read(n)` 的时候需要控制它开始渲染并不断地写满 n 个字节。

在 `RenderContext` 中维护了一个叫做 `renderStates` 的栈，以迭代的方式手动实现上一节提到的“递归”。
因此每个具体的 VNode 类型对应的渲染函数中，把自己需要“递归”进去渲染的子节点 push 到上述 `renderStates` 中。
`RenderContext` 对外提供一个 `context.next()` 方法，被调用时 pop 一个节点出来渲染。
这样就使得调用方可以 **控制写入时机**，需要多少渲染多少。

## 调用栈控制

由于 Vue SSR 内部使用回调风格来编码，`write()` 和 `renderStream.next()` 之间存在递归。
对于层级很深的模板可能会栈溢出，因此 createWriteFunction() 中存在一个栈长度的检测：

```javascript
function createWriteFunction (/*...*/) {
  var stackDepth = 0;
  // ...
    if (waitForNext !== true) {
      if (stackDepth >= MAX_STACK_DEPTH) {
        defer(function () {
          try { next(); } catch (e) {
            onError(e);
          }
        });
      } else {
        stackDepth++;
        next();
        stackDepth--;
      }
// ...
```

其中 `defer()` 是 Vue SSR 中的工具方法，默认使用 `process.nextTick()`，
fallback 到 `Promise#then()` 和 `setTimeout()`。

[runinnewcontext]: https://ssr.vuejs.org/zh/api/#runinnewcontext
[code-guide]: https://ssr.vuejs.org/zh/guide/universal.html#%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%B8%8A%E7%9A%84%E6%95%B0%E6%8D%AE%E5%93%8D%E5%BA%94
[vm]: https://nodejs.org/api/vm.html
[runinnewcontext]: https://nodejs.org/api/vm.html#vm_script_runinnewcontext_contextobject_options
[vue]: https://github.com/vuejs/vue
[html-cache]: https://harttle.land/2015/10/06/html-cache.html
[render.js]: https://github.com/vuejs/vue/blob/0948d999f2fddf9f90991956493f976273c5da1f/src/core/instance/render.js#L60-L118
