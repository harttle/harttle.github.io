---
layout: blog
categories: misc
title: MySQL 学习笔记
tags: SQL 数据库 MySQL Bash
redirect_from:
  - /misc/mysql-note.html
  - /2015/05/03/mysql-note/
---

在使用Django时学习过一些MySQL，暂作小记在此。小编的Django笔记在这里：
[Django 搭建过程记录](/2015/05/15/django-startup.html)


MySQL官方文档在这里：

http://dev.mysql.com/doc/refman/5.1/zh/sql-syntax.html

# database

查看所有

```sql
show databases;
```

进入

```sql
use db_name;
```

删除

```sql
drop database db_name;
```

# table

查看所有

```sql
show tables;
```

查看结构

```sql
desc tb_name
```

修改表名

```sql
alter table tb_name rename to bbb;
```
		
添加字段

```sql
alter table tb_name add column col_name varchar(30);
//添加主键
alter table tb_name add col_name int(5) unsigned default 0 not null auto_increment ,add primary key (tb_name);
```
		
删除字段

```sql
alter table tb_name drop column col_name;
```
		
修改字段名

```sql
alter table tb_name change col_name new_col_name int;
```
		
修改字段属性

```sql
alter table tb_name modify col_name varchar(22);
```

<!--more-->

# row

查找

```sql
SELECT [col1,col2]|* FROM table_name
```

修改

```sql
UPDATE table_name SET col1 = val1, col2 = val2 WHERE col3 = val3
```

删除

```sql
DELETE FROM tb_name WHERE col1 = val1
```

# 用户管理

修改root密码

```sql
mysqladmin -u root password 'somepassword'
```

登录

```sql
mysql [-h hostname] -u username|root -p
```

# 数据备份

导入

```sql
mysql -u root -p dbname < /path/to/file.sql 
```

导出
		
```bash
//export database
mysqldump [-h localhost] -u root -p dbname > /path/to/dbname.sql 

//export table
mysqldump [-h localhost] -u root -p dbname tablename > /path/to/tablename.sql

//export database structure
mysqldump [-h localhost] -u root -p dbname --add-drop-table > /path/to/dbname_struct.sql 
```
