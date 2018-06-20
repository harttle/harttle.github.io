---
title: 设置和获取 radio input 的状态：checked, prop, attr, val
---

[Web 表单][form-tutorial] 是 HTML 文档与用户交互的重要部分，
其中的 `input[type="radio"]` 是单选框控件。
如何设置和获取 [单选控件][radio]（`input[type=radio]`）的状态还是比较繁琐的，
而且需要理解 DOM 的一些基本概念。
本文整理一下相关操作，并给出可用的代码片段。

## TL;DR

* HTML 选中可以添加 `checked` Attribute（Content Attribute）：`<input type="radio" checked>`；
* 脚本选中需要设置 `checked` Property（IDL Attribute）：`contactChoice3.checked=true`；
* 选中变化需要监听所有单选控件，处理函数中找到选中的控件，读取器 `value` 属性。

<!--more-->

# 相关概念

为啥叫 `radio`？老司机说是因为单选按钮特别像老式收音机上的按钮，按下一个时其余的就会自动弹起。
继续讨论“属性”之前我们需要明确 **Attribute** 与 **Property** 的区别。

* **Attribute** 以标准的（Normative）术语叫 Content Attribute，就是指 HTML 标记上的属性，
通过 [.setAttribute][.setAttribute] 和 [.getAttribute][.getAttribute]，
或者 jQuery 的 `.attr()` 设置和获取。
* **Property** 是指 JavaScript Property，在标准中叫 IDL Attribute。
直接通过 HTMLElement 对象的属性，或者 jQuery 的 [.prop()][.prop] 设置和获取。

通常 IDL Attribute 会反映 Content Attribute 的值，也就是说在
设置 IDL Attribute 时浏览器会更新 Content Attribute，
获取 IDL Attribute 时浏览器会解析 Content Attribute 的值并返回。
但 IDL Attribute 只表示实际生效的属性，有对默认值和非法值的处理。
例如 `input.type`（设置 IDL Attribute）后
`input.getAttribute('type')`（获取 Content Attribute）的返回值是 `"harttle"`，
但 `input.type`（获取 IDL Attribute）的值仍然是 `"text"`。

更详细的讨论可参考 [Reflecting content attributes in IDL attributes - HTML5 Living Standard](https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes)
或 [HTML Attribute - MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes)。

# 标签的使用

[radio](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio)
是 `input` 的 `type` 属性（Attribute）的一种取值，表示一个单选按钮。
同一组单选按钮具有同样的 `name` 属性（Attribute），它们只是值不相同。

下面的示例代码来自 MDN：<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio>

```html
<form>
  <p>Please select your preferred contact method:</p>
  <div>
    <input type="radio" id="contactChoice1" name="contact" value="email">
    <label for="contactChoice1">Email</label>

    <input type="radio" id="contactChoice2" name="contact" value="phone">
    <label for="contactChoice2">Phone</label>

    <input type="radio" id="contactChoice3" name="contact" value="mail">
    <label for="contactChoice3">Mail</label>
  </div>
  <div>
    <button type="submit">Submit</button>
  </div>
</form>
```

[提交表单](/2015/08/03/form-submit.html) 后它的编码格式与 `input[type=text]` 并无区别，
对于上面的例子如果选中 Mail，请求参数就是 `?contact=mail`。

# 设置选中状态

设置选中状态需要设置 `input` 元素的 `checked` 属性（Property），
同一组的（即 `name` 值相同的）`input[radio]` 都会被取消选中。

```javascript
contactChoice3.checked = true
// 如果你在使用 jQuery，下面的用法等价：
$('input[value=phone]').prop('checked', true)
```

注意 `checked` 属性（Attribute）是用于 HTML 标记的，只在 HTML 被解析时才会生效，
后续设置上去不起作用。

```javascript
<!-- 下面的设置正确，页面加载后 mail 处于选中状态 -->
<input type="radio" id="contactChoice3" name="contact" value="mail" checked="checked">
```

```javascript
// 下面的设置不正确，执行后 mail 不会选中
contactChoice3.setAttribute('checked', 'checked')
```

# 监听选中变化

用户交互和脚本逻辑都可能使当单选按钮的选中项发生变化。所以怎么监听选中变化呢？
DOM Level2 和后来的 HTML5 只在表单控件元素上提供了
[change 事件](https://html.spec.whatwg.org/multipage/indices.html#event-change)。
为了监听一组单选框的选中变化，需要监听所有 `input[type=radio]` 元素的 `change` 事件。

```javascript
document.querySelectorAll('[name=contact]').forEach(input => input.addEventListener('change', onChange))
var onChange = () => {
    var checked = document.querySelector('[name=contact]:checked')
    console.log('选中的值:', checked.value)
}
```

jQuery 中写起来更简洁一些：

```javascript
$('[name=contact]').change(function () {
    var checked = $('[name=contact]:checked')
    console.log('选中的值:', checked.val())
})
```

只有与用户发生交互的控件会发生 `change` 事件，因此单选按钮被动取消选中时不会触发 `change`。参考：<https://stackoverflow.com/questions/14347952/why-isnt-jquery-detecting-when-a-radio-button-is-unchecked>

[form-tutorial]: https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Forms
[radio]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio
[.getAttribute]: https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
[.setAttribute]: https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
[.prop]: http://api.jquery.com/prop/
