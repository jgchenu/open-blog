//Router 的构造函数
function Router(callback) {
    this.routes = {}; //将对应路径的执行函数存入一个map里 
    this.routeHistory = []; //存当前的hash路由记录栈
    this.currentUrl = ''; //当前的url
    this.currentIndex = -1; //当前的url在路由栈对应的索引值
    this.frontOrBack = false; //是否是前进或者后退
    this.callback = callback; //把Router构造函数传入的callback存起来
}
//route 注册路由元函数，将对应路径的执行函数存入一个map里
Router.prototype.route = function (path, callback) {
    this.routes[path] = callback || function () {};
}
//页面初始化跟hash url改变时候触发的回调函数
Router.prototype.refresh = function () {
    if (this.frontOrBack) {
        this.frontOrBack = false;
    } else {
        var find = tabs.find(item => {
            return item.path === window.location.hash.slice(1);
        })
        console.log(find)
        if (!find) {
            return window.location.hash = '/index'
        }
        this.currentUrl = find.path;
        //如果这个时候不是点击了前进跟后退，而是直接点击了hash路由地址，那么会在当前地址上压入一个新的路由地址，并且当前地址后面的路由地址都被清除了
        this.routeHistory = this.routeHistory.slice(0, this.currentIndex + 1);
        // window.location.hash=this.currentUrl;
        this.routeHistory.push(this.currentUrl);
        this.currentIndex++;
    }
    this.routes[this.currentUrl]();
    this.callback(this.currentIndex, this.routeHistory)
}
Router.prototype.back = function () {
    if (this.currentIndex > 0) {
        this.frontOrBack = true;
        this.currentIndex--;
        this.currentUrl = this.routeHistory[this.currentIndex];
        window.location.hash = this.currentUrl; //window.location.hash='/hash'跟window.location.hash='#/hash'

    }
}
Router.prototype.front = function () {
    if (this.currentIndex < this.routeHistory.length - 1) {
        this.frontOrBack = true;
        this.currentIndex++;
        this.currentUrl = this.routeHistory[this.currentIndex]
        window.location.hash = this.currentUrl;
    }
}
Router.prototype._init = function () {
    //将this绑定到Router实例，避免默认绑定到事件的对象：window
    window.addEventListener('load', this.refresh.bind(this));
    window.addEventListener('hashchange', this.refresh.bind(this));
}


const router = new Router((currentIndex, routeHistory) => {
    if (backDom) {
        //如果当前路由的前面还有路由，因为初始路由index为0
        if (currentIndex > 0) {
            backDom.classList.add('active');
        } else {
            backDom.classList.remove('active');
        }
    }
    if (frontDom) {
        if (currentIndex < routeHistory.length - 1) {
            frontDom.classList.add('active');
        } else {
            frontDom.classList.remove('active')
        }
    }
})
var backDom = document.querySelector('.nav-area-back');
var frontDom = document.querySelector('.nav-area-front')
backDom.addEventListener('click', function () {
    router.back();
})
frontDom.addEventListener('click', function () {
    router.front();
})
const tabs = [{
        name: '推荐',
        path: '/index'
    },
    {
        name: '排行榜',
        path: '/rank'
    },
    {
        name: '歌单',
        path: '/songList'
    },
    {
        name: '主播电台',
        path: '/broadcast'
    },
    {
        name: '最新音乐',
        path: '/newest'
    }
]
tabs.forEach(item => {
    router.route(item.path, function () {
        var tabName = item.path.split('/')[1]
        var tabDom = document.querySelectorAll('.main-box');
        var navDom = document.querySelectorAll('.nav-item');
        for (var i = 0; i < tabDom.length; i++) {
            (function (i) {
                if (tabDom[i].classList.contains(tabName)) {
                    tabDom[i].classList.add('main-box-show')
                } else {
                    tabDom[i].classList.remove('main-box-show')
                }
            })(i)
        }
        for (var i = 0; i < navDom.length; i++) {
            (function (i) {
                if (navDom[i].classList.contains(tabName)) {
                    navDom[i].classList.add('active')
                } else {
                    navDom[i].classList.remove('active')
                }
            })(i)
        }
    })
})
router._init();
