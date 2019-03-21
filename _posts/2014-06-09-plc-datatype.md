---
layout: blog
title: PLC 中的数据类型
tags: PLC 数组 字符串 函数重载
---

IEC 61131-3 规约了 PLC 中的数据类型，包括21种基本数据类型（basic datatype）、用于函数重载的泛化数据类型（general datatype）、以及自定义数据类型（derived datatype）。

## 基本数据类型

编号 | 关键字 | 数据类型 |  长度
--- |   ---     |   ---     |   ---
1 | `BOOL` | 布尔 | 1 
2 | `SINT` | 短整数 | 8
3 | `INT` | 整数 | 16 
4 | `DINT` | 双精度整数 | 32
5 | `LINT` | 长整数 | 64
6 | `USINT` | 无符号短整数 | 8
7 | `UINT` | 无符号整数 | 16
8 | `UDINT` | 无符号双精度整数 | 32
9 | `ULINT` | 无符号长整数 | 64
10 | `REAL` | 实数 | 32
11 | `LREAL` | 长实数 | 64
12 | `TIME` | 持续时间 | --
13 | `DATE` | 如期 | --
14 | `TIME_OF_DAY`/`TOD` | 时间（当日） | --
15 | `DATE_AND_TIME`/`DT` | 时间与日期 | --
16 | `STRING` | 可变长度单字节字符串 | 8 
17 | `WSTRING` | 可变长度双字节字符串 | 16 
18 | `BYTE` | 长为8的位串 | 8 
19 | `WORD` | 长为16的位串 | 16 
20 | `DWORD` | 长为32的位串 | 32 
21 | `LWORD` | 长为64的位串 | 64 

<!--more-->

## 泛化数据类型

在功能和功能块的输入/输出说明中，除 *基本数据类型* 外，还可以使用 **泛化数据类型层级** 。泛化数据类型用前缀`ANY`标识。其层级关系如下：

```
ANY
    ANY_DERIVED
    ANY_ELEMENTARY
        ANY_MAGNITUDE
            ANY_NUM
                ANY_REAL 
                    LREAL
                    REAL 
                ANY_INT
                    LINT, DINT, INT, SINT
                    ULINT, UDINT, UINT, USINT 
            TIME
        ANY_BIT
            LWORD, DWORD, WORD, BYTE, BOOL
        ANY_STRING 
            STRING
            WSTRING 
        ANY_DATE
            DATE_AND_TIME 
            DATE, TIME_OF_DAY
```

## 自定义数据类型

**自定义数据类型** 使用`TYPE...END_TYPE`声明。例如，从基本数据类型直接导出的数据类型：`TYPE RU_REAL : REAL ; END_TYPE`.

### 枚举

```
TYPE ANALOG_SIGNAL_TYPE : 
    (SINGLE_ENDED, DIFFERENTIAL) := SINGLE_ENDED ; 
END_TYPE
```

在 **枚举** 中，可以使用类型前缀（如`ANALOG_SIGNAL_TYPE#`）可用来避免歧义。如果没有提供足够的类型信息，将被视为 **错误** 。

**枚举** 类型的默认初始值为第一个标识符，或用户在类型声明中使用`:=`指定的值。

### 子域

```
TYPE ANALOG_DATA : INT (-4095..4095) ; END_TYPE
```

**子域** 声明指定了数据取值的上限和下限。如果子范围类型的值超出了其规定的范围，将被视为 **错误** 。

*子域* 数据类型的初始值为取值的下限。

### 结构

```
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
```

对于 *结构* 和 *数组* ，初始值对应基本数据类型的初始值，除非用户使用`:=`指定。

> 基本数据类型的初始值均为0，日期除外：`0000-00-01`。

### 数组

```
TYPE ANALOG_16_INPUT_DATA : 
    ARRAY [1..16] OF ANALOG_DATA ; 
END_TYPE
```

`STRING` 和 `WSTRING` 的默认长度是 **实现相关** 的，但用户可以指定，例如：`TYPE STR10 : STRING[10] := 'ABCDEF'; END_TYPE`。


