---
layout: blog
title: PLC 中的配置元素
tags: PLC 
---

**配置** 包含 *资源* ， *任务* （在 *资源* 中定义）， *全局变量* ， *访问路径* 和实例初始化。下图为一个简单配置的图形示例：

![@2x](/assets/img/blog/configuration-example.png)

*功能块* 和 *程序* 的纲要声明如下：

![@2x](/assets/img/blog/configuration-example-st.png) 

<!--more-->

# 配置，资源和访问路径

下表列举了声明配置、资源、全局变量、访问路径，以及实例化的特性。

编号 | 说明 
---  | --- 
1 | `CONFIGURATION...END_CONFIGURATION` 构造
2 |  定义在`CONFIGURATION`中的`VAR_GLOBAL...END_VAR`构造 
3 | `RESOURCE...ON...END_RESOURCE` 构造
4 | 定义在`RESOURCE`中的`VAR_GLOBAL...END_VAR`构造
5a | 周期性的`TASK`构造
5b | 非周期性的`TASK`构造
6a | 关联`PROGRAM`与`TASK`的`WITH`构造
6b | 关联功能块与`TASK`的`WITH`构造
6c | 没有`TASK`关联的`PROGRAM`声明
7 | `VAR_GLOBAL`中声明的直接表示变量
8a | 直接表示变量与`PROGRAM`输入的连接
8b | `GLOBAL`变量与`PROGRAM`输入的连接
9a | `PROGRAM`输出与直接表示变量的连接
9b | `PROGRAM`输出与`GLOBAL`变量的连接
10a | `VAR_ACCESS...END_VAR`构造
10b | 直接表示变量的访问路径
10c | `PROGRAM`输入的访问路径
10d | `RESOURCE`中`GLOBAL`变量的访问路径
10e | `CONFIGURATION`中`GLOBAL`变量的访问路径
10f | `PROGRAM`输出的访问路径
10g | `PROGRAM`内部变量的访问路径
10h | 功能块输入的访问路径
10i | 功能块输出的访问路径
11 | `VAR_CONFIG...END_VAR`构造
12a | `RESOURCE`声明中的`VAR_GLOBAL CONSTANT`
12b | `CONFIGURATION`声明中的`VAR_GLOBAL CONSTANT`
13a | `RESOURCE`声明中的`VAR_EXTERNAL`
13b | `RESOURCE`声明中的`VAR_EXTERNAL CONSTANT`

* 在`RESOURCE...ON...END_RESOURCE`中的`ON`限定符用来指定处理功能及其人机接口、传感器-执行器接口的类型。
* `VAR_GLOBAL`的作用域限于声明它的 *配置* 或 *资源* 。
* `VAR_ACCESS`用于远程访问（IEC 61131-5），可以关联的变量有：全局变量、直接表示变量、任何 *程序* 和 *功能块* 的输入、输出、内部变量。
* `VAR_CONFIG...END_VAR`构造用于初始化符号表示的变量和位置未确定的（`*`表示）直接表示变量。

> `VAR_ACCESS`的关联需要指出变量所处的完整层级；对于下列变量不可定义访问路径：`VAR_TEMP`,`VAR_EXTERNAL`,`VAR_IN_OUT`；访问路径可指定方向：`READ_WRITE`,`READ_ONLY`(默认)。
> `VAR_CONFIG`不可对下列类型的实例初始化：`VAR_TEMP`,`VAR_EXTERNAL`,`VAR CONSTANT`,`VAR_IN_OUT`。

下图给出了上述特性的示例：

```
CONFIGURATION CELL_1

    VAR_GLOBAL w: UINT; END_VAR 

    RESOURCE STATION_1 ON PROCESSOR_TYPE_1
        VAR_GLOBAL z1: BYTE; END_VAR 
        TASK SLOW_1(INTERVAL := t#20ms, PRIORITY := 2) ; 
        TASK FAST_1(INTERVAL := t#10ms, PRIORITY := 1) ;
        PROGRAM P1 WITH SLOW_1 :
            F(x1 := %IX1.1) ; 
        PROGRAM P2 : G(OUT1 => w,
            FB1 WITH SLOW_1, 
            FB2 WITH FAST_1) ;
    END_RESOURCE

    RESOURCE STATION_2 ON PROCESSOR_TYPE_2
        VAR_GLOBAL z2   : BOOL ;
            AT %QW5     : INT ;
        END_VAR
        TASK PER_2(INTERVAL := t#50ms, PRIORITY := 2) ;
        TASK INT_2(SINGLE := z2, PRIORITY := 1);
        PROGRAM P1 WITH PER_2 :
            F(x1:=z2,x2:=w) ; 
        PROGRAM P4 WITH INT_2 :
            H(HOUT1 => %QW5, 
                FB1 WITH PER_2);
    END_RESOURCE

    VAR_ACCESS
        ABLE    : STATION_1.%IX1.1  : BOOL READ_ONLY ;
        BAKER   : STATION_1.P1.x2   : UINT READ_WRITE ;
        CHARLIE : STATION_1.z1      : BYTE ;
        DOG     : w                 : UINT READ_ONLY ;
        ALPHA   : STATION_2.P1.y1   : BYTE READ_ONLY ;
        BETA    : STATION_2.P4.HOUT1: INT READ_ONLY ;
        GAMMA   : STATION_2.z2      : BOOL READ_WRITE ;
        S1_COUNT: STATION_1.P1.COUNT  : INT;
        THETA   : STATION_2.P4.FB2.d1 : BOOL READ_WRITE; 
        ZETA    : STATION_2.P4.FB1.c1 : BOOL READ_ONLY; 
        OMEGA   : STATION_2.P4.FB1.C3 : INT READ_WRITE;
    END_VAR

    VAR_CONFIG
        STATION_1.P1.COUNT : INT := 1; 
        STATION_2.P1.COUNT : INT := 100; 
        STATION_1.P1.TIME1 : TON := (PT := T#2.5s); 
        STATION_2.P1.TIME1 : TON := (PT := T#4.5s); 
        STATION_2.P4.FB1.C2 AT %QB25 : BYTE;
    END_VAR

END_CONFIGURATION
```

# 任务

**任务** 是可以调用一个程序组织单元集合的执行控制元素。可以是周期性地调用，也可以是当指定布尔变量上升沿发生时调用。

> 每个 *资源* 可以拥有任务的上限和任务执行间隔的精度是 **实现相关** 的。

任务对程序执行单元的控制应满足下列规则：

1. 关联的程序组织单元应在任务的`SINGLE`输入的每个上升沿被调度。
2. 当`INTERVAL`输入非零，关联的程序组织单元应被周期性调度，直到`SINGLE`非零。
3. `PRIORITY`输入建立了相关联的程序组织单元的优先级，用于抢占式和非抢占式调度。
4. 没有与`TASK`关联的`program`拥有最低的系统优先级。
5. 当 *功能块* 与 *任务* 关联后，其执行应受该任务的独有控制，而与其声明所在的程序组织单元无关。
6. 没有直接与 *任务* 关联的程序组织单元应遵循程序组织单元的语言元素的正常求值顺序。
7. 同一 *程序* 内功能块的执行应被同步，以保证并发的数据一致性。

任务的图形表示

```
         TASKNAME
       +---------+ 
       |  TASK   |
BOOL---|SINGLE   | 
TIME---|INTERVAL | 
UINT---|PRIORITY |
       +---------+

(* 周期任务 *)
           SLOW_1               FAST_1 
         +---------+          +---------+ 
         |  TASK   |          |  TASK   | 
         |SINGLE   |          |SINGLE   | 
t#20ms---|INTERVAL | t#10ms---|INTERVAL | 
     2---|PRIORITY |      1---|PRIORITY | 
         +---------+          +---------+
```

