---
layout: blog
title: PLC 中的变量语法与使用
tags: PLC 引用 数组 作用域 全局变量
---

PLC语言规约在IEC 61131-3中。本文详述了变量的表示法、变量初始化、变量声明以及使用。

## 表示法

### 单元素变量

**单元素变量** 定义为表示单个基本数据类型数据元素的变量。这部分定义了变量的 **符号表示** 和 **直接表示** （数据元素与可编程控制器输入/输出/存储器结构的物理/逻辑地址的关联）。

*单元素变量* 的 *直接表示* 由一个`%`，一个 *地址前缀* ，一个 *大小前缀* ，和一个或更多由`.`分隔的无符号整数组成。

> `*`可用于地址前缀，表示 *直接表示* 还没有完全指定。变量地址应在 *配置* 的`VAR_CONFIG...END_VAR` 构造内完全指定，否则将产生 **错误** 。

位置前缀 | 含义   | 地址前缀           | 含义
---             |   ---     |   ---                 |   ---
I               | 输入     | X/None                | 单个位
Q               | 输出    | B                     | 字节 (8位)
M               | 存储器    | W                     | 字 (16位)
*               | 未指定 | D             | 双字 (32位)
                |           | L                     | 长字 (64位)

示例

```
%QX75 or %Q75   (* 输出的75位 *)
%IW2.5.7.1      (* 在输入的物理/逻辑层级2.5.7.1的字 *)
```

> 一个可编程控制器通过分级寻址访问另一个控制器的数据应被视为 *语言扩展* 。最大级数是 **实现相关** 的。

<!--more-->

### 多元素变量

在本标准中定义的 **多元素变量** 包括 *数组* 和 *结构* 。

**数组** 是包含有着同样属性的数据对象的 *聚集* ，每个数据对象可通过下标来引用。

**结构** 是命名数据元素收集而成的数据类型。

示例

```
OUTARY[%MB6,SYM] := INARY[0] + INARY[7] - INARY[%MB6] * %IW62 ;
MODULE_5_CONFIG.SIGNAL_TYPE := SINGLE_ENDED; 
MODULE_5_CONFIG.CHANNEL[5].RANGE := BIPOLAR_10V;
```

## 初始化

当配置元素（资源、配置）启动时，每个与该元素关联的变量可以取如下的初始值：

* 上次停机时该变量的值（保持的值）。
* 用户指定的初始值。
* 该变量关联的数据类型的默认初始值。

> 用户可通过`RETAIN`限定符来指定变量是保持的。

## 声明

文本形式的变量声明使用关键字`VAR`（或其他`VAR`关键字），接着一个可选的限定符，接着一个或更多的用`;`分隔的声明，以关键字`END_VAR`结束。

变量声明涉及的关键字

| 关键字       |   变量使用  |
| ---           |   ---             |
| `VAR`         | 内部变量，组织单元内使用 |
| `VAR_INPUT`   | 外部提供，组织单元内只读 |
| `VAR_OUTPUT`  | 组织单元提供，外部实体使用 |
| `VAR_IN_OUT`  | 外部实体提供，组织单元内可读写 |
| `VAR_EXTERNAL`| 配置通过`VAR_GLOBAL`提供，组织单元内可读写 |
| `VAR_GLOBAL`  | 全局变量声明 |
| `VAR_ACCESS`  | 访问路径声明 |
| `VAR_TEMP`    | 功能块和程序内的临时存储 |
| `VAR_CONFIG`  | 实例初始化和地址赋值 |
| `RETAIN`     | 保持的变量 |
| `NON_RETAIN` | 非保持的变量 |
| `CONSTANT`   | 常数（只读变量） |
| `AT`          | 地址赋值 |

在 *功能块* 和 *程序* 里，以`VAR_TEMP...END_VAR`构造声明的变量在每次 *实例调用* 都会初始化。

变量声明的作用域对于所在的程序组织单元是 *局部的* 。`VAR_GLOBAL...END_VAR`变量只有通过`VAR_EXTERNAL`声明后才是可访问的，且`VAR_EXTERNAL`中的类型声明与对应的`VAR_GLOBAL`应保持一致，否则将产生 **错误** 。

### 类型赋值

物理/逻辑地址到符号表示变量的赋值应使用`AT`关键字。如果没有这样的赋值，变量将被自动分配到可编程控制器存储器中合适的地址。

示例

```
VAR RETAIN
    AT %IW6.2 : WORD;       
    LIM_SW_S5 AT %IX27 : BOOL;
    INARY AT %IW6 : ARRAY [0..9] OF INT;
    THREE : ARRAY[1..5,1..10,1..8] OF INT;
END_VAR
```

### 赋初始值

初始值可以通过使用`VAR_CONFIG...END_VAR`构造提供的实例初始化特性来完成。实例初始化提供的初始值总是应当覆盖类型提供的初始值。

> 在`VAR_EXTERNAL`声明中不允许给定初始值。

示例

变量初始化

```
VAR
    VALVE_POS AT %QW28 : INT := 100;
    OUTARY AT %QW6 : ARRAY[0..9] OF INT := [10(1)];
    OKAY : STRING[10] := 'OK';
    TBT : ARRAY [1..2,1..3] OF INT := [1,2,3(4),6] ;
END_VAR
```

结构

```
(* 结构声明 *)
TYPE 
    ANALOG_CHANNEL_CONFIGURATION :
        STRUCT
            RANGE : ANALOG_SIGNAL_RANGE ; 
            MIN_SCALE : ANALOG_DATA ; 
            MAX_SCALE : ANALOG_DATA ;
        END_STRUCT ; 
    ANALOG_16_INPUT_CONFIGURATION :
        STRUCT
            SIGNAL_TYPE : ANALOG_SIGNAL_TYPE ;
            FILTER_PARAMETER : SINT (0..99) ;
            CHANNEL : ARRAY [1..16] OF ANALOG_CHANNEL_CONFIGURATION ;
        END_STRUCT ; 
END_TYPE

(* 结构初始化 *)
VAR MODULE_8_CONFIG: 
    ANALOG_16_INPUT_CONFIGURATION := (
        SIGNAL_TYPE := DIFFERENTIAL, 
        CHANNEL := [
            4(
                (RANGE := UNIPOLAR_1_5V)
            ), 
            (
                RANGE:= BIPOLAR_10_V,
                MIN_SCALE := 0, 
                MAX_SCALE := 500
            )
        ]
    );
END_VAR
```

功能块初始化

```
VAR TempLoop : 
    PID := (
        PropBand := 2.5, 
        Integral := T#5s
    );
END_VAR
```

