---
title: ES5 属性管理：defineProperty, preventExtensions, seal, freeze
tags: JavaScript 封装 defineProperty
---

ES5定义的[Object.defineProperty()][mdn-defineproperty]方法提供了面向对象实现中
『属性』的概念，类似于C#的属性（Property），或Java的访问器（Accessor）。
『属性』可以用来隐藏内部变量，实现写保护和读写钩子，从而加强对象封装。
ES5为此给出了一系列的对象属性管理方法，包括：`Object.defineProperty`, 
`Object.preventExtensions`, `Object.seal`, `Object.freeze`等。

# defineProperty参数

`Object.defineProperty(obj, prop, descriptor)`用于在对象`obj`上添加（或修改）
名为`prop`的属性，该方法接受三个参数：

* `obj`：需要定义属性的对象
* `prop`：属性名，字符串类型
* `descriptor`：属性描述符，对象类型。

可以通过`descriptor`可以精确地控制该属性的行为，
该描述符可以分为**数据描述符**和**存取描述符**两种。它们具有不同的属性，不可混用。

<!--more-->

数据描述符类似于强类型编程语言中的属性修饰符，这种描述符可以有下列属性：

* `value`：属性值，默认为`undefined`。
* `writable`：为`true`时才可被赋值运算符改变，默认为`false`。

存取描述符类似于其他面向对象语言中的访问器，可以有下列属性：

* `get`：读访问器，返回值即为属性的值。默认为`undefined`。
* `set`：写访问器，该方法接受一个参数作为新的值，一般会将该值保存下来一共读访问器使用。默认为`undefined`。

两种描述符都具有的属性包括：

* `configurable`：为`true`时该属性才可被配置和删除，默认为`false`。
* `enumerable`：为`true`时该属性才能出现在对象属性枚举中，默认为`false`。

# 数据描述符示例

使用`writable`属性可禁止属性的值被赋值运算符更改。

```javascript
var post = {};
Object.defineProperty(post, "author", { 
    value : 'harttle',
    writable : false 
});

console.log(post.author); // harttle
post.author = 'another';  // 只在严格模式会抛出错误
console.log(post.author); // harttle，赋值不起作用
```

如果`configurable`为`true`，该属性还是可以被`Object.defineProperty()`更改的：

```javascript
var post = {};
Object.defineProperty(post, "author", { 
    value : 'harttle',
    writable : false,
    configurable: true
});
Object.defineProperty(post, "author", { 
    value : 'another',
});

post.author = 'another';
console.log(post.author); // another
```

> `enumerable`定义了对象属性是否可被枚举。值为`false`时，`for...in`将不会遍历到该属性。

# 存取描述符示例

该示例来自[MDN][mdn-get-set]：

```javascript
function Archiver() {
  var temperature = null;
  var archive = [];

  Object.defineProperty(this, 'temperature', {
    get: function() {
      console.log('get!');
      return temperature;
    },
    set: function(value) {
      temperature = value;
      archive.push({ val: temperature });
    }
  });

  this.getArchive = function() { return archive; };
}

var arc = new Archiver();
arc.temperature; // 'get!'
arc.temperature = 11;
arc.temperature = 13;
arc.getArchive(); // [{ val: 11 }, { val: 13 }]
```

# 禁止属性扩展

有些情况下我们希望禁止客户通过`defineProperty()`进行属性扩展，
ES5提供了三级的限制：

* `Object.preventExtensions(obj)`: 禁止新的属性被添加到`obj`中，直接的属性赋值也会失效。可通过`Object.isExtensible(obj)`来检查。
* `Object.seal(obj)`: 同上，属性也将不可被删除。等效于为所有属性设置`configurable: false`。可通过`Object.isSealed(obj)`来检查。
* `Object.freeze(obj)`: 同上，属性也将不可被改变。等效于为所有属性设置`writable: false`。可通过`Object.isFrozen(obj)`来检查。

> 注意上述三个方法都是浅的（Shallow），即对象属性的`isExtensible`, `isSealed`, `isFrozen`不会发生变化。

# 参考阅读

* MDN-defineProperty: <https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty>
* MDN-seal: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal>
* MDN-freeze: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze>
* MDN-preventExtensions: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions>
* StackOverflow: <http://stackoverflow.com/questions/18524652/how-to-use-javascript-object-defineproperty>

[mdn-defineproperty]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Internet_Explorer_8_具体案例
[mdn-get-set]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#一般的_Setters_和_Getters
[mdn-freeze]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
[mdn-seal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal
[mdn-preventextensions]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions
