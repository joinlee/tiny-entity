# tiny-entity 
## 0.9.14
## 0.9.12
## 0.9.8
## 0.9.5

v0.9.4 
1. 防止sql注入
2. 解决事务嵌套的问题

v0.9.3

v0.9.2
1. 修复了mysql中的where null 的查询bug

v0.9.0
1. 修复了nedb查询的部分bug
2. ctx 中增加了DeleteAll 方法

v0.8.10
1. 修复mysql create方法传入字符串数字被转化成number类型的bug。

v0.8.9
1.修复mysql contains 方法参数引用的bug；
2.修复了mysql toList 方法异常后清空sqltemp等内部参数的bug；

v0.8.8
1. 新增了一些单元测试
2. 修复了mysql 事务处理的bug
3. join 可以固定指向主表

v0.8.0
1. mysql nedb 增加了join方法。
2. 新增了单元测试。

v0.6.14
1. 修复了<， > 的mysql查询不生效的问题

v0.6.8
1. 支持模糊查询

v 0.6.4

1. nedb 实现select方法