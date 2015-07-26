---
layout: blog
categories: misc
title: 中文乱码辨识
tags: Linux Windows 字符编码 UTF-8
redirect_from:
  - /misc/unreadable-code.html
  - /2015/05/11/unreadable-code/
---

在软件开发中常常会碰到中文乱码。有时我们不知道该文件的正确编码是什么，会使用文本编辑器（如UltraEdit）来尝试所有可能的编码。然而，乱码本身也有一定的规律，从乱码的样子大致可以得知正确的编码类型。在此给出各种编码的字符串被错误解析时的样子。

以下面语句为例：

> 这是一个字符集测试，作者为Harttle。

<!--more-->

## 以UTF-8编码

以下列编码解析的显示结果：

* BIG-5  
餈口口銝€銝芸?蝚阡?瘚口?嚗口??口蛹Harttle??

* ASCII  
???????????????????????????????????????Harttle???

* GBK  
杩欐槸涓€涓瓧绗﹂泦娴嬭瘯锛屼綔鑰呬负Harttle銆?

* Unicode  
뿨꾘룤ꪸ귥ꚬ鯩讵꿨貼뷤薀룤䢺牡瑴敬胣�

## 以GBK编码

以下列编码解析的显示结果：

* BIG-5   
涴岆珨跺趼睫摩聆彸ㄛ釬氪峈Harttle﹝

* UTF8  
����һ���ַ������ԣ�����ΪHarttle��

* Unicode  
쟊믒훗﮷꾼퓊겣�꫎慈瑲汴ꅥ�

* ASCII  
??????????????????????????Harttle??

## 以Unicode编码

以下列编码解析的显示结果：

* BIG-5    
?/f口N*NW[&?Km?
口\O:NH口a口r口t口t口l口e口0  

* UTF8  
'/f口N*NW[&{lKmՋ
�\O�:NH口a口r口t口t口l口e口0  

* UTF32  
�����������

* GBK  
購/f口N*NW[&{茤Km諎
口\O€:NH口a口r口t口t口l口e口0

## 规律  

1. 错误地选择ASCII显示时，问号居多，ASCII字符255个也很容易识别。

2. 错误地选择UTF8、UTF16显示时，会出来很多��

3. 错误地选择GBK显示时，会出现很多不常见的繁体字


> 如果你在做相似的工作，可能需要查询代码页：[Wikipedia-Code_page][wiki]

[wiki]:http://en.wikipedia.org/wiki/Code_page/

