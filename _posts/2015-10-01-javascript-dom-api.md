---
title: 原生 JavaScript 的 DOM 操作汇总
tags: JavaScript DOM HTML jQuery innerHTML
---

经常有人讲在 IDE 中写 C#、Java 会越来越手残，那么经常用 jQuery 也会让我们忘记 JavaScript 是如何操作 DOM 的。
JavaScript的DOM操作也是面试中的常见问题，尤其是当你需要回答jQuery的性能问题时，便需要再次回到JavaScript DOM API。
本文便总结一下常见的 JavaScript DOM 操作方法，关于 JavaScript DOM 事件可以参考另一篇文章：[DOM Level 2 Event 与 jQuery 源码：捕获与冒泡][js-event]

<!--more-->

# 什么是DOM？

外行看来前端工程师的工作就是改页面（HTML、CSS），写脚本（JavaScript）。当你意识到你不是在改HTML而是在操作DOM时，你就升级了！
那么什么是DOM？

> MDN: [文档对象模型 (DOM)][dom] 是HTML和XML文档的编程接口。它提供了对文档的结构化的表述，并定义了一种方式可以使从程序中对该结构进行访问，从而改变文档的结构，样式和内容。DOM 将文档解析为一个由节点和对象（包含属性和方法的对象）组成的结构集合。简言之，它会将web页面和脚本或程序语言连接起来。

**说白了DOM就是浏览器为JavaScript提供的一系列接口（通过`window.documnet`提供的），通过这些接口我们可以操作web页面。**
但DOM并不是编程语言，它是文档对象的模型，该模型是独立于编程语言的。比如我们在Python中也可以操作DOM：

```python
import xml.dom.minidom as m
doc = m.parse("C:\\Projects\\Py\\chap1.xml");
doc.nodeName # DOM property of document object;
p_list = doc.getElementsByTagName("para");
```

所以Web前端常讲的DOM API (web 或 XML 页面) = DOM + JS (脚本语言)

# DOM 创建

**DOM节点（Node）**通常对应于一个标签，一个文本，或者一个HTML属性。DOM节点有一个`nodeType`属性用来表示当前元素的类型，它是一个整数：

1. Element，元素
2. Attribute，属性
3. Text，文本

DOM节点创建最常用的便是[document.createElement][create]和`document.createTextNode`方法：

```javascript
var el1 = document.createElement('div');
var el2 = document.createElement('input');
var node = document.createTextNode('hello world!');
```

# DOM 查询

元素查询的API返回的的结果是DOM节点或者DOM节点的列表。`document`提供了两种Query方法：

```javascript
// 返回当前文档中第一个类名为 "myclass" 的元素
var el = document.querySelector(".myclass");

// 返回一个文档中所有的class为"note"或者 "alert"的div元素
var els = document.querySelectorAll("div.note, div.alert");

// 获取元素
var el = document.getElementById('xxx');
var els = document.getElementsByClassName('highlight');
var els = document.getElementsByTagName('td');
```

Element也提供了很多相对于元素的DOM导航方法：

```javascript
// 获取父元素、父节点
var parent = ele.parentElement;
var parent = ele.parentNode;

// 获取子节点，子节点可以是任何一种节点，可以通过nodeType来判断
var nodes = ele.children;    

// 查询子元素
var els = ele.getElementsByTagName('td');
var els = ele.getElementsByClassName('highlight');

// 当前元素的第一个/最后一个子元素节点
var el = ele.firstElementChild;
var el = ele.lastElementChild;

// 下一个/上一个兄弟元素节点
var el = ele.nextElementSibling;
var el = ele.previousElementSibling;
```

# DOM 更改

```javascript
// 添加、删除子元素
ele.appendChild(el);
ele.removeChild(el);

// 替换子元素
ele.replaceChild(el1, el2);

// 插入子元素
parentElement.insertBefore(newElement, referenceElement);
```

# 属性操作

```javascript
// 获取一个{name, value}的数组
var attrs = el.attributes;

// 获取、设置属性
var c = el.getAttribute('class');
el.setAttribute('class', 'highlight');

// 判断、移除属性
el.hasAttribute('class');
el.removeAttribute('class');

// 是否有属性设置
el.hasAttributes();     
```

# 常见的面试问题

## innerHTML与outerHTML的区别？

DOM元素的`innerHTML`, `outerHTML`, `innerText`, `outerText`属性的区别也经常被面试官问到，
比如对于这样一个HTML元素：`<div>content<br/></div>`。

* `innerHTML`：内部HTML，`content<br/>`；
* `outerHTML`：外部HTML，`<div>content<br/></div>`；
* `innerText`：内部文本，`content `；
* `outerText`：内部文本，`content `；

上述四个属性不仅可以读取，还可以赋值。`outerText`和`innerText`的区别在于`outerText`赋值时会把标签一起赋值掉，另外`xxText`赋值时HTML特殊字符会被转义。
下图来源于：http://walsh.iteye.com/blog/261966

![DOM content](/assets/img/blog/javascript/dom-content.gif)

## jQuery的html()与innerHTML的区别？

jQuery的`.html()`会调用`.innerHTML`来操作，但同时也会`catch`异常，然后用`.empty()`, `.append()`来重新操作。
这是因为IE8中有些元素的`.innerHTML`是只读的。见：http://stackoverflow.com/questions/3563107/jquery-html-vs-innerhtml


[js-event]: /2015/07/31/javascript-event.html
[dom]: https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model/Introduction
[create]: http://www.w3school.com.cn/xmldom/met_document_createelement.asp
