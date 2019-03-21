---
layout: blog
title: jQuery2.2 iframe 脚本注入的上下文 Bug
tags: DOM JavaScript jQuery 作用域 iframe
---

最近在iframe中注入脚本，发现jQuery`.append()`方法和DOM`appendChild()`方法的区别：

* DOM API`appendChild()`方法插入的`<script>`会在iframe所在上下文中运行
* [jQuery(2.2)][jquery-2.2]`.append()`方法注入的`<script>`脚本，其执行上下文总是在当前`window`

事实上，jQuery`.append()`方法对`<script>`做了特殊处理：
获取脚本内容并通过`eval()`在当前作用域下执行，同时禁用了浏览器默认的脚本调度执行。

<!--more-->

## 先看例子

设置父容器的`window.id="parent"`，在注入到iframe的脚本中把它打印出来。
如果是与父容器共享上下文则会打印出`"parent"`，否则应是`undefined`。

```javascript
window.id = 'parent';
var idocument = $('iframe').prop('contentDocument');
var injected_script = 'console.log("window.id ==", window.id)';
```

创建一个`<script>`标签，使用`document.body.appendChild()`方法插入：

```javascript
var el = idocument.createElement('script');
el.text = injected_script;
idocument.body.appendChild(el);
```

输出为：`window.id == undefined`，说明作用域是隔离的。改用jQuery`.append()`方法插入：

```javascript
var el = idocument.createElement('script');
el.text = injected_script;
$(idocument.body).append(el);
```

输出为：`window.id == parent`，显然jQuery不是单纯调用`appendChild()`，还做了别的处理。
下面来看jQuery源码。

## 禁用脚本标签

在Github可访问jQuery源码，看这个文件：[manipulation.js][manipulation.js]。
在真正插入`<script>`标签之前，先进入`domManip`方法。
获取所有`<script>`脚本，并通过`disableScript`函数禁用它们。

```javascript
function domManip( collection, args, callback, ignored )
    // ...
    if ( first || ignored ) {
        scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
        hasScripts = scripts.length;
        // ...
    callback.call( collection[ i ], node, i );
```

`disableScript`如果做到禁用脚本的呢？请看：

```javascript
function disableScript( elem ) {
    elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
    return elem;
}
```

对于设置了`type="text/javascript`的脚本，其`type`被重写为
`type = "true/text/javascript"`；对于未设置`type`的脚本，其`type`被重写为`false/`。
总之，浏览器不再把该标签识别为页面脚本，从而禁止了浏览器对`<script>`的调度执行。

## DOM 节点插入

接下来从`domManip`的`callback`才真正进入`.append()`方法。
可以看到`.append()`是通过DOM API`appendChild`来实现的。
这时`<script>`的`type`已经被重写了，浏览器在插入`elem`的时候不会自动执行该脚本。

```javascript
jQuery.fn.extend( {
    // ...
    append: function() {
        return domManip( this, arguments, function( elem ) {
            if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
                var target = manipulationTarget( this, elem );
                target.appendChild( elem );
            }
        } );
    },
```

## eval 脚本执行

`callback`返回后再次回到`doManip`函数中，调用`DOMEval`来执行脚本内容。

```javascript
function domManip( collection, args, callback, ignored ) {
    // ...
    callback.call( collection[ i ], node, i );
    // ...
    if ( node.src ) {
        if ( jQuery._evalUrl ) {
            jQuery._evalUrl( node.src );
        }
    } else {
        jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
    }
```

`jQuery.globalEval()`最终调用了JavaScript`eval`来执行脚本，
所以脚本上下文在jQuery所在的`window`里。源码：[core.js][core.js]

```javascript
jQuery.extend( {
    // ...
    globalEval: function( code ) {
        var script, indirect = eval;
        code = jQuery.trim( code );
        if ( code ) {
            if ( code.indexOf( "use strict" ) === 1 ) {
                script = document.createElement( "script" );
                script.text = code;
                document.head.appendChild( script ).parentNode.removeChild( script );
            } else {
                indirect( code );
            }
        }
    },
```

在jQuery最新的[master][master/manipulation.js]分支中，上下文的问题已经被[修正][commit]了。
`domManip()`方法中最后会调用[DOMEval][master/DOMEval.js]而不是`globalEval`，
同时`globalEval`也被实现为`domEval`了（见[master/core.js][master/core.js]），
不再使用JavaScript`eval()`。

```javascript
// manipulation.js
DOMEval( node.textContent.replace( rcleanScript, "" ), doc );
// core.js
globalEval: function( code ) {
    DOMEval( code );
}
```

[manipulation.js]: https://github.com/jquery/jquery/blob/2.2-stable/src/manipulation.js
[core.js]: https://github.com/jquery/jquery/blob/2.2-stable/src/core.js
[jquery-2.2]: https://github.com/jquery/jquery/tree/2.2-stable
[jquery-master]: https://github.com/jquery/jquery
[master/manipulation.js]: https://github.com/jquery/jquery/blob/master/src/manipulation.js
[master/DOMEval.js]: https://github.com/jquery/jquery/blob/master/src/core/DOMEval.js
[master/core.js]: https://github.com/jquery/jquery/blob/master/src/core.js
[commit]: https://github.com/jquery/jquery/commit/6680c1b29ea79bf33ac6bd31578755c7c514ed3e

