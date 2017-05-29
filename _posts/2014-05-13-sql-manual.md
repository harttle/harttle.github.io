---
layout: blog
title: SQL 命令手册
tags: MySQL SQL 引用 排序 字符串 数据库
---

SQL 是一门 ANSI 的标准计算机语言，用来访问和操作数据库系统。有些命令不同的RDBMS中不一致，以MySQL为例。

<!--more-->

# DATABASE

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

# TABLE

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


# SELECT

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

# WHERE

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

# JOIN/UNION

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

# UPDATE

```sql
-- 更新列
UPDATE Person SET FirstName = 'Fred' WHERE LastName = 'Wilson' 
UPDATE Person SET Address = 'Zhongshan 23', City = 'Nanjing'
WHERE LastName = 'Wilson'
```
# DELETE

```sql
-- 条件删除
DELETE FROM Person WHERE LastName = 'Wilson' 

-- 删除所有行
DELETE FROM table_name
DELETE * FROM table_name
```

# INSERT INTO

```sql
-- 插入行
INSERT INTO Persons VALUES ('Gates', 'Bill', 'Xuanwumen 10', 'Beijing')

-- 只给出指定列
INSERT INTO Persons (LastName, Address) VALUES ('Wilson', 'Champs-Elysees')
```

# INDEX

```sql
-- 创建索引
CREATE INDEX PersonIndex ON Person (LastName) 

-- 降序索引、多列索引
CREATE INDEX PersonIndex ON Person (LastName DESC, FirstName)

-- 删除索引
ALTER TABLE table_name DROP INDEX index_name
```

# VIEW

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

# CONSTRAIN

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

