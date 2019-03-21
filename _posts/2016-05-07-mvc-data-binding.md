---
layout: blog
title: 从MVC数据同步到AngularJS双向绑定
tags: AngularJS MVC Unix WPF 事件 数据绑定 MVVM
---

MVC恐怕是Web开发中最流行的术语，它是一种设计模式，也是软件架构风格。
MVC也成为一整个系列的设计模式，衍生品包括PAC、HMVC、MVP、MTV、MVVM等。
本文从经典MVC模式谈起，讨论MVC下数据同步策略的设计，
进一步引申出MVVM设计模式，并讨论其数据绑定的优缺点。

## MVC

**MVC**（Model-View-Controller）一词最初在1979年由Trygve Reenskaug提出（Smalltalk-79），
此后Krasner和Pope在Smalltalk-80中再次进行了描述。
最初Krasner和Pope描述的MVC设计是这样工作的：

![mvc](/assets/img/blog/angular/mvc_krasner_pope.png)

<!--more-->

* 控制器（Controller）接受用户和设备输入，向视图和模型发送控制消息。
* 模型（Model）表示领域模型，为视图和模型提供数据访问（读写）。
* 视图（View）负责显示布局和试图交互。

MVC模式中最重要的思想是**表示分离**（separated presentation），
其背后的思想是将表示业务的领域对象（domain object，相当于MVC中的Model），
与表示GUI元素的表示对象（presentation object，相当于MVC中的View）分离。
这样领域对象的运行应当可以独立于显示（Presentation），
也可以支持多个（可能是同时）显示（Presentation）。

> 表示的分离也是Unix软件的风格，例如X11的CS架构。
> 事实上，所有可以同时从GUI和命令行使用的软件都进行了表示的分离。

## 流同步

软件设计中，通常有多个屏幕（或视图）显示着同样的数据。
一个视图更改了数据时，其他视图应当得到更新。
设计上有两种方式可以实现视图间的同步：流同步和观察者同步。
其中观察者同步在MVC中可以非常方便地实现，
因为视图和模型是解耦合的，
这正是MVC设计中对视图和模型进行分离的意图所在。

**流同步**（Flow Synchronization）的思想非常简单：
在一个视图的代码中显式地对其他视图进行同步。
通俗来讲就是一个视图改变了模型，然后告诉其他所有视图需要刷新啦，
其他视图就去进行数据同步和显示刷新。

流同步对于视图较少的情况非常合适。比如父子窗口的情形：
父窗口中弹出子窗口对话框，子窗口关闭时通知父窗口进行更新。
但是当子窗口并非模态对话框（Modal）时，问题就出现了：
当用户打开了多个子窗口，在一个窗口中更新了数据，就只能一一通知其他窗口。
这导致所有窗口的代码都是紧耦合的，使用『观察者同步』来解决该问题。

## 观察者同步

**观察者同步**（Observer Synchronization）中每个视图在整个会话中充当一个观察者（Observer）的角色。
当会话中的数据更新时，这个观察者监听的事件会被触发，
视图就去重新载入会话数据以响应该事件。

观察者同步带来的结果就是控制器无需知道哪些视图需要更新。
当控制器需要改动数据时，直接更新模型即可，其他的事情交给观察者同步机制。
与此同时，不同的视图也无需知道其他的视图存在，它们都直接监听数据模型。

> 当然，观察者同步也有其缺点：自动同步机制使得Debug变得困难，难以追踪执行过程。只能通过log的形式来分析Bug。

## MVVM

到此为止，我们可以在MVC中实现模型与视图的解耦，同时采用观察者同步策略，还可以自动进行同步数据。
然而在GUI应用中，模型（Model）并不能描述软件的所有状态。
例如Web应用中：当前页面的导航状态、表单验证所处的状态，以及其他的交互相关的状态。
如果这些状态也需要视图之间（或组件之间）的同步，便只能使用**流同步**，最后产生数千行的JavaScript。

为此，AngularJS中使用**视图模板**（Viewmodel）的概念来维护视图所处的状态。
由此形成的架构风格称为**MVVM**（Model-View-ViewModel）。其中：

* Model：客户端的模型用于处理部分业务逻辑，用`$resource`服务来与服务器端Model同步。
* View：与多数Web框架一样，用模板来帮助视图渲染，AngularJS中的模板还可以在运行时去动态获取。
* ViewModel：专门用来存储视图状态，所有状态都放在`$scope`变量下面。
* Controller：用来负责ViewModel的初始化，以及根据视图的交互操作Model。

## 数据绑定

MVVM 风格的架构中，视图和视图模型之间往往会进行**数据绑定**（Data Binding），
因为视图模型就是专门为视图服务的，二者是紧耦合的，框架层面提供数据绑定一点也不奇怪。

**数据绑定**意味着自动的观察者同步机制（或某种遍历机制）会自动地应用在视图和视图模型之间。
甚至在AngularJS中存在着双向绑定，视图的变化（尤其是一些`<input>`标签）也会更新至视图模型。
数据绑定的优点非常显著，用[微软的话][ms-binding]来说：以一种简单而一致的方法来显示数据以及与数据交互。

AngularJS中的双向数据绑定是通过对`$scope`的遍历（dirty检查）实现的。
要注意这样的遍历是递归的，一旦`$scope`下的属性或方法引用了DOM元素这会造成非常严重的性能降级，
因此AngularJS的双向数据绑定受到很多批评。

事实上，数据绑定的性能问题是与生俱来的，和AngularJS的实现方式无关。
Microsoft .NET中，有一个叫做WPF（Windows Presentation Foundation）的桌面软件框架，
与AngularJS同样有着双向绑定的机制，实现`INotifyPropertyChanged`接口就可以进行数据绑定。
John Gossman在2006年的[一篇博客][mvvm-ms]中也提到了WPF中MVVM的性能问题。
> AngularJS的数据绑定机制在[AngularJS 数据绑定与 $digest 循环][angular-binding]一文中详述。

与此同时，
就像观察者同步机制一样，数据绑定同时存在着难以跟踪和调试的缺点，因为它们都会自动地进行数据（Bug）传播。
比如页面上的Bug很难定位是出在ViewModel还是View上。

## 参考资料

* Givan.se: <http://givan.se/mvc-past-present-and-future/>
* MVC - Martin Fowler: <http://martinfowler.com/eaaDev/uiArchs.html#ModelViewController>
* Observer Synchronization - Martin Fowler: <http://martinfowler.com/eaaDev/MediatedSynchronization.html>

[angular-binding]: /2015/06/06/angular-data-binding-and-digest.html
[mvvm-ms]: https://blogs.msdn.microsoft.com/johngossman/2006/03/04/advantages-and-disadvantages-of-m-v-vm/
[ms-binding]: https://msdn.microsoft.com/zh-cn/library/ms752347(v=vs.110).aspx
