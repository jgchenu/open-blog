1.window.onload
1）页面上所有的DOM，样式表，脚本，图片，flash所有元素都已经加载完成了,会触发window.onload事件
2) window.onload不能同时编写多个，如果有多个window.onload方法，只会执行一个，等价于$(window).load(function(){})

用法:window.onload=function(){

}
2.DOMContentLoaded
1)仅当DOM加载完成，不包括样式表，图片，flash

2)经常遇到的情况：就是需要给一些元素的事件绑定处理函数。但问题是，如果那个元素还没有加载到页面上，但是绑定事件已经执行完了，那么绑定事件是没有效果的。所以最好的方式就是等到DOM加载完了，才获取dom，进行绑定。

3)DOMContentLoaded机制比onload更加合理，我们可以容忍图片，flash延迟加载，却不可以容忍看见内容后页面不可交互。因为这样会让用户觉得网页卡主了，然后直接就离开网页了。

用法:
document.addEventListener('DOMContentLoaded',function(){
     alert(1);},
false);
3.$(document).ready(function(){})
1)当 DOM（文档对象模型） 已经加载，会发生 ready 事件，DOM结构绘制完毕后就执行，不必等到所有加载完毕。

2)此方法与DOMContentLoaded类似，在DOMContentLoaded未出现的之前，网站都用jq的这种方法模拟DOMContentLoaded的效果。

3)$(document).ready()可以同时编写多个，并且都可以得到执行.

用法:
$(document).ready(function(){
  $(".btn1").click(function(){
    $("p").slideToggle();
  });
});