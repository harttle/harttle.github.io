---
title: Web Components 可用性调研
tags: ShadowDom CustomElement 兼容性 模块化 组件化
---

Web Components 是 WHATWG 和 W3C 正在尝试的 Web 组件化方案，为组件化的 Web 前端开发提供浏览器级别的支持。

Web Components 是一系列 Web 技术的集合，主要包括
Shadow DOM、Custom Elements、HTML Import、HTML Template。
这些技术标准大多处于草案阶段，下文中会给出具体的兼容性现状，
以及现有的一些替代方案。

<!--more-->

开源社区和互联网公司从未停止过对前端组件化的尝试。
这些尝试产生了大量的各式各样的组件化技术，它们在解决的问题粒度、
提倡的架构设计、编译和处理的时机等方面各有不同：

* 从预编译时进行处理的 ES6 模块，到运行时异步加载的 AMD 模块；
* 从简单的 RoR 简单的服务器端 MVC 设计，到 AngularJS/Vue.js 的前端 MVVM；
* 从 LESS 等单个语言的预编译工具，到 webpack 这样的全站打包工具。

但这些组件化方案多少都依赖于规范层面的约束，无法做到技术上完备的组件化。
具体地，使用 AMD 规范我们只能约束模块化的代码组织形式，却无法保证它不造成全局副作用。Web 难以组件化的原因有很多，笔者认为最重要的几个原因是：

* 缺乏 JavaScript 模块化标准
* CSS 的全局作用域
* 全局 DOM 和 Window 的设计

Web Components 系列技术就是意图原生地支持 Web 组件化。
在开始介绍 Web Components 相关技术之前，先来观察一个 Web Components 组件的编写和使用过程。

# 一个例子

下面是一个 `x-message.html` 组件，其功能是显示一段红色的文字：

```html
<template id="tpl">
  <style> div{ background: yellow; } </style>
  <div><slot name="text">No Text</slot></div>
</template>
<script>
class XMessage extends HTMLElement {
  constructor() {
    super();
    var root = this.attachShadow({mode: 'open'});
    var tpl = document.currentScript.ownerDocument.querySelector('#tpl');
    var content = document.importNode(tpl.content, true)
    content.querySelector('div').style.color = this.getAttribute('color');
    root.appendChild(content);
  }
}
customElements.define('x-message', XMessage);
</script>
```

这段代码定义了一个名为 `x-message` 的 Web 组件，使用方引入该 HTML 即可使用：

```html
<head>
  <link rel="import" href="x-message.html">
</head>
<body>
  <x-message color="red">
    <span slot="text">Hello World</span>
  </x-message>
</body>
```

上述例子中可以观察到 `x-message` 组件完全被封装起来，引入时不需要像 jQuery 组件那样引入对应的样式和脚本；
组件内 CSS 只作用于 ShadowDOM 对使用者无副作用；Custom Element API 为组件提供了嵌入 DOM 的生命周期，随 DOM 一起解析和渲染。
上述例子的渲染结果如下图：

![web-component-demo](/assets/img/blog/web-components/example.png)

# 相关标准

## Custom Elements

[Custom Elements][custom-elements] 给了开发者创建自己的 HTML 元素的能力。
相比于 jQuery 等工具创建的 DOM 元素，Custom Elements 的解析和渲染由浏览器原生支持。
这些元素通过标准的 DOM API 提供接口，可以表达更清晰的语义（比如 customized built-in elements）。
这使得 Web Components 有更好的可访问性和互操作性，对屏幕阅读器和搜索引擎更为友好。

【标准】[WHATWG Living Standard][spec-custom-elements]

创建一个继承自 `HTMLElement` 的类即可声明一个 Custom Element。
通过 `CustomElements.define()` 来把这个元素类注册为 HTML 标签。
回顾一下定义和使用 Custom Element 的方式，下面的代码定义了一个 `x-message` 标签，并使用了它：

```html
<html>
  <body>
    <x-message text="Hello World"></x-message>
    <script>
    class XMessage extends HTMLElement {
      constructor() {
        super();
        var shadow = this.attachShadow({mode: 'open'});
        this.text = document.createElement('span');
        this.text.textContent = this.getAttribute('text');
        shadow.appendChild(this.text);
      }
    }
    customElements.define('x-message', XMessage);
    </script>
  </body>
</html>
```

除了 `constructor()` 之外，Custom Elements 还可以定义生命周期方法，包括：

* `connectedCallback()`：插入到 DOM 时回调。
* `disconnectedCallback()`：移出 DOM 时回调。
* `attributeChangedCallback(attributeName, oldValue, newValue, namespace)`：属性改变回调。
* `adoptedCallback(oldDocument, newDocument)`：移动到新的 Document 时回调。

下面我们利用 `attributeChangedCallback()` 来实现组件内容和属性的绑定，
当 `<x-message>` 的 `text` 属性发生变化时，更新 `<x-message>` 的内容。

```javascript
class XMessage extends HTMLElement {
  constructor() {
    // ...
  }
  static get observedAttributes() {return ['text']; }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'text') {
      this.text.textContent = newVal;
    }
  }
}
```

其中 `observedAttributes()` 用于指定浏览器对哪些属性进行观察，返回一个属性名数组。
在这些属性发生变化时，`attributeChangedCallback()` 就会被触发。
这时我们去更新 `<x-message>` 的内容。效果如图：

![observed-attributes](/assets/img/blog/web-components/observed-attribute.gif)

以下是 [caniuse](http://caniuse.com/#feat=custom-elements)的兼容性数据：

![caniuse-custom-elements](/assets/img/blog/web-components/caniuse-custom-elements.png)

## HTML Templates

[HTML Templates][html-template] 是指 HTML 的 `<template>` 标签，用来包含 HTML 模板。
`<template>` 的内容在页面加载时浏览器会解析，但不会进行渲染。

【标准】[WHATWG Living Standard][spec-template]

在该标签可用之前一些单页异步框架就已经在使用 `<script>` 来包含动态渲染的 HTML 模板了，
比如 `<script type="html/template">`，HTML5 为这些模板提供了标准的引入方式。

HTML Template 通常与 Custom Elements 定义在同一 HTML 中，
通过 HTML Import 机制引入到使用者的页面。
在 Custom Element 中通过 `document.importNode()` 和 `document.cloneNode()`
等 API 把模板的内容引入到使用方的 DOM：

```javascript
var tpl = document.currentScript.ownerDocument.querySelector('#tpl');
// 第二个参数为是否深拷贝，DOM4 标准中为可选参数。
var content = document.importNode(tpl.content, true)
```

它已经有不错的兼容性，以下是[caniuse](http://caniuse.com/#feat=template) 提供的兼容性数据：

![caniuse html template](/assets/img/blog/web-components/caniuse-templates.png)

## Shadow DOM

Shadow DOM 提供了独立于主文档的 DOM 环境，为 Web Components 提供了 CSS 和 HTML 的封装。

【标准】[W3C Working Draft: Shadow DOM](https://www.w3.org/TR/shadow-dom/)

Shadow DOM 为每个组件提供一个独立的 `#document` 节点，
用来封装组件自身的 DOM 和 CSS。
在前述 `x-message` 例子的构造函数中，就为组件创建了一个 Shadow DOM
并使用预定义的模板进行了填充。Shadow DOM 特性也可以独立，比如下面的例子：

```html
<html>
  <body>
    <div id="my-host"></div>
    <script>
      // 创建 shadow DOM
      var dom = document.querySelector('#my-host').attachShadow({mode:'open'});
      // 设置其 DOM 内容
      dom.innerHTML = '<p>Hello World</p>';
    </script>
  </body>
</html>
```

![](/assets/img/blog/web-components/shadow-dom.png)

除了独立的 DOM 外，Shadow DOM 还封装了组件 CSS。内外部的 CSS 不会相互影响。
并给出 `:host` 和 `:slotted` 选择符来分别表示组件根元素和槽元素。

以下是 [caniuse][caniuse-shadow] 提供的兼容性数据：

![caniuse-shadow-dom](/assets/img/blog/web-components/caniuse-shadow-dom.png)

## HTML Import

HTML Import 是 Web Components 的一种打包机制，组件打包为 HTML 后直接引入到使用方。

【标准】[W3C Working Draft: HTML Import](http://w3c.github.io/webcomponents/spec/imports/)

值得一提的是，Import 进来的 JavaScript 与当前页面脚本有同样的作用域，
CSS 也是一样。所以定义组件时要注意不可在当前作用域下产生副作用。

具体地，在被引入的组件 JavaScript 中 `document` 表示外部的 Document 对象；
`document.currentScript.ownerDocument` 表示组件所在的 Document 对象。

以下是 [caniuse][caniuse-import] 提供的兼容性数据：

![caniuse-import](/assets/img/blog/web-components/caniuse-html-imports.png)

# 相关 Polyfill

到此为止我们介绍了 Web Components 技术涉及的主要浏览器 API 和相关标准，
其中多数标准的浏览器兼容存在很大问题，甚至有些标准仍然在草案阶段。
为此，如果现在需要在生产环境使用 Web Components 技术需要考虑引入 Polyfill。

## webcomponentsjs

[webcomponentsjs](https://github.com/webcomponents/webcomponentsjs)
项目为 Web Components 标准提供了一系列的 Polyfill。
包括 Custom Elements, Shady DOM、HTML Import 等机制，`HTMLTemplateElement`, `Promise`, `CustomEvent` 等对象。

借助 webcomponentsjs，已经可以兼容 IE11+，Chrome，Firefox，Safari 9+ 等浏览器。
足以支持轻量地使用 Web Components 相关技术。
目前 Polyfill 文件（非 lite 版本）本身大小在 100k+，gzip 后可以缩小到 30k+。

在 webcomponents.org 网站上维护着当前可用的 Web Components 库：<https://www.webcomponents.org>

## Polymer

[Polymer][polymer] 项目是基于 Web Components 机制的轻量级框架，定位于简单的 Polyfill 和易用性封装。
这些封装包括数据绑定，模板声明，事件系统等，甚至包括手势事件的 API。
准确地讲 Polymer 是不属于 Polyfill，但根据官方对 Polymer 1.0 的定位：

> The library doesn't invent complex new abstractions and magic, but uses the best features of the web platform in straightforward ways to simply sugar the creation of custom elements.

Polymer 确实意图补充和完整 Web Components，而非做太多抽象。虽然 Polymer 的很多思想正在应用到标准草案中，我理解 Polymer 更像是 Web Components 的试验田。

Polymer 项目已经开发了不少的 Web 组件（尤其是 core 和 bussiness 两部分非常丰富），这些组件现在也统一维护在 [webcomponents.org][polymer-elements] 上。

# Web Components Like 框架

由于兼容性堪忧，业界大厂几乎都未能完整地使用 Web Components 方案，
多数采用 Web Components Like 的框架：既保持对 Web Components 的兼容，
又不完全使用 Web Components 机制。

以下介绍几个 Web Components Like 的 Web 开发框架。

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

## 支持 Native 的讨论

Web Component 中组件注册为 CustomElement，与 DOM 一起解析和渲染。
因此 Native 渲染 Web Component 只有一种方式：嵌入一个浏览器。
另外一种途径是，利用浏览器提供的 Native API 开发更多的 Web Component，
让 Web 拥有更多的 Native 能力。

无论是标准上还是实践上这条路已经有了很多的尝试，
比如 Polymer 项目 [组件库][polymer-elements] 中的这个蓝牙组件： 
<https://elements.polymer-project.org/elements/platinum-bluetooth>
以及对应的 Web Bluetooth 标准草案： <https://webbluetoothcg.github.io/web-bluetooth/>

# 扩展阅读

## Web Components

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
[caniuse-import]: http://caniuse.com/#search=import
[caniuse-template]: http://caniuse.com/#search=template
[webcomponents]: https://github.com/webcomponents/webcomponentsjs
[polymer-elements]: https://www.webcomponents.org/collection/Polymer/elements
[polymer]: https://github.com/Polymer/polymer
[spec-custom-elements]: https://html.spec.whatwg.org/multipage/scripting.html#custom-elements
[spec-template]: https://html.spec.whatwg.org/multipage/scripting-1.html#the-template-element
[custom-elements]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
