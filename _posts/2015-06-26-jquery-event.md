---
title: jQuery事件：bind、delegate、on的区别
tags: AngularJS DOM HTML JavaScript jQuery 事件
---

最近在[AngularJS][ai]的开发中，遇到一个神奇的事情：我们用到[livebox][lb]来预览评论列表中的图片，
然而评论列表是由Angular Resource动态载入的。不可思议的是，点击这些动态载入的图片仍然会触发lightbox的图片预览。
难道lightbox使用先进的[MutationObserver][mo]技术监听了DOM的变化？观察[lightbox源码][lbsrc]才发现，原来只是jQuery的`.on()`方法：

```javascript
$('body').on('click', 'a[rel^=lightbox], ...', function(event){});
```

本文便来详解各种jQuery事件绑定方法：`on`，`bind`，`delegate`，`live`，`unbind`，`trigger`。
同时总结一下常用的jQuery事件技术：如何阻止事件冒泡、阻止浏览器默认行为、解绑事件处理函数、自定义事件。

# 什么是 jQuery 事件

[jQuery事件][je]是DOM事件的封装，同时支持自定义的扩展。在程序设计中，事件和代理有着相似的作用：
它们提供了一种机制，使得行为的实现方式和调用时机可以分离。

不谈jQuery，DOM本身就提供了一系列的javascript事件，例如`click`，`keyup`，`submit`。
未实现相关业务逻辑，通常会为这些事件定义一系列的处理函数，**处理函数定义了业务的实现方式，而浏览器知道这些业务的调用时机**。
Javascript事件就是这样一种机制，使得行为的实现方式和调用时机可以动态地绑定。

jQuery事件是通过封装javascript事件来实现的，例如`.keyup()`便是`onkeyup`的封装：

> `.keyup()`： Bind an event handler to the "keyup" JavaScript event, or trigger that event on an element.

除了封装大多数的javascript事件，jQuery提供了统一的事件绑定和触发机制：

* 绑定事件：`bind`、`on`、`live`、`delegate`、`keyup(<function>)`；
* 触发事件：`trigger('keyup')`、`keyup()`；
* 解绑事件：`unbind`、`off`、`die`、`undelegate`。

# 事件绑定：bind

使用javascript绑定一个事件很简单，只需要在HTML中设置`onxxx`属性，
并且在javascript中定义相关的处理函数便可以完成。

```html
<div onclick="func()"></div>
<script>
function func(){
    console.log('clicked!');
}
</script>
```

上述是基本的javascript事件处理方式，而jQuery提供了更加方便的方式：`.bind()`函数。

> `.bind()`：Attach a handler to an event for the elements.

```html
<div id='foo'></div>
<script>
$('#foo').click(function(){
    console.log('clicked!');
});
</script>
```

`.click(<function>)`等效于`.bind('click', <function>)`。另外还可以通过`unbind`来解绑事件：

```javascript
$('#foo').unbind('click');
```

> 如果`unbind`参数为空，则解绑匹配元素的所有事件处理函数。
> 在我的理解中，我们还是不要`off`，`unbind`，`die`吧。即使不谈效率，它们也使得软件更难理解了。
> 如果你感觉有需要，下面的`.on()`应该会满足你~

`.bind`将会给所有匹配的元素都绑定一次事件，当元素很多时性能会变差。
而且后来动态新增的元素不会被绑定。

<!--more-->

# 事件冒泡与默认行为

在DOM中默认情况下，事件是会冒泡的，即同样的事件会沿着DOM树逐级触发。
有时这是我们不希望的行为，可以在事件处理函数中阻止它。

```javascript
// 事件处理函数的第一个参数是一个事件对象
$('#foo').click(function(event){
    event.stopPropagation();
    // do sth.
});
```

浏览器对用户事件的默认行为是另一个需要考虑的事情，尤其是`<a>`标签的`click`事件。
当用户点击`<a>`标签时，首先调用所有的事件处理函数，然后执行默认行为：页面跳转或者定位。
同样地，我们可以阻止它：

```javascript
$('a').click(function(event){
    event.preventDefault();
    // do sth.
});
```

在实践中，我们常常让事件处理函数`return false`来阻止冒泡和默认行为，
可以认为`return false`做了三件事情：

1. `stopPropagation()`；
2. `preventDefault()`；
3. 立即结束当前函数并返回。

```javascript
$('a').click(function(event){
    // do sth.
    return false;
});
```

# 自定义事件

jQuery事件是基于DOM事件的，但jQuery提供了更加普遍的事件机制。
这使得我们可以方便地自定义事件，只需要给一个尚不存在的事件名即可：

```html
<div id='foo'></div>
<script>
$('#foo').bind('fucked', function(){
    console.log("I'm fucked.");
});
$('#foo').trigger('fucked');
</script>
```

这里定义了一个叫`fucked`的事件并绑定了处理函数，然后使用`trigger`来触发该事件。
在真实的场景中，通常用其他的事件来触发自定义事件：

```javascript
var he = 'man';
$('#foo').click(function(){
    if(he === 'man') $(this).trigger('fucked');
});
```

# Delegate

`.delegate`是另一种绑定事件的方式。它将事件处理函数绑定在指定的根元素上，
由于事件会冒泡，它用来处理指定的子元素上的事件。

> `.delegate()`：Attach a handler to one or more events for all elements that match the selector, now or in the future, based on a specific set of root elements.

```html
<div id="root">
  <a>Alice</a>
  <a>Bob</a>
</div>
<script>
$('#root').delegate('a', 'click', function(){
    console.log('clicked');
});
</script>
```

它的使用方式比`bind`稍显复杂，但它的功能非常强大：

1. 自动绑定动态添加的元素。因为事件处理函数绑定在`#root`上，新加的子元素事件也会冒泡到`#root`。
2. 性能好于`.bind()`。只绑定一个事件处理函数，绑定速度相当快。

> 如果你在使用AngularJS等动态操作DOM的工具，那么`.delegate()`将会非常实用，它能对新增的DOM元素自动绑定。

# On

事实上，`.on()`才是jQuery事件的提供者。其他的事件绑定方法都是通过`.on()`来实现的，请看jQuery1.8.2的源码：

```javascript
bind: function( types, data, fn ) {
    return this.on( types, null, data, fn );
},
unbind: function( types, fn ) {
    return this.off( types, null, fn );
},

live: function( types, data, fn ) {
    jQuery( this.context ).on( types, this.selector, data, fn );
    return this;
},
die: function( types, fn ) {
    jQuery( this.context ).off( types, this.selector || "**", fn );
    return this;
},

delegate: function( selector, types, data, fn ) {
    return this.on( types, selector, data, fn );
},
undelegate: function( selector, types, fn ) {
    return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
},
```

既然`.on`是最通用的jQuery事件机制，那么上述的所有例子都可以用`.on()`来实现：

```javascript
// bind 
$( "#foo" ).bind( "click", function( e ) {} );
$( "#foo" ).on( "click", function( e ) {} ); 

// delegate 
$( "#root" ).delegate( "a", "click", function( e ) {} );
$( "#root" ).on( "click", "a", function( e ) {} );
```

> 我们看到上面还有一个`.live()`方法，它与`delegate`是类似的，
> 不过它强制指定了`root`是`document`（即`this.context`），因而性能略差。
> 自jQuery1.7起已经不推荐使用了。参见： https://api.jquery.com/category/deprecated/deprecated-1.7/

[je]: https://api.jquery.com/category/events/
[ai]: /2015/05/31/angular-scope-initialize.html
[lb]: http://lokeshdhakar.com/projects/lightbox2/
[mo]: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
[lbsrc]: https://github.com/lokesh/lightbox2/blob/master/src/js/lightbox.js
