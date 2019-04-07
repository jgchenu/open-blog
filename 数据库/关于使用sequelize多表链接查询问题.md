在使用sequelize 中，在模型关联上，遇到了挺多坑，官方文档也看得是一知半解。

举例说明

```js
model.user{
id:INTERGER,
institution_id:INTERGER
}

model.institutions{
id:INTERGER,
name:STRING
}
```

通过例子来捋清楚逻辑

假如我现在有一个需求查询用户以及所属的组织；
那么在关联关系上 我要先查出来用户，然后再根据用户的institution_id来查用户的组织；
也就是左链接查询
```js
LEFT OUTER JOIN `institutions` AS `institution` ON `user`.`institution_id` = `institution`.`id`;
```
那么需要编译后的sql代码是这样的，我需要将其关联起来，要怎么去关联呢。
```js
model.user.associate= function (models) {
models.user.belongsTo(models.institutions, {
foreignKey: 'institution_id',
targetKey: 'id',
constraints: false,
})
}
```

源模型为`user`，目标模型为`institutions`，所以 以 `user` 为主要关系查出来的就是用`user的foreignKey`===`institutions的targetKey`;查出来的数据，就是以user为主，institutions为辅的数据

假如我现在有一个需求查询用户以及所属的组织；

```js
OUTER JOIN `user` AS `user` ON `institutions`.`id` = `user`.`institution_id`;
```
那么需要编译后的sql代码是这样的，我需要将其关联起来，要怎么去关联呢。

```js
model.user.associate= function (models) {
models.institutions.hasMany(models.user, {
foreignKey: 'institution_id',
sourceKey: 'id',
constraints: false,
})
}
```
源模型为`institutions`，目标模型为`user`，所以 以`institutions`为主要关系查出来的就是用`institutions的sourceKey`===`institutions的foreignKey`,查出来的数据，就是以institutions为主，user为辅的数据