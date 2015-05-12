---
layout: blog
categories: development
title: 中文乱码辨识
tags: windows linux
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

##	代码页简录

摘自[Wikipedia-Code_page][wiki]

[wiki]:http://en.wikipedia.org/wiki/Code_page/

    Examples:
    437 — The original IBM PC code page
    720 — Arabic
    737 — Greek
    775 — Estonian, Lithuanian and Latvian
    850 — "Multilingual (Latin-1)" (Western European languages)
    852 — "Slavic (Latin-2)" (Central and Eastern European languages)
    855 — Cyrillic
    857 — Turkish
    858 — "Multilingual" with euro symbol
    860 — Portuguese
    861 — Icelandic
    862 — Hebrew
    863 — French (Quebec French)
    865 — Danish/Norwegian Differs from 437 only in the letter Ø (ø) in place of ¥ and ¢
    866 — Cyrillic
    869 — Greek
    874 — Thai[7]

    Code pages for DBCS character sets:
    932 — Supports Japanese
    936 — GBK Supports Simplified Chinese
    949 — Supports Korean
    950 — Supports Traditional Chinese

    Microsoft code page numbers for various other character encodings:
    1200 — UTF-16LE Unicode little-endian
    1201 — UTF-16BE Unicode big-endian
    65000 — UTF-7 Unicode
    65001 — UTF-8 Unicode
    10000 — Macintosh Roman encoding (followed by several other Mac character sets)
    10007 — Macintosh Cyrillic encoding
    10029 — Macintosh Central European encoding
    20127 — US-ASCII The classic US 7 bit character set with no char larger than 127
    28591 — ISO-8859-1 (followed by ISO-8859-2 to ISO-8859-15)

    Miscellaneous:
    (number missing) — ASMO449+ Supports Arabic
    (number missing) — MIK Supports Bulgarian and Russian as well

    Windows (ANSI) code pages：
    1250 — Central and East European Latin
    1251 — Cyrillic
    1252 — West European Latin
    1253 — Greek
    1254 — Turkish
    1255 — Hebrew
    1256 — Arabic
    1257 — Baltic
    1258 — Vietnamese
    874 — Thai
