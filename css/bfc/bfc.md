#### BFC的原理（渲染规则）：

* 1.在BFC元素垂直方向的边距会发生重叠；
* 2.BFC的区域不会与浮动元素的box重叠，可用来清除浮动和布局的；
* 3.BFC在页面上是一个独立的容器，外面的元素不会影响里面的元素，反之，里面的元素不会影响外面的元素；
* 4.计算BFC高度的时候，浮动元素也会参加计算。
  
#### 如何创建BFC？
  
* 1.position的值不为static或者relative；
* 2.display属性值为inline-block, table-cell, 和 table-caption，table;
* 3.overflow的值不为visiable，即overflow:auto;/overflow:hidden都可创建BFC
