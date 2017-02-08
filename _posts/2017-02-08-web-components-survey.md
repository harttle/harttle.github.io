---
title: Web Components 可用性调研
tags: ShadowDom CustomElement 兼容性 模块化 组件化
---

Web 开放的本质在某种程度上导致其在面向对象、软件工程方面的改进进展缓慢，
而 Web Component 正在尝试将**基于组件的软件开发方法**应用到 Web 前端的开发中。
使我们可以创建可复用的 UI 组件，并以组件化的方式进行 Web 开发。
Web Components 是一系列 Web 技术的集合，主要包括 Shadow DOM、
CSS Scoping/Encapsulation、 HTML Import、 HTML Template。
这些技术标准大多处于草案阶段，下文中会给出具体的兼容性现状，
以及现有的一些替代方案。

在 Github 等社区和绝大多数互联网公司，从未停止过对前端组件化的尝试。
这些尝试产生了大量的各式各样的组件化技术，它们在解决的问题粒度、
提倡的架构设计、编译和处理的时机等方面各有不同：

* 从预编译时进行处理的 ES6 模块，到运行时异步加载的 AMD 模块；
* 从简单的 RoR 简单的服务器端 MVC 设计，到 AngularJS/Vue.js 的前端 MVVM；
* 从 LESS 等单个语言的预编译工具，到 webpack 这样的全站打包工具。

但基于这些技术的组件化仍然依赖于规范层面的约束，无法保证彻底的组件化。
举例来说，即使是完全 AMD 化的前端组件，也无法保证它能够立即移植到其他环境中。
Web 难以组件化的原因有很多，但最为重要的几个原因是：
JavaScript 缺乏模块化标准、CSS 的全局作用域、缺乏组件解析/加载的基础设施等。

顾名思义，Web Components 的主要特性便是提供具有良好封装的、良好互操作性的 Web 组件。
除了标准统一之外，还提供了较为底层的组件化能力：组件可以有独立的 DOM、CSS 的作用域、组件引入机制。

<!--more-->

# 一个例子

在开始介绍 Web Components 相关技术之前，先来观察一个 Web Components 组件的编写和使用过程。
下面是一个 `x-message.html` 组件，其功能是显示一段红色的文字：

```html
<template id="tpl">
  <style> div{ color: red; } </style>
  <div></div>
</template>
<script>
var tpl = document.currentScript.ownerDocument.querySelector('#tpl');
var proto = Object.create(HTMLElement.prototype, {
  attachedCallback: {
    value: function() {
      var root = this.attachShadow({mode: 'open'});
      var content = document.importNode(tpl.content, true)
      content.querySelector('div').textContent = this.getAttribute('val');
      root.appendChild(content);
    }
  }
});
document.registerElement('x-message', {
  prototype: proto
});
</script>
```

利用 HMTL Import 引入组件后，
使用 `x-message` 组件（CustomElement）与使用标准 DOM 元素没有区别
（通过attribute 控制行为，通过 addEventlistener 监听变化）：

```html
<head>
  <link rel="import" href="x-message.html">
</head>
<body>
  <x-message val="Hello World"></x-message>
</body>
```

上述例子中可以观察到 `x-message` 组件完全被封装起来，引入时不需要像 jQuery 组件那样引入对应的样式和脚本；
组件内 CSS 只作用于 ShadowDOM 对使用者无副作用；CustomeElement 为组件提供了嵌入 DOM 的生命周期，随 DOM 一起解析和渲染。

# 相关标准状态

## Shadow DOM

Shadow DOM提供了独立于主文档的DOM环境，为Web Component提供了JavaScript、CSS、HTML模板的封装。

【标准】W3C Working Draft: <https://www.w3.org/TR/shadow-dom/>

【兼容性】要求Shadow DOM v1，[27.13%][caniuse-shadow]的浏览器支持，包括Chrome、Opera。

## CSS Scoping/Encapsulation

借由Shadow DOM封装的组件样式，仍未形成标准。

* 外部CSS选择符不会选中组件内元素
* 内部样式不会影响到组件外元素
* `:host`选择根元素, `:slotted`选择嵌入元素

【标准】W3C Editors' Draft: <https://drafts.csswg.org/css-scoping>

【兼容性】只在Chrome中可用。

## HTML Import

在相同的作用域引入HTML片段，可以打包CSS、JS和HTML模板。

* 相同的JavaScript作用域，包括DOM对象；相同的CSS作用域。
* `document.currentScript.ownerDocument`：当前HTML的Document对象。
* `document`：主Document对象。
* 支持递归Import：树状的依赖关系可以封装底层依赖，最小化升级成本。
* 资源管理：同一URL的HTML只被加载和执行一次，有效地解决了jQuery等插件的多次引入问题。

【标准】W3C Working Draft: <http://w3c.github.io/webcomponents/spec/imports/>

【兼容性】[45.56%][caniuse-imoprt]的浏览器支持，包括Chrome、Opera，在Firefox中可以手动开启该特性。

## HTML Template

[HTML Template][html-template]用于封装一些HTML片段，
用来取代类似`<script type="html/template">`这样的Hack。
非常适合HTML Import的使用方式。

* 内部`<script>`在使用时才被解析和加载。
* `document.importNode`：从另外一个DOM中克隆元素。
* `document.cloneNode`：从当前DOM中克隆元素。

【标准】WHATWG Living Standard: <https://html.spec.whatwg.org/multipage//scripting-1.html#the-template-element>

【兼容性】[61.68%][caniuse-template]的浏览器支持，包括Chrome、Firefox、Opera、Safari、MS Edge。

# 相关 Web Framework

目前业界通常不会直接使用 Web Component API，而是使用一个基于 Web Component 的 Web 框架来进行组件化。
由于 Web Components 相关标准的实现还不可用：

* 封装程度还不够易用：直接 HTML Import 一个 Custom Element 时脚本仍然是全局作用域。
* 存在兼容性问题：Shadow DOM、HTML Import、CSS Scoping 尚未得到普遍支持。

以下介绍几个基于Web Component的Web框架，并与非 Web Component 框架 Angular 和 React 的组件化方式进行比较。

## webcomponents.org

[webcomponents.org][webcomponents] 是一个对Web Component进行的Polyfill项目。
下文所述的Polymer即使用该项目作为Polyfill。
webcomponents.org主要提供了Opera、Firefox、IE/Edge、Safari等浏览器的兼容。

> 其Polyfill文件大小为117k（minified），压缩后34k（gzipped）。

直接使用Web Component + Polyfill创建Web组件尚不可行：

* `currentScript`、`attachShadow`等API行为仍有差异，需要根据这些差异采用不同的策略。
* 有不少的重复代码，包括：注册组件、克隆模板、创建Shadow DOM等过程。
* Web Component标准尚不完备，需要一些workarround。例如公用样式、数据绑定等。

需要一个开发框架来封装Web Component的创建过程，这样我们只关注上层逻辑。

## Polymer

<https://github.com/Polymer/polymer>

基于 Web Component API 的轻量级框架，定位于 Web Components Polyfill 和简单的封装。
提供直观的工具库来方便创建Custom HTML Elements。

> The library doesn't invent complex new abstractions and magic, but uses the best features of the web platform in straightforward ways to simply sugar the creation of custom elements.

主要特性：

* 双向绑定：可以将DOM模板中节点的内容或属性绑定到Custom Element Property，也可以绑定到指定的方法。
* [组件库][polymer-elements]: 包括布局组件、输入控件、Google产品、PUSH/蓝牙等。
* [Polyfill][webcomponents]：Custom Elements, Shadow DOM, HTML Import, 能支持绝大多数浏览器。

使用方式：

* 方法与属性：通过一个整体对象一起传递给Polymer，由Polymer来托管Custom Element的注册过程。
* `fire`事件工具：帮助触发Custom Element的DOM事件，借由`Element.dispatchEvent()`实现。

目前主要还是Google的一些周边产品在使用Polymer：<https://github.com/Polymer/polymer/wiki/Who's-using-Polymer%3F>。

相关文件大小：

```
-rw-r--r-- 1 harttle staff  34K 12  5  2015 CustomElements.js
-rw-r--r-- 1 harttle staff  17K 12  5  2015 CustomElements.min.js
-rw-r--r-- 1 harttle staff  38K 12  5  2015 HTMLImports.js
-rw-r--r-- 1 harttle staff  20K 12  5  2015 HTMLImports.min.js
-rw-r--r-- 1 harttle staff  13K 12  5  2015 MutationObserver.js
-rw-r--r-- 1 harttle staff 5.9K 12  5  2015 MutationObserver.min.js
-rw-r--r-- 1 harttle staff 156K 12  5  2015 ShadowDOM.js
-rw-r--r-- 1 harttle staff  71K 12  5  2015 ShadowDOM.min.js
-rw-r--r-- 1 harttle staff  76K 12  5  2015 webcomponents-lite.js
-rw-r--r-- 1 harttle staff  39K 12  5  2015 webcomponents-lite.min.js
-rw-r--r-- 1 harttle staff 254K 12  5  2015 webcomponents.js
-rw-r--r-- 1 harttle staff 116K 12  5  2015 webcomponents.min.js
-rw-r--r-- 1 harttle staff  17K 11 17  2015 polymer-micro.html
-rw-r--r-- 1 harttle staff  47K 11 17  2015 polymer-mini.html
-rw-r--r-- 1 harttle staff 116K 11 17  2015 polymer.html
```

`webcomponents.js` includes all of the polyfills.

`webcomponents-lite.js` includes all polyfills except for shadow DOM.

`polymer-micro.html`: Polymer micro features (bare-minimum Custom Element sugaring)

`polymer-mini.html`: Polymer mini features (template stamped into "local DOM" and tree lifecycle)

`polymer.html`: Polymer standard features (all other features: declarative data binding and event handlers, property nofication, computed properties, and experimental features)

## Aurelia

<http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/technical-benefits/5>

Aurelia是基于Web Component的Web组件化开发框架。同样适用HTML Template API，但对Custom Element进行了深度封装。
开发者不直接操作Attribute，也不直接addEventListener，而是通过数据绑定来完成所有通信。

> 数据绑定通过HTML Markup和对应的ViewModel Class来完成。

* 兼容第三方的Web Components；Aurelia组件可导出为Web Component兼容的组件。
* 多语言支持，Aurelia在ES7的基础上构建，支持包括ES5, ES6, TypeScript。
* 双向数据绑定。

## React

React组件化方案中，仍然使用自定义的HTML标签。与Web Component不同的是React中的HTML标签运行在Virtual DOM中，而非标准的浏览器环境。
包括其属性的解析、事件的分发均由React托管。React能够兼容Web Component并互相包装，但二者机制不同并未直接融合。

Note: 双向绑定在React中是不推荐的：

> LinkedStateMixin is deprecated as of React v15. The recommendation is to explicitly set the value and change handler, instead of using LinkedStateMixin.

### React与Web Component互相调用

**Web Component可以在React中使用。**但因为React有自己的模块化机制（Component），以及自己的事件系统（SyntheticEvent），
考虑到**调用方式**和**事件系统**的统一，[官方推荐][react-web-component]将web component包装为react component。

```javascript
class HelloMessage extends React.Component{
  render() {
    return <div>Hello <x-search>{this.props.name}</x-search>!</div>;
  }
}
```

**React模块也可作为Web Component使用。**只需在`attachedCallback`中调用`ReactDOM.render`。

### React Component与Web Component比较

二者都是UI组件化的方式，使得开发者可以独立地开发UI组件。这些组件共同构成整个App。
都有声明周期控制：

生命周期 | React  | CustomElement
--- | --- | ---
创建 | `constructor`, `getDefaultProps`, `getInitialState` | `constructor`
加载 | `componentWillMount`,`render`, `componentDidMount` | `connectedCallback`
更新 | `componentWillReceiveProps`, `shouldComponentUpdate`, `componentWillUpdate`, `render`, `componentDidUpdate` | `adoptedCallback`, `attributeChangedCallback`
卸载 | `componentWillUnmount` | `disconnectedCallback`

> W3C Editors' Draft 改动：`connectedCallback`与`disconnectedCallback`即原来的`attachedCallback`与`detachedCallback`。

* 托管的生命周期意味着运行时进行Component的创建、加载和移除，也为性能优化提供了余地。
* Web Component依赖于标准浏览器运行时环境，而React中的虚拟DOM则提供了跨平台的可能。

## AngularJS

AngularJS 与 Polymer 都有组件化的支持，但二者的技术定位不同，
AngularJS **用于构建 Web App**，而 Polymer **用于构建 Web Component**：

* Web Component 提供的是一个UI组件，AngularJS Module 则更加上层，例如通用服务、资源同步、页面路由等；
* Web Component 提供了 UI 样式的封装，AngularJS Module 对应于一个业务模块因此不提供 CSS 托管。

### AngularJS 1.x

AngularJS与Web Component最相似的地方应该在于Directive，用来提供一个增强的HTML标签来处理更复杂的交互。
Angular Directive, React View, Polymer Component的编写方式非常相似：提供Template和Scope，由框架完成渲染。
但Angular Directive与React View都是由框架（Angular `$render`，React `ReactDOM.render`）进行渲染控制，而Custom Element则是由浏览器直接渲染。

【Native的讨论】Angular虽然并未添加Virtual DOM一层，但仍然托管了DOM渲染。
框架上只要将DOM渲染置换为Native渲染即可支持Native，
开源社区有很多Native的JS SDK，例如NativeScript: <https://www.nativescript.org/>

### AngularJS 2

AngularJS 2更像React了...移除了Controller的概念，由Component直接渲染视图。
AngularJS 1.x中的Directive在AngularJS 2中被拆分为Component（标签）、Attribute Directive（应用在元素上的Filter）、
Structural Directive（Block渲染逻辑，类似Angular 1.x中的Block Directive）。

AngularJS 2并不基于Web Component实现，但考虑到了对Web Component的支持。
例如，可通过设置 `ViewEncapsulation.Emulated` 或 `ViewEncapsulation.Native` 来支持Shadow DOM封装。
AngularJS 2 Component 也可以很容易地转换为 Web Component。

## 支持Native的讨论

Web Component 中组件注册为 CustomElement，与 DOM 一起解析和渲染。
因此 Native 渲染 Web Component 只有一种方式：嵌入一个浏览器。
另外一种途径是，利用浏览器提供的 Native API 开发更多的 Web Component，
让 Web 拥有更多的 Native 能力。

浏览器的改动涉及漫长的标准化过程，
但 Chrome 已经在强力推进，Polymer 项目给出的 [一系列组件][polymer-elements] 中
已经出现了不少 Native 组件。比如这个蓝牙组件： 
<https://elements.polymer-project.org/elements/platinum-bluetooth>
对应的 Web Bluetooth 标准也在快速开发中： <https://webbluetoothcg.github.io/web-bluetooth/>

# 扩展阅读

## Web Component

* <https://github.com/webcomponents/webcomponentsjs>
* <https://github.com/Polymer/polymer>
* <https://elements.polymer-project.org/>
* <https://developer.mozilla.org/en-US/docs/Web/Web_Components>
* <https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements>
* <https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/template>

## Frameworks

* <https://blog.nodejitsu.com/scaling-isomorphic-javascript-code/>
* <https://github.com/xufei/blog/issues/3>
* <https://www.html5rocks.com/en/tutorials/webcomponents/imports/>
* <https://facebook.github.io/react/docs/rendering-elements.html>
* <https://facebook.github.io/react/docs/state-and-lifecycle.html>
* <https://facebook.github.io/react/docs/react-component.html>
* <https://facebook.github.io/react-native/docs/native-modules-ios.html>
* <http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/technical-benefits>

[caniuse-customelement]: http://caniuse.com/#feat=custom-elements
[react-web-component]: https://facebook.github.io/react/docs/webcomponents.html
[html-template]: https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/template
[caniuse-shadow]: http://caniuse.com/#search=shadow
[caniuse-imoprt]: http://caniuse.com/#search=import
[caniuse-template]: http://caniuse.com/#search=template
[webcomponents]: https://github.com/webcomponents/webcomponentsjs
[polymer-elements]: https://elements.polymer-project.org/
[polymer]: https://github.com/Polymer/polymer
