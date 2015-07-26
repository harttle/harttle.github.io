---
layout: blog
categories: reading
title:  Foundamentals of Database Systems
tags: 数据库
excerpt: 《数据库系统基础》，Ramez Elmasri, Shamkant B.Navathe.
redirect_from:
  - /reading/fundamentals-of-database-systems.html
  - /2014/05/11/fundamentals-of-database-systems/
---

# 数据库概述

数据库与DBMS软件构成 **数据库系统**，为一组用户提供服务，称为 **幕前角色** （数据库管理员、设计者、最终用户、系统分析员、应用程序员）。除了数据库用户，还有 **幕后工作者** （DBMS系统设计者、实现者、工具开发者、操作和维护人员）提供支持。

数据模型包括三部分：高层的概念数据模型、低层的物理数据模型、之间的表示数据模型。

数据库三层模式体系结构：内层为内模式，描述物理存储结构；概念层为概念模式，描述数据库结构；外层/视图层为外模式/用户视图，描述特定用户感兴趣的一部分数据库。

SDL(storage definition language)定义内模式，VDL(view definition language)定义外模式，DDL(data definition language)定义定义概念模式，而DML(data manipulation language)定义了数据操纵的集合。SQL(structed query language)是一种综合性的关系数据库语言，包括DDL, VDL和DML语言的功能。

DML有两种类型。高层的非过程DML，是面向集合的（set-oriented，set-at-a-time），属于描述性的语言；低层的DML是面向过程的（record-at-a-time）。交互式的DML称为 **查询语言** 。

DBMS的组建模块如下图： 
![dbms components](/assets/img/blog/dbms.png)

在DBMS的客户机-服务器体系结构中，客户机与查询服务器（事务服务器、SQL服务器）之间首先建立ODBC(open database connectivity)，它提供了一组API。（存在面向java的JDBC标准）。

数据模型有多种：关系数据模型、对象数据模型、分层数据模型、网状数据模型。基于这些数据模型，可以把DBMS分为：关系模型、对象数据模型、对象-关系数据模型、层次数据模型、网状数据模型。

<!--more-->

# 关系数据模型与SQL

## 关系数据模型与约束

表为 **关系** ，行为 **元组** ，列标题为 **属性** ，值域为 **域** ，关系R为 **关系内含** ，其状态r(R)为 **关系外延** 。关系的另外一种定义：元组为域之间的映射，每个角色都是键值对，此时元组是无序的。

数据库约束分为3类： **隐式约束** 为固有的基于模型的约束； **显式约束** 为基于模式的约束（DDL定义）； **语义约束** 为基于应用的约束，又称业务规则。另一类重要的约束为 **数据依赖** ，包括函数依赖和多值依赖。以下属于基于模式的约束：

1. 域约束。域的数据类型。
2. 键约束。超键（superkey）唯一性约束，候选键中选一个主键来标识元组。
3. 实体完整性约束。主键不为NULL。
4. 参照完整性约束。参照的必须是存在的元组。

另外，还包括语义完整性约束、函数依赖约束。除了如上的状态约束，还包括 **变迁约束** 。

对于更新时的违例约束有多种处理：

1. 插入。拒绝、修正拒绝插入的原因（级联）
2. 删除。拒绝、级联删除、置空或默认值
3. 更新。非主键非外键时不会有问题。


## SQL

SQL 是一门 ANSI 的标准计算机语言，用来访问和操作数据库系统。有些命令不同的RDBMS中不一致，以MySQL为例。

### DATABASE


```sql
-- 创建新数据库
CREATE DATABASE my_db

-- 修改数据库
ALTER DATABASE my_db CHARACTER SET utf8

-- 重命名数据库
RENAME DATABASE my_db TO my_db1

-- 删除数据库
DROP DATABASE my_db1
```

### TABLE

```sql
-- 创建表
CREATE TABLE Persons (
    Id_P int NOT NULL AUTO_INCREMENT,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255) DEFAULT 'Sandnes',
)

-- 重命名
RENAME TABLE Person TO Student

-- 添加列
ALTER TABLE Person ADD Age int

-- 删除列
ALTER TABLE Person DROP COLUMN Age

-- 改变列的数据类型
ALTER TABLE Person ALTER COLUMN Age varchar(255)

-- 删除表数据
TRUNCATE TABLE Person

-- 删除表
DROP TABLE Person
```


### SELECT

```sql
-- 从表中选择列
SELECT LastName,FirstName FROM Persons

-- 只列出不同的值
SELECT DISTINCT Company FROM Orders

-- 指定数目
SELECT * FROM Persons LIMIT 5

-- 排序，默认ASC
SELECT Company, OrderNumber FROM Orders ORDER BY Company
SELECT Company, OrderNumber FROM Orders ORDER BY Company DESC, OrderNumber ASC

-- 表/列别名
SELECT po.OrderID, p.LastName, p.FirstName FROM Persons AS p, Product_Orders AS po 
    WHERE p.LastName='Adams' AND p.FirstName='John'
SELECT LastName AS Family, FirstName AS Name FROM Persons

--- 备份至指定表
SELECT LastName,FirstName INTO Persons_backup FROM Persons

--- 备份至指定数据库
SELECT * INTO Persons IN 'Backup.mdb' FROM Persons 
```

### WHERE

```sql
-- 条件选取
SELECT * FROM Persons WHERE City='Beijing'
SELECT * FROM Persons WHERE FirstName='Thomas' AND LastName='Carter'

-- 模式匹配
SELECT * FROM Persons WHERE City LIKE 'N%'

-- 多值匹配
SELECT * FROM Persons WHERE LastName IN ('Adams','Carter')

-- 范围匹配
SELECT * FROM Persons WHERE LastName BETWEEN 'Adams' AND 'Carter'
SELECT * FROM Persons WHERE LastName NOT BETWEEN 'Adams' AND 'Carter' 
```

SQL通配符：

通配符                      | 描述
---                         | ---
%                           | 替代一个或多个字符
_                           | 仅替代一个字符
[charlist]                  | 字符列中的任何单一字符
[^charlist] 或 [!charlist]  | 不在字符列中的任何单一字符

### JOIN/UNION

```sql
-- 引用两个表
SELECT Persons.FirstName, Orders.OrderNo FROM Persons, Orders WHERE Persons.Id_P = Orders.Id_P 

-- Join，结果同上
SELECT Persons.LastName, Persons.FirstName, Orders.OrderNo FROM Persons
INNER JOIN Orders
ON Persons.Id_P = Orders.Id_P ORDER BY Persons.LastName

--- Union，结果合并，要求相同数量的列，兼容的数据类型。
SELECT E_Name FROM Employees_China 
UNION 
SELECT E_Name FROM Employees_USA

--- Union all，允许重复
SELECT E_Name FROM Employees_China 
UNION ALL 
SELECT E_Name FROM Employees_USA
```

操作符          | 描述
---             | --- 
(INNER) JOIN    | 如果表中有至少一个匹配，则返回行
LEFT JOIN       | 即使右表中没有匹配，也从左表返回所有的行
RIGHT JOIN      | 即使左表中没有匹配，也从右表返回所有的行
FULL JOIN       | 只要其中一个表中存在匹配，就返回行

### UPDATE

```sql
-- 更新列
UPDATE Person SET FirstName = 'Fred' WHERE LastName = 'Wilson' 
UPDATE Person SET Address = 'Zhongshan 23', City = 'Nanjing'
WHERE LastName = 'Wilson'
```
### DELETE

```sql
-- 条件删除
DELETE FROM Person WHERE LastName = 'Wilson' 

-- 删除所有行
DELETE FROM table_name
DELETE * FROM table_name
```

### INSERT INTO

```sql
-- 插入行
INSERT INTO Persons VALUES ('Gates', 'Bill', 'Xuanwumen 10', 'Beijing')

-- 只给出指定列
INSERT INTO Persons (LastName, Address) VALUES ('Wilson', 'Champs-Elysees')
```

### INDEX

```sql
-- 创建索引
CREATE INDEX PersonIndex ON Person (LastName) 

-- 降序索引、多列索引
CREATE INDEX PersonIndex ON Person (LastName DESC, FirstName)

-- 删除索引
ALTER TABLE table_name DROP INDEX index_name
```

### VIEW

```sql
-- 创建/更新视图
CREATE VIEW [Current Product List] AS
SELECT ProductID,ProductName
FROM Products
WHERE Discontinued=No

-- 选取 Products 表中所有单位价格高于平均单位价格的产品
CREATE VIEW [Products Above Average Price] AS
SELECT ProductName,UnitPrice
FROM Products
WHERE UnitPrice>(SELECT AVG(UnitPrice) FROM Products) 

-- 删除视图
DROP VIEW view_name

-- 查询视图
SELECT * FROM [Products Above Average Price]
```

### CONSTRAIN

数据类型

数据类型            |  描述
---                 |  ---
integer(size) int(size) smallint(size) tinyint(size) | 仅容纳整数。在括号内规定数字的最大位数。
decimal(size,d) numeric(size,d) | 容纳带有小数的数字。 "size" 规定数字的最大位数。"d" 规定小数点右侧的最大位数。
char(size)  | 容纳固定长度的字符串（可容纳字母、数字以及特殊字符）。在括号中规定字符串的长度。
varchar(size) |  容纳可变长度的字符串（可容纳字母、数字以及特殊的字符）。在括号中规定字符串的最大长度。
date(yyyymmdd) | 容纳日期。


NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK, DEFAULT

```sql
-- 匿名约束
CREATE TABLE Persons (
    Id_P int NOT NULL AUTO_INCREMENT,
    City varchar(255) DEFAULT 'Sandnes',
    UNIQUE (Id_P),        
    PRIMARY KEY (Id_P),
    CHECK (Id_P>0)
)

CREATE TABLE Orders (
    Id_O int NOT NULL,
    Id_P int,
    OrderDate date DEFAULT GETDATE(),
    PRIMARY KEY (Id_O),
    FOREIGN KEY (Id_P) REFERENCES Persons(Id_P)
        ON DELETE SET DEFAULT ON UPDATE CASCADE
)

-- 命名约束 
CREATE TABLE Persons (
    Id_P int NOT NULL,
    CONSTRAINT uc_PersonID UNIQUE (Id_P,LastName),
    CONSTRAINT pk_PersonID PRIMARY KEY (Id_P,LastName)
    CONSTRAINT chk_Person CHECK (Id_P>0 AND City='Sandnes')
)

CREATE TABLE Orders (
    Id_O int NOT NULL,
    Id_P int,
    PRIMARY KEY (Id_O),
    CONSTRAINT fk_PerOrders FOREIGN KEY (Id_P) REFERENCES Persons(Id_P)
)

-- 添加 UNIQUE 约束
ALTER TABLE Persons ADD UNIQUE (Id_P)
ALTER TABLE Persons ADD CONSTRAINT uc_PersonID UNIQUE (Id_P,LastName)
-- 删除 UNIQUE 约束
ALTER TABLE Persons DROP INDEX uc_PersonID

-- 添加主键
ALTER TABLE Persons ADD PRIMARY KEY (Id_P)
ADD CONSTRAINT pk_PersonID PRIMARY KEY (Id_P,LastName)
-- 删除主键
ALTER TABLE Persons DROP PRIMARY KEY

-- 添加外键
ALTER TABLE Orders ADD FOREIGN KEY (Id_P) REFERENCES Persons(Id_P)
ALTER TABLE Orders ADD CONSTRAINT fk_PerOrders FOREIGN KEY (Id_P) REFERENCES Persons(Id_P)
-- 删除外键
ALTER TABLE Orders DROP FOREIGN KEY fk_PerOrders

-- 添加 CHECK 约束
ALTER TABLE Persons ADD CHECK (Id_P>0)
ALTER TABLE Persons ADD CONSTRAINT chk_Person CHECK (Id_P>0 AND City='Sandnes')
-- 删除 CHECK 约束
ALTER TABLE Persons DROP CHECK chk_Person

-- 添加DEFAULT约束
ALTER TABLE Persons ALTER City SET DEFAULT 'SANDNES'
-- 删除DEFAULT约束
ALTER TABLE Persons ALTER City DROP DEFAULT

-- 更改自增偏移
ALTER TABLE Persons AUTO_INCREMENT=100
```

## 关系代数与关系演算

**关系代数** 运算：

运算 | 用途 | 表示法
--- | --- | ---
选择 | 选择满足条件的元组 | $\sigma_{\<select~cond\>}(R)$
投影 | 只选择指定的属性   | $\pi_{\<propperty~list\>}(R)$
连接 | 关系$R_1$和$R_2$中满足连接条件的元组 | $R_1\bowtie_{\<join~cond\>} R_2$
等值连接 | 上述运算的条件中只作相等判断 | $R_1\bowtie_{\<join~cond\>} R_2$
自然连接 | 消除等值连接中重复字段 | ${R_1}_{\*\<join~cond\>} R_2$
并  | 取并集 | $R_1\cup R_2$
交  | 取交集 | $R_1\cap R_2$
差  | 取差集 | $R_1 - R_2$
笛卡尔积 | 生成一个关系，其包含两者的所有属性，两者的所有组合 | $R_1 \times R_2$
除 | 生成一个关系，其中元组与$R_2$的每一组合都出现在$R_1$中 | $R_1(Z) \div R_2(Y)$

其他关系代数运算包括：

1. 广义投影。将属性的函数包含在投影列表中。
2. 聚集函数。对元组信息进行汇总。$_{\<group~propperty\>}\Im_{\<function~list\>}(R)$
3. 递归闭包。应用与同类型元组间的递归联系。
4. 外连接。左外连接将包括左元的所有元组，右外连接将包括右元的所有元组。
5. 外并。将并运算作用于部分相容的两个关系。

*查询树* 为一个与关系代数表达式对应的树状数据结构。其输入关系作为叶节点，关系代数运算作为中间节点。

**关系演算** 包括元组关系演算和域演算。 **元组关系演算** 的一般表达式为$\\\{t_1.A_j, t_2.A_k, ..., t_n.A_m|COND(t_1, t_2, ...,t_{n+m})\\\}$。公式中可以包括 *全称量词* $\forall$，和 *存在量词* $\exists$。 **域演算** 的变量为单个属性而非元组，其一般表达式为$\\\{x_1,x_2,...,x_n | COND(x_1,x_2,...,x_{n+m})\\\}$。

*安全表达式* 保证得到的结果是有限数目的元组。


# 概念建模与数据库设计

## 实体联系模型

**实体联系模型** （Entity-Relationship model）是广泛使用的高级概念数据模型，其图形表示法为 **E-R图** 。数据库设计的基本步骤：

1. 需求汇集和分析。记录数据需求与功能需求。
2. 对功能需求进行功能分析。
    1. 生成高层事务规范。
    2. 应用程序设计，事务实现。
3. 对数据需求进行概念设计。
    1. 生成概念模式（高层数据模型）
    2. 逻辑设计，生成逻辑模式（实现数据模型）
    3. 物理设计，生成内模式。

**实体** 是ER模型的基本对象，是现实世界中独立存在的事物， **实体类型** 是一个具有相同属性的实体的集合。在数据库特定时间某个类型的所有实体集合称为 **实体集** 。实体具有属性。 **复合属性** 由 **简单（原子）属性** 构成； **多值属性** 为同时存在多个值的属性； **派生属性** 由 **存储属性** 计算得到； **复杂属性** 为复合属性和多值属性的嵌套。 

> **弱实体类型** 不具有键属性，必须通过联系依赖于具有键属性的 **强实体类型** 。

**联系** 为ER模型中实体属性间的参照关系。实体间的 **联系类型** 在这些类型的实体间定义了一个关联的集合，称为 **联系集** ，由 **联系实例** 构成。联系类型的 **度** 是指参与联系的实体类型个数。度为2的联系类型称为 **二元联系** 。

> 二元联系的 **基数比** 指定了一个实体能够参与的联系实例的最大个数。

**参与约束** 指定一个实体的存在是否通过联系依赖于其他实体。 *最小基数约束* 指定了每个实体参与联系的最小个数。如果某个实体类型中的每个实体都参与到某个联系类型中，则称 **完全参与** ，或 **存在依赖** 。相对的是 **部分参与** 。


**增强的ER模型** （ **EER模型** ）是加入了语义数据模型特性的改进的ER模型。这些语义数据模型包括人工智能的 *知识表示* ，软件工程的 *对象建模* 等。

## 对象和对象关系数据库

面向对象的数据库称为 **对象数据库** （ODB），其管理系统称为 **对象数据管理系统** （Object Data Management Systems, ODMS）。主要概念包括：

1. 对象标识，由ODMS生成。
2. 类型构造器。如元组、包、集合、列表。
3. 封装操作。定义对象结构的同时也应定义其操作。
4. 类型层次和类型继承。允许使用类型层次来指定对象类型。
5. 多态和运算符重载
6. 外延。将某一类型的所有持久对象存储在一个外延里。

带有对象数据库扩展的关系模型称为 **对象-关系模型** 。

此后，ODMG（object data management group）提出了一系列的ODMG标准，包括ODMG对象模型、对象定义语言（ODL）、对象查询语言（OQL）、对OOPL的绑定。ODMG对象模型的基本构建块为对象和文字，两者都可以有一个复杂的结构其区别在于对象具有标识。

# 数据库性能

## 查询处理与优化算法

以下给出一个典型的高级查询处理的过程：

1. **扫描器** 识别语言标记如SQL关键字、属性名、关系名
2. **有效性检查** 根据被检索的数据库模式，验证有效性
3. SQL语句转换为关系代数，生成 **查询树** 或 **查询图** 
4. DBMS通过 **查询优化** 过程确定一个 **执行策略**
5. **代码生成器** 根据上述策略生成代码
6. **运行时数据库处理器** 编译运行或解释运行查询代码生成查询结果

**外排序算法** 将处理类似`ORDER BY`语句，适用于存储在磁盘的大文件。一般采用归并排序：先对每个小文件进行排序，然后进行归并。 **归并度** 定义为每次归并的文件个数。复杂度为 $2b+2b\\log_{d_M}n_R$，其中因子 $2$ 为读和写，$b$ 为块数，$n_R$ 为总块数。

**选择算法** 包括 **S1线性搜索** （蛮力查找）、 **S2二分查找** （要求比较运算）、 **S3a利用索引** 、 **S3b利用散列键** （只支持候选键）、 **S4主索引检索多条记录** 、 **S5聚簇索引检索多条记录** 、 **S6辅助索引（B+树）处理相等判断** 等。

**二路连接** 指对两个文件的连接，如果涉及多个文件则称为 **多路连接** 。算法包括 **J1嵌套循环连接** （蛮力）、 **J2单循环连接** （要求索引）、 **J3排序-归并连接** 、 **J4分区-散列连接** 等。

**集合运算** 可以采用散列法。

利用关系代数运算，可以将代价较高的 **初始查询树** 转换为代价较低的 **最终查询树** 。

## 事务与并发

根据并发使用的用户数量，DBMS分为 **单用户** 系统和 **多用户** 系统。数据库中的并发控制大多是基于 **交替并发** 理论发展而来。

**事务的边界** 可以由 *开始事务* 和 *结束事务* 来显式定义。根据其行为将事务可以分为 *只读事务* 和 *读写事务* 。事务将数据库看做 *命名数据项* 的集合，数据项大小成为 **粒度** 。

并发执行可能遇到的问题有：

1. 更新丢失。写操作被其他事务覆盖了。
2. 暂时更新。可能错误的暂时写在恢复前已经被其他事务读取。
3. 错误求和。执行聚集函数时另一个事务更改了某些项。
4. 不可重复读。即两次读取得到的值不一致。

**可恢复调度** ：如果调度S中的事务T读取某个数据X，知道所有写X的事务T'都已提交，T才提交，则调度是 **可恢复的** 。如果每个事务只读取已提交事务的数据项，则该调度是 **无级联的（避免级联回滚的）** 。如果最后一个写X的事务提交之前，其他事务都不能读写该项，则称 **严格调度** 。

> 严格调度中，撤销事务的写操作很简单，只需要恢复X的 **前映像** 。

**串行的调度** ：对于调度S中的每个事务T，如果T的所有操作在调度中都是连续执行的，则调度是串行的。

并发控制中，需要对数据项加锁，包括 **二进制锁** （两种状态）、 **读写（共享/排他）锁** 。在事务执行过程中，可以通过 **锁变换** 进行 *锁升级* 或 *锁降级* 。

**两阶段加锁协议** （two-phase locking protocol）包括两个阶段： **扩展** 阶段只允许加锁，不能释放任何锁； **收缩** 阶段则只能释放锁。可以证明，该协议可以保证调度是可串行的。

上述为 **基本的2PL** ； **保守2PL** 要求预先声明要锁定的数据项，如果某一项不能锁定则该事务不能锁定任何项，这一协议是免死锁的； **严格2PL** 要求在提交或撤销前不是放任何排他锁，这一协议不是免死锁的，但可以保证严格调度； **精确2PL** 则更具限制性，在提交或撤销前，不释放任何锁。

并发通常会引起 *死锁* 和 *饥饿* 。应采取死锁预防和检测方法、FIFS策略等。

**数据项的粒度** 太大则并发度低；太小则伴随更多的锁和更多的锁操作。引入 **多粒度加锁协议（MGL）** 允许不同的事务采用不同粒度的锁。

*索引加锁* 可以解决 *幻想问题* ：在更新操作同时进行的查询结果是不确定的。类似的还有 *谓词加锁* 等等。
