在无论是单页跟多页工程化开发中，都有一个入口文件，名为"index.html"，直接引入以下两段代码
```html
<script src="https://as.alipayobjects.com/g/component/fastclick/1.0.6/fastclick.js"></script>
<script
  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function () {
      FastClick.attach(document.body);
    }, false);
  }
  let htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;
  let htmlDom = document.getElementsByTagName('html')[0];
  if (htmlWidth > 750) {
    htmlWidth = 750;
  }
  htmlDom.style.fontSize = htmlWidth / 20 + 'px';
></script>
```


第一段是为了解决移动端300ms延迟

第一段是将每个rem分为屏幕宽度的1/20，每个rem的比例都是可以自己调的，以及对于超过750px像素进行限制