---
layout: blog
categories: reading
title: 进程的地址空间：TEXT，DATA，BSS，HEAP，STACK
tags: c++ process memory 
---

现代操作系统对每个进程都分配了完整的虚拟内存地址空间。进程会把整个地址空间分成多个区间来使用。
程序员最为熟悉的两个区间莫过于**堆**和**栈**。然而还有其他的内存区间来存储代码、静态、全局变量等等。
本文来总结一下这些内存区间到底存的是哪些东西。先看图：

<div class="float: left; max-width: 350px;">

<img src="/assets/img/blog/memory.png" alt="@2x">

<small>图片来源：
  <a href="http://www.sw-at.com/blog/2011/03/23/where-does-code-execute-process-address-space-code-gvar-bss-heap-stack/">SWAT Blog</a>
</small>

</div>

虚拟内存技术使得每个进程都可以独占整个内存空间，地址从零开始，直到内存上限。
每个进程都将这部分空间（从低地址到高地址）分为六个部分：

1. TEXT段：整个程序的代码，以及所有的常量。这部分内存是是固定大小的，只读的。
2. DATA段，又称GVAR：初始化为非零值的全局变量。
3. BSS段：初始化为0或未初始化的全局变量和静态变量。
4. HEAP（堆）：动态内存区域，使用`malloc`或`new`申请的内存。
5. 未使用的内存。
6. STACK（栈）：局部变量、参数、返回值都存在这里，函数调用开始会参数入栈、局部变量入栈；调用结束依次出栈。

其中堆和栈的大小是可变的，堆从下往上生长，栈从上往下生长。
