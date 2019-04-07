## 数据类型与操作数据表

查找当前使用的数据库:
```sql
select database();
```

查询当前数据库的版本:
```sql
select version();
```

查询当前的时间:
```sql
select now();
```

展示所有的数据库:
```sql
show databases;
```

展示所有的表:
```sql
show tables;
```

```sql
create table user(
id smallint key auto_increment //设置主键，自动递增，从1 开始；
name varchar(20) unquie key not null //设置唯一约束，变长20.char为定长，如果不够长度，会以空格补充
pid smallint not null default 10
)
```
```sql
drop table user; //删除表user
show columns from user; //展示user表的结构

show create table user;//展示表的创建情况以及约束情况

alter table user rename user1; //修改表的名字

alter table user modify pid smallint unsigned not null; //修改字段的类型 符号 约束

alter table user change pid p_id smallint unsign not null; //修改字段的名称，类型，符号，约束

alter table user add age smallint after username; //添加字段 在username之后 如果first 则是置顶

alter table user alter pid set default 10 //设置字段的默认约束

alter table user alter pid drop default //删除字段的默认约束

alter table user add  constraint pk_const_id primary key (id); //添加主键约束 constraint ok_const_id  设置外键的key值 ，可有可无，不设置系统会给默认

alter table user drop primary key; //删除主键约束 如果带有auto_increment属性，需要先删除自增属性，alter table user modify id smallint;然后再进行主键约束的删除;

alter table user add constraint pk_const_pid unique (pid); //添加唯一约束,constraint ok_const_pid  设置外键的key值 ，可有可无，不设置系统会给默认

删除唯一约束跟索引：先用show indexes from user\G; //查询索引keyname，  然后根据keyname  alter table user drop index keyname;

alter table user add foreign key (pid) references provice(id); //添加外键约束 provice为参照 

删除外键约束：先用show create table user; //询CONSTRAINT，  然后根据keyname ; alter table user drop foreign key keyname;
```

## 操作表的记录

```sql
省略名称插入 insert user values(null,'jgchen',11),(null,'Json',22),(null,'Json',22);批量插入，全部不可以省略

有名称的插入 insert user(username,pid) values('Tom',12);部分可以省略

更新记录 update user set age=age+5; 所有记录的年龄增加5
        update user set age=age+10  where id%2=0; id为偶数的记录年龄增加10

删除记录 delete from user where id=6;删除id=6的记录

多表链接查询 select user.id,user.username from user;

起别名 select id as userId,username from user;

分组 select sex from user group by sex;

条件分组 SELECT sex,count(id) FROM user GROUP BY sex;

对查询结果进行排序 select * from user order by id desc; 降序 select * from user order by id asc;升序

限制查询结果 select * from user limit 2;限制查询2条
            select * from user limit 2,3 从第三条开始查询3条
```
## 子查询

 数据准备:
 ```sql
  CREATE TABLE IF NOT EXISTS tdb_goods(
    goods_id    SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    goods_name  VARCHAR(150) NOT NULL,
    goods_cate  VARCHAR(40)  NOT NULL,
    brand_name  VARCHAR(40)  NOT NULL,
    goods_price DECIMAL(15,3) UNSIGNED NOT NULL DEFAULT 0,
    is_show     BOOLEAN NOT NULL DEFAULT 1,
    is_saleoff  BOOLEAN NOT NULL DEFAULT 0
  );

INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('R510VC 15.6英寸笔记本','笔记本','华硕','3399',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('Y400N 14.0英寸笔记本电脑','笔记本','联想','4899',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('G150TH 15.6英寸游戏本','游戏本','雷神','8499',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('X550CC 15.6英寸笔记本','笔记本','华硕','2799',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('X240(20ALA0EYCD) 12.5英寸超极本','超级本','联想','4999',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('U330P 13.3英寸超极本','超级本','联想','4299',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('SVP13226SCB 13.3英寸触控超极本','超级本','索尼','7999',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('iPad mini MD531CH/A 7.9英寸平板电脑','平板电脑','苹果','1998',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('iPad Air MD788CH/A 9.7英寸平板电脑 （16G WiFi版）','平板电脑','苹果','3388',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES(' iPad mini ME279CH/A 配备 Retina 显示屏 7.9英寸平板电脑 （16G WiFi版）','平板电脑','苹果','2788',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('IdeaCentre C340 20英寸一体电脑 ','台式机','联想','3499',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('Vostro 3800-R1206 台式电脑','台式机','戴尔','2899',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('iMac ME086CH/A 21.5英寸一体电脑','台式机','苹果','9188',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('AT7-7414LP 台式电脑 （i5-3450四核 4G 500G 2G独显 DVD 键鼠 Linux ）','台式机','宏碁','3699',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('Z220SFF F4F06PA工作站','服务器/工作站','惠普','4288',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('PowerEdge T110 II服务器','服务器/工作站','戴尔','5388',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('Mac Pro MD878CH/A 专业级台式电脑','服务器/工作站','苹果','28888',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES(' HMZ-T3W 头戴显示设备','笔记本配件','索尼','6999',DEFAULT,DEFAULT);

 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('商务双肩背包','笔记本配件','索尼','99',DEFAULT,DEFAULT);

 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('X3250 M4机架式服务器 2583i14','服务器/工作站','IBM','6888',DEFAULT,DEFAULT);
 
 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('玄龙精英版 笔记本散热器','笔记本配件','九州风神','',DEFAULT,DEFAULT);

 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES(' HMZ-T3W 头戴显示设备','笔记本配件','索尼','6999',DEFAULT,DEFAULT);

 INSERT tdb_goods (goods_name,goods_cate,brand_name,goods_price,is_show,is_saleoff) VALUES('商务双肩背包','笔记本配件','索尼','99',DEFAULT,DEFAULT);
```

```sql
//求平均值取小数点后两位
 select round(avg(goods_price),2) from tdb_goods;
//查询比平均值大的记录
 select * from tdb_goods where goods_price >=(select round(avg(goods_price),2) from tdb_goods);
 ```