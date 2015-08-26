---
layout: blog
categories: web
title: typeof, instanceof, constructor, toString 的区别
tags: JavaScript 构造函数 继承 原型 类型检查
excerpt: 如果你要判断的是基本数据类型或JavaScript内置对象，使用toString；如果要判断的时自定义类型，请使用instanceof。
---

JavaScript基本数据类型有5种：字符串、数字、布尔、null、undefined。
用户定义的类型（object）并没有类的声明，因此继承关系只能通过构造函数和原型链来检查。
本文要解决的问题，如何检查一个变量的类型？先给结论：

**如果你要判断的是基本数据类型或JavaScript内置对象，使用`toString`；
如果要判断的时自定义类型，请使用`instanceof`**。

不同的编程语言都有自己的方式来提供类型信息，例如C#的反射、[C++的Traits][traits]，
JavaScript提供类型信息的方式更加灵活，因而也容易产生很多误用。
下面来分析常见类型检查手段的区别：typeof, instanceof, constructor, toString。

> 如果你在寻找类型转换的解决方案，而非类型检查，请移步[JavaScript类型转换][type-conv]。

<!--more-->

# typeof

[typeof][typeof] 操作符返回的是类型字符串，它的返回值有6种取值：

```javascript
typeof 3 // "number"
typeof "abc" // "string"
typeof {} // "object"
typeof true // "boolean"
typeof undefined // "undefined"
typeof function(){} // "function"
```

所有对象的`typeof`都是`"object"`，不能用于检测用户自定义类型。
比如`Date`, `RegExp`, `Array`, `DOM Element`的类型都是`"object"`：

```javascript
typeof []   // "object"
```

`typeof`还有一个知名的bug：

```javascript
typeof null     // "object"
```

`null`是基本数据类型，它的类型显然是`Null`。其实这也反映了`null`的语义，
它是一个空指针表示对象为空，而`undefined`才表示什么都没有。
总之，**typeof只能用于基本数据类型检测，对于`null`还有Bug**。

# instanceof

[instanceof][instanceof]操作符用于检查某个对象的原型链是否包含某个构造函数的`prototype`属性。例如：

```javascript
obj instanceof Widget
```

`obj`的原型链上有很多对象（成为隐式原型），比如：`obj.__proto__`, `obj.__proto__.__proto__`, ...  
如果这些对象里存在一个`p === Widget.prototype`，那么`instanceof`结果为`true`，否则为`false`。

`instanceof`是通过原型链来检查类型的，所以适用于任何"object"的类型检查。

```javascript
// 比如直接原型关系
function Animal(){ }
(new Animal) instanceof Animal     // true

// 原型链上的间接原型
function Cat(){}
Cat.prototype = new Animal
(new Cat) instanceof Animal         // true
```

`instanceof`也可以用来检测内置兑现，比如`Array`, `RegExp`, `Object`, `Function`：

```javascript
[1, 2, 3] instanceof Array // true
/abc/ instanceof RegExp // true
({}) instanceof Object // true
(function(){}) instanceof Function // true
```

`instanceof`对基本数据类型不起作用，因为基本数据类型没有原型链。

```javascript
3 instanceof Number // false
true instanceof Boolean // false
'abc' instanceof String // false
null instanceof XXX  // always false
undefined instanceof XXX  // always false
```

但你可以这样：

```javascript
new Number(3) instanceof Number // true
new Boolean(true) instanceof Boolean // true
new String('abc') instanceof String // true
```

但这时你已经知道数据类型了，类型检查已经没有意义了。

# constructor

[constructor][constructor]属性返回一个指向创建了该对象原型的函数引用。需要注意的是，该属性的值是那个函数本身。例如：

```javascript
function Animal(){}
var a = new Animal
a.constructor === Animal    // true
```

`constructor`不适合用来判断变量类型。首先因为它是一个属性，所以非常容易被伪造：

```javascript
var a = new Animal
a.constructor === Array
a.constructor === Animal    // false
```

另外`constructor`指向的是最初创建当前对象的函数，是原型链最上层的那个方法：

```javascript
function Cat(){}
Cat.prototype = new Animal

function BadCat(){}
BadCat.prototype = new Cat

(new BadCat).constructor === Animal   // true
Animal.constructor === Function       // true
```

与`instanceof`类似，`constructor`只能用于检测对象，对基本数据类型无能为力。
而且因为`constructor`是对象属性，在基本数据类型上调用会抛出`TypeError`异常：

```javascript
null.constructor         // TypeError!
undefined.constructor    // TypeError!
```

与`instanceof`不同的是，在访问基本数据类型的属性时，JavaScript会自动调用其构造函数来生成一个对象。例如：

```javascript
(3).constructor === Number // true
true.constructor === Boolean // true
'abc'.constructor === String // true
// 相当于
(new Number(3)).constructor === Number
(new Boolean(true)).constructor === Boolean
(new String('abc')).constructor === String
```

> 这种将一个值类型转换为对象引用类型的机制在其他语言中也存在，在C#中称为**装箱**（Boxing）。

# 跨窗口问题

我们知道Javascript是运行在宿主环境下的，而每个宿主环境会提供一套ECMA标准的内置对象，以及宿主对象（如`window`, `document`），一个新的窗口即是一个新的宿主环境。
不同窗口下的内置对象是不同的实例，拥有不同的内存地址。

而`instanceof`和`constructor`都是通过比较两个`Function`是否相等来进行类型判断的。
此时显然会出问题，例如：

```javascript
var iframe = document.createElement('iframe');
var iWindow = iframe.contentWindow;
document.body.appendChild(iframe);

iWindow.Array === Array         // false
// 相当于
iWindow.Array === window.Array  // false
```

因此`iWindow`中的数组`arr`原型链上是没有`window.Array`的。请看：

```javascript
iWindow.document.write('<script> var arr = [1, 2]</script>');
iWindow.arr instanceof Array            // false
iWindow.arr instanceof iWindow.Array    // true
```

# toString

`toString`方法是最为可靠的类型检测手段，它会将当前对象转换为字符串并输出。
`toString`属性定义在`Object.prototype`上，因而所有对象都拥有`toString`方法。
但`Array`, `Date`等对象会重写从`Object.prototype`继承来的`toString`，
所以最好用`Object.prototype.toString`来检测类型。

```javascript
toString = Object.prototype.toString;

toString.call(new Date);    // [object Date]
toString.call(new String);  // [object String]
toString.call(Math);        // [object Math]
toString.call(3);           // [object Number]
toString.call([]);          // [object Array]
toString.call({});          // [object Object]

// Since JavaScript 1.8.5
toString.call(undefined);   // [object Undefined]
toString.call(null);        // [object Null]
```

`toString`也不是完美的，它无法检测用户自定义类型。
因为`Object.prototype`是不知道用户会创造什么类型的，
它只能检测ECMA标准中的那些内置类型。

```javascript
toString.call(new Animal)   // [object Object]
```

因为返回值是字符串，也避免了跨窗口问题。当然IE弹窗中还是有Bug，不必管它了。
现在多少人还在用IE？多少人还在用弹窗？

和`Object.prototype.toString`类似地，`Function.prototype.toString`也有类似功能，
不过它的`this`只能是`Function`，其他类型（例如基本数据类型）都会抛出异常。

# 总结

* `typeof`只能检测基本数据类型，对于`null`还有Bug；
* `instanceof`适用于检测对象，它是基于原型链运作的；
* `constructor`指向的是最初创建者，而且容易伪造，不适合做类型判断；
* `toString`适用于ECMA内置JavaScript类型（包括基本数据类型和内置对象）的类型判断；
* 基于引用判等的类型检查都有跨窗口问题，比如`instanceof`和`constructor`。

**总之，如果你要判断的是基本数据类型或JavaScript内置对象，使用`toString`；
如果要判断的时自定义类型，请使用`instanceof`**。

有时Duck Typing的方式也非常可行，貌似已经成为了前端的惯例。
比如jQuery是这样判断一个Window的：

```javascript
isWindow: function(obj){
    return obj && typeof obj === 'object' && "setInterval" in obj;
}
```

另外DOM Element的类型检测也可以通过上述的方法来完成，但没有一种方法在任何浏览器上都可行。
DOM Element的类型检测可以参见这篇文章： http://tobyho.com/2011/01/28/checking-types-in-javascript/

[type-conv]: {% post_url 2015-08-21-js-type-conv %}
[traits]: /2015/09/15/effective-cpp-47.html
[typeof]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/typeof
[instanceof]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof
[constructor]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor
