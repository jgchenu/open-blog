## css垂直水平居中布局
### 1.水平居中的 margin：0 auto;

关于这个，大家也不陌生做网页让其居中用的比较多,
这个是用于子元素上的，前提是不受float影响
```html
<style>
    *{
        padding: 0;
        margin: 0;
    }
        .box{
            width: 300px;
            height: 300px;
            border: 3px solid red;
            /*text-align: center;*/
        }
        img{
            display: block;
            width: 100px;
            height: 100px;
            margin: 0 auto;
        }
    </style>

<!--html-->
<body>
    <div class="box">
        ![](img1.jpg)
    </div>
</body>
```
![1](https://user-gold-cdn.xitu.io/2017/2/20/a197936986bcaf6e105b83201276d1b6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
### 2.水平居中 text-align：center；

在父元素上添加效果让它进行水平居中
```html
<style>
    *{
        padding: 0;
        margin: 0;
    }
        .box{
            width: 300px;
            height: 300px;
            border: 3px solid red;
            text-align: center;
        }
        img{
           
            width: 100px;
            height: 100px;
            
        }
    </style>

<!--html-->
<body>
    <div class="box">
        ![](img1.jpg)
    </div>
</body>
```
![2](https://user-gold-cdn.xitu.io/2017/2/20/a197936986bcaf6e105b83201276d1b6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
### 3.水平垂直居中（一）定位和需要定位的元素的margin减去宽高的一半
这种方法的局限性在于需要知道需要垂直居中的宽高才能实现，经常使用这种方法
```html
    <style>
        *{
            padding: 0;
            margin: 0;
        }
        .box{
            width: 300px;
            height: 300px;
            background:#e9dfc7; 
            border:1px solid red;
            position: relative;
        }
        img{
            width: 100px;
            height: 150px;
            position: absolute;
            top: 50%;
            left: 50%;
            margin-top: -75px;
            margin-left: -50px;
        }
    </style>
<!--html -->
<body>
    <div class="box" >
        ![](2.jpg)
    </div>
</body>
```

![3](https://user-gold-cdn.xitu.io/2017/2/20/9ed006298676f7dea7794ed96d7544cf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
### 4.水平垂直居中（二）定位和margin:auto;
这个方法也很实用，不用受到宽高的限制,也很好用
```html
    <style>
        *{
            padding: 0;
            margin: 0;
        }
        .box{
            width: 300px;
            height: 300px;
            background:#e9dfc7; 
            border:1px solid red;
            position: relative;

        }
        img{
            width: 100px;
            height: 100px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
        }
    </style>
<!--html -->
<body>
    <div class="box" >
        ![](3.jpg)
    </div>
</body>
```
![](https://user-gold-cdn.xitu.io/2017/2/20/7aae06f55f804d0d39563eb22dbf64d6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
### 5.水平垂直居中（三）绝对定位和transfrom
这个方法比较高级了，用到了形变，据我所知很多大神喜欢使用这个方法进行定位，逼格很高的，学会后面试一定要用！
```html
<style>
    *{
        padding: 0;
        margin: 0;
    }
    .box{
        width: 300px;
        height: 300px;
        background:#e9dfc7; 
        border:1px solid red;
        position: relative;

    }
    img{
        width: 100px;
        height: 100px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
    }
</style>
<!--html -->
<body>
    <div class="box" >
        ![](4.jpg)
    </div>
</body>
```
![](https://user-gold-cdn.xitu.io/2017/2/20/2a8fa4c9b9ec331dc8d7ea8e31e26d18?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 6.水平垂直居中（四）diplay：table-cell

其实这个就是把其变成表格样式，再利用表格的样式来进行居中，很方便
```html
<style>
    .box{
            width: 300px;
            height: 300px;
            background:#e9dfc7; 
            border:1px solid red;
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }
        img{
            width: 100px;
            height: 150px;
            /*margin: 0 auto;*/  这个也行
        }
</style>
<!--html -->
<body>
    <div class="box" >
        ![](5.jpg)
    </div>
</body>
```
![](https://user-gold-cdn.xitu.io/2017/2/20/06b02f49998122463276af8c176480d0?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
### 7.水平垂直居中（五）flexBox居中

这个用了C3新特性flex,非常方便快捷，在移动端使用完美，pc端有兼容性问题，以后会成为主流的
```html
<style>
    .box{
            width: 300px;
            height: 300px;
            background:#e9dfc7; 
            border:1px solid red;
            display: flex;
            justify-content: center;
            align-items:center;
        }
        img{
            width: 150px;
            height: 100px;
        }
</style>
<!--html -->
<body>
    <div class="box" >
        ![](6.jpg)
    </div>
</body>
```
![](https://user-gold-cdn.xitu.io/2017/2/20/85d8427ac29edad81f9a95b81e997aac?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)