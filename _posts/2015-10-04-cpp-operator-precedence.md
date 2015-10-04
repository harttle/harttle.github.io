---
layout: blog
categories: reading
title: C++运算符优先级与结合性
tags:  C++ 运算符
---

最近总是由于不清楚运算符优先级不小心写错代码，每次都去查[cppreference][cppref]。现在把[cppreference][cppref]内容拷贝至此，方便查询。
这里面最值得注意的是`<<`（移位）优先级低于`+/-`（加减），`!`（逻辑非）`++/--`（自增/自减）`+/-`（正负）优先级低于`->`运算符。

# 优先级与结合性

<p>下表列出了C++运算符的优先级和结合性。从上到下，运算符的优先级逐渐减弱.</p>

<table class="wikitable table">

<tbody><tr>
<th style="text-align: left"> Precedence
</th>
<th style="text-align: left"> Operator
</th>
<th style="text-align: left"> Description
</th>
<th style="text-align: left"> Associativity
</th></tr>
<tr>
<th> 1
</th>
<td> <code>::</code>
</td>
<td> 作用域解析
</td>
<td style="vertical-align: top" rowspan="6"> Left-to-right
</td></tr>
<tr>
<th rowspan="5"> 2
</th>
<td style="border-bottom-style: none"> <code>++</code>&nbsp;&nbsp; <code>--</code>
</td>
<td style="border-bottom-style: none"> 后缀 自增、自减
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>()</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> 函数调用
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>[]</code> </td>
<td style="border-bottom-style: none; border-top-style: none"> 数组下标 </td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>.</code> </td>
<td style="border-bottom-style: none; border-top-style: none"> 通过引用选择成员 </td>
</tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>−&gt;</code> </td>
<td style="border-bottom-style: none; border-top-style: none"> 通过指针选择成员 </td>
</tr>
<tr>
<th rowspan="9"> 3 </th>
<td style="border-bottom-style: none"> <code>++</code>&nbsp;&nbsp; <code>--</code>
</td>
<td style="border-bottom-style: none"> 前缀 自增、自减
</td>
<td style="vertical-align: top" rowspan="9"> Right-to-left
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>+</code>&nbsp;&nbsp; <code>−</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> 正、负
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>!</code>&nbsp;&nbsp; <code>~</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> 逻辑非、按位非
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>(<i>type</i>)</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> 显式类型转换
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>*</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> 解引用
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>&amp;</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> 取地址
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>sizeof</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> 取对象大小
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>new</code>, <code>new[]</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> 动态内存分配
</td></tr>
<tr>
<td style="border-top-style: none"> <code>delete</code>, <code>delete[]</code>
</td>
<td style="border-top-style: none"> 动态内存去分配
</td></tr>
<tr>
<th> 4
</th>
<td> <code>.*</code>&nbsp;&nbsp; <code>-&gt;*</code>
</td>
<td> 成员指针运算符
</td>
<td style="vertical-align: top" rowspan="12"> Left-to-right
</td></tr>
<tr>
<th> 5
</th>
<td> <code>*</code>&nbsp;&nbsp; <code>/</code>&nbsp;&nbsp; <code>%</code>
</td>
<td> 乘、除、求余
</td></tr>
<tr>
<th> 6
</th>
<td> <code>+</code>&nbsp;&nbsp; <code>−</code>
</td>
<td> 加、减
</td></tr>
<tr>
<th> 7
</th>
<td> <code>&lt;&lt;</code>&nbsp;&nbsp; <code>&gt;&gt;</code>
</td>
<td> 按位左移、按位右移
</td></tr>
<tr>
<th rowspan="2"> 8
</th>
<td style="border-bottom-style: none"> <code>&lt;</code>&nbsp;&nbsp; <code>&lt;=</code>
</td>
<td style="border-bottom-style: none"> 小于、小于或等于
</td></tr>
<tr>
<td style="border-top-style: none"> <code>&gt;</code>&nbsp;&nbsp; <code>&gt;=</code>
</td>
<td style="border-top-style: none"> 大于、大于或等于
</td></tr>
<tr>
<th> 9
</th>
<td> <code>==</code>&nbsp;&nbsp; <code>!=</code>
</td>
<td> 等于、不等于
</td></tr>
<tr>
<th> 10
</th>
<td> <code>&amp;</code>
</td>
<td> 按位与
</td></tr>
<tr>
<th> 11
</th>
<td> <code>^</code>
</td>
<td> 按位异或
</td></tr>
<tr>
<th> 12
</th>
<td> <code>|</code>
</td>
<td> 按位或
</td></tr>
<tr>
<th> 13
</th>
<td> <code>&amp;&amp;</code>
</td>
<td> 逻辑与
</td></tr>
<tr>
<th> 14
</th>
<td> <code>||</code>
</td>
<td> 逻辑或
</td></tr>
<tr>
<th rowspan="7"> 15
</th>
<td style="border-bottom-style: none"> <code>?:</code>
</td>
<td style="border-bottom-style: none"> 三目运算符
</td>
<td style="vertical-align: top" rowspan="7"> Right-to-left
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>=</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> 赋值
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>+=</code>&nbsp;&nbsp; <code>−=</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> Assignment by sum and difference
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>*=</code>&nbsp;&nbsp; <code>/=</code>&nbsp;&nbsp; <code>%=</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> Assignment by product, quotient, and remainder
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>&lt;&lt;=</code>&nbsp;&nbsp; <code>&gt;&gt;=</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> Assignment by bitwise left shift and right shift
</td></tr>
<tr>
<td style="border-bottom-style: none; border-top-style: none"> <code>&amp;=</code>&nbsp;&nbsp; <code>^=</code>&nbsp;&nbsp; <code>|=</code>
</td>
<td style="border-bottom-style: none; border-top-style: none"> Assignment by bitwise AND, XOR, and OR
</td></tr>
<tr>
<td style="border-top-style: none"> <code>throw</code>
</td>
<td style="border-top-style: none"> Throw operator (for exceptions)
</td></tr>
<tr>
<th> 17
</th>
<td> <code>,</code>
</td>
<td> Comma
</td>
<td> Left-to-right
</td></tr></tbody></table>

# 运算符列表

<table class="wikitable table">

<tbody><tr style="text-align:center">
<th colspan="7"> Common operators
</th></tr>
<tr style="text-align:center">
<td> <span href="/w/cpp/language/operator_assignment" title="cpp/language/operator assignment"> assignment</span>
</td>
<td> <span href="/w/cpp/language/operator_incdec" title="cpp/language/operator incdec"> increment<br>decrement</span>
</td>
<td> <span href="/w/cpp/language/operator_arithmetic" title="cpp/language/operator arithmetic"> arithmetic</span>
</td>
<td> <span href="/w/cpp/language/operator_logical" title="cpp/language/operator logical"> logical</span>
</td>
<td> <span href="/w/cpp/language/operator_comparison" title="cpp/language/operator comparison"> comparison</span>
</td>
<td> <span href="/w/cpp/language/operator_member_access" title="cpp/language/operator member access"> member<br>access</span>
</td>
<td> <span href="/w/cpp/language/operator_other" title="cpp/language/operator other"> other</span>
</td></tr>
<tr style="text-align:center">
<td>
<p><span class="t-c"><span class="mw-geshi cpp source-cpp">a <span class="sy1">=</span> b<br>
a <span class="sy2">+</span><span class="sy1">=</span> b<br>
a <span class="sy2">-</span><span class="sy1">=</span> b<br>
a <span class="sy2">*</span><span class="sy1">=</span> b<br>
a <span class="sy2">/</span><span class="sy1">=</span> b<br>
a <span class="sy2">%</span><span class="sy1">=</span> b<br>
a <span class="sy3">&amp;</span><span class="sy1">=</span> b<br>
a <span class="sy3">|</span><span class="sy1">=</span> b<br>
a <span class="sy3">^</span><span class="sy1">=</span> b<br>
a <span class="sy1">&lt;&lt;=</span> b<br>
a <span class="sy1">&gt;&gt;=</span> b</span></span>
</p>
</td>
<td>
<p><span class="t-c"><span class="mw-geshi cpp source-cpp"><span class="sy2">++</span>a<br>
<span class="sy2">--</span>a<br>
a<span class="sy2">++</span><br>
a<span class="sy2">--</span></span></span>
</p>
</td>
<td>
<p><span class="t-c"><span class="mw-geshi cpp source-cpp"><span class="sy2">+</span>a<br>
<span class="sy2">-</span>a<br>
a <span class="sy2">+</span> b<br>
a <span class="sy2">-</span> b<br>
a <span class="sy2">*</span> b<br>
a <span class="sy2">/</span> b<br>
a <span class="sy2">%</span> b<br>
~a<br>
a <span class="sy3">&amp;</span> b<br>
a <span class="sy3">|</span> b<br>
a <span class="sy3">^</span> b<br>
a <span class="sy1">&lt;&lt;</span> b<br>
a <span class="sy1">&gt;&gt;</span> b</span></span>
</p>
</td>
<td>
<p><span class="t-c"><span class="mw-geshi cpp source-cpp"><span class="sy3">!</span>a<br>
a <span class="sy3">&amp;&amp;</span> b<br>
a <span class="sy3">||</span> b</span></span>
</p>
</td>
<td>
<p><span class="t-c"><span class="mw-geshi cpp source-cpp">a <span class="sy1">==</span> b<br>
a <span class="sy3">!</span><span class="sy1">=</span> b<br>
a <span class="sy1">&lt;</span> b<br>
a <span class="sy1">&gt;</span> b<br>
a <span class="sy1">&lt;=</span> b<br>
a <span class="sy1">&gt;=</span> b</span></span>
</p>
</td>
<td>
<p><span class="t-c"><span class="mw-geshi cpp source-cpp">a<span class="br0">[</span>b<span class="br0">]</span><br>
<span class="sy2">*</span>a<br>
<span class="sy3">&amp;</span>a<br>
a<span class="sy2">-</span><span class="sy1">&gt;</span>b<br>
a.<span class="me1">b</span><br>
a<span class="sy2">-</span><span class="sy1">&gt;</span><span class="sy2">*</span>b<br>
a.<span class="sy2">*</span>b</span></span>
</p>
</td>
<td>
<p><span class="t-c"><span class="mw-geshi cpp source-cpp">a<span class="br0">(</span>...<span class="br0">)</span><br>
a, b<br>
<span class="br0">(</span>type<span class="br0">)</span> a<br>
<span class="sy4">?</span> <span class="sy4">:</span></span></span>
</p>
</td></tr>
<tr>
<th colspan="7"> Special operators
</th></tr>
<tr>
<td colspan="7">
<p><span href="/w/cpp/language/static_cast" title="cpp/language/static cast"><tt>static_cast</tt></span> converts one type to another compatible type <br>
<span href="/w/cpp/language/dynamic_cast" title="cpp/language/dynamic cast"><tt>dynamic_cast</tt></span> converts virtual base class to derived class<br>
<span href="/w/cpp/language/const_cast" title="cpp/language/const cast"><tt>const_cast</tt></span> converts type to compatible type with different <span href="/w/cpp/language/cv" title="cpp/language/cv">cv</span> qualifiers<br>
<span href="/w/cpp/language/reinterpret_cast" title="cpp/language/reinterpret cast"><tt>reinterpret_cast</tt></span> converts type to incompatible type<br>
<span href="/w/cpp/memory/new/operator_new" title="cpp/memory/new/operator new"><tt>new</tt></span> allocates memory<br>
<span href="/w/cpp/memory/new/operator_delete" title="cpp/memory/new/operator delete"><tt>delete</tt></span> deallocates memory<br>
<span href="/w/cpp/language/sizeof" title="cpp/language/sizeof"><tt>sizeof</tt></span> queries the size of a type<br>
<span href="/w/cpp/language/sizeof..." title="cpp/language/sizeof..."><tt>sizeof...</tt></span> queries the size of a <span href="/w/cpp/language/parameter_pack" title="cpp/language/parameter pack">parameter pack</span> <span class="t-mark-rev t-since-cxx11">(since C++11)</span><br>
<span href="/w/cpp/language/typeid" title="cpp/language/typeid"><tt>typeid</tt></span> queries the type information of a type<br>
<span href="/w/cpp/language/noexcept" title="cpp/language/noexcept"><tt>noexcept</tt></span> checks if an expression can throw an exception <span class="t-mark-rev t-since-cxx11">(since C++11)</span><br>
<span href="/w/cpp/language/alignof" title="cpp/language/alignof"><tt>alignof</tt></span> queries alignment requirements of a type <span class="t-mark-rev t-since-cxx11">(since C++11)</span>
</p>
</td></tr></tbody></table>

</div>

[cppref]: http://en.cppreference.com/w/cpp/language/operator_precedence
