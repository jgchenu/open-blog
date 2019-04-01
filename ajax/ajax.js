function formateData(data) {
    var arr = [];
    //for(let val of [1,2,3]) 是对数组值进行遍历，只有数组可以用
    //for (let key in [1,2,3]或者{a:1,b:2}) 数组取的是索引，对象取的是属性
    for (let key in data) {
        arr.push(encodeURIComponent(key) + '=' + data[key])
    }
    return arr.join('&');
}

//ajax 实现的大概思路是 取一个params的对象参数，对里面的data进行序列化处理，
//formatData函数序列化处理便于GET请求携带变量参数 ，或者POST等其他请求的请求头设置为Content-type:application/x-www-form-urlencoded，请求体内容进行序列化
//当POST方法时候 send(请求体内容)
//当GET方法时候  xhr.open(方法，地址+参数，异步boolean)
//设置onreadystatechange函数回调或者onload函数毁掉
function ajax(params) {
    params = params || {};
    params.data = params.data || {};
    params.data = formateData(params.data)
    var xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    params.method = (params.method || 'GET').toUpperCase();
    if (params.method === 'GET') {
        xhr.open(params.method, params.url + '?' + params.data, true)
        xhr.send();
    } else {
        xhr.open(params.method, params.url, true);
        // 设置 Content-Type 为 application/x-www-form-urlencoded
        // 以表单的形式传递数据 
        // 使用 xhr.send('username=admin&password=root')这样的格式

        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send(params.data);
    }
    // readyState有五种可能的值：
    // 0 (未初始化)： (XMLHttpRequest)对象已经创建，但还没有调用open()方法。
    // 1 (载入)：已经调用open() 方法，但尚未发送请求。
    // 2 (载入完成)： 请求已经发送完成。
    // 3 (交互)：可以接收到部分响应数据。
    // 4 (完成)：已经接收到了全部数据，并且连接已经关闭。
    //当然我们可以用onload来代替onreadystatechange等于4的情况，因为onload只在状态为4的时候才被调用，代码如下：
    // 这里有两种写法，第一种写法：当xhr.readyState===4的时候，会触发onload事件，直接通过onload事件 进行回调函数处理
    //对于xhr.responseText 进行JSON。parse解析 并且 调用parms。success.call(xhr,res) 对于返回数据传递到成功回调函数
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status <= 206 || xhr.status === 304) {
            var res;
            if (params.success && params.success instanceof Function) {
                res = JSON.parse(xhr.responseText);
                params.success.call(xhr, res);
            }
        } else {
            if (params.error && params.error instanceof Function) {
                res = xhr.responseText;
                params.error.call(xhr, res);
            }
        }

    }
    //第二种写法，当xhr.readyState===4时候，说明请求成功返回了，进行成功回调
    // xhr.onreadystatechange = function () {
    //     // console.log(xhr.readyState)
    //     if (xhr.readyState === 4) {
    //         // 进行onload里面的处理函数
    //     }
    // }
}
//跨域jsonp请求
//jsonp请求的第一步需要取一个params对象的jsonp属性的值作为callbackname的值，callback参数的值为callbackname
//然后取到head节点，创建script标签，
function jsonp(params) {
    //先对params进行处理，防止为空
    params = params || {};
    params.data = params.data || {};
    //后台传递数据时调用的函数名
    var callbackName = params.jsonp;
    // 拿到dom元素head，先不进行操作
    var head = document.querySelector('head');
    //创建script元素，先不进行操作
    var script = document.createElement('script');
    //传递给后台的data数据中，需要包含回调参数callback。
    //callback的值是 一个回调函数的函数名，后台通过该回调函数名调用传递数据，这个参数名的key由双方约定，默认为callback
    params.data['callback'] = callbackName;
    //对data数据进行格式化
    var data = formateData(params.data);
    //设置script请求的url跟数据
    script.src = `${params.url}?${data}`;
    //全局函数 由script请求后台，被调用的函数，只有后台成功响应才会调用该函数
    window[callbackName] = function (jsonData) {
        //请求移除scipt标签
        head.removeChild(script);
        clearTimeout(script.timer);
        window[callbackName] = null;
        params.success && params.success(jsonData)
    }
    //请求超时的处理函数
    if (params.time) {
        script.timer = setTimeout(() => {
            //请求超时对window下的[callbackName]函数进行清除，由于有可能下次callbackName发生改变了
            window[callbackName] = null;
            //移除script元素，无论请求成不成功
            head.removeChild(script)
            //这里不需要清除定时器了，clearTimeout(script.timer); 因为定时器调用之后就被清除了

            //调用失败回调
            params.error && params.error({
                message: '超时'
            })
        }, time);
    }
    //往head元素插入script元素，这个时候，script就插入文档中了，请求并加载src
    head.appendChild(script);
    //无论是请求超时，还是请求成功，都要移除script元素，script元素只有在第一次插入页面文档的时候，才会请求src
    //无论请求失败还是成功，都还是要移除window[callbackName]避免增加没用的全局方法，因为每次请求的callbackName可能是不同的
    //之前有个无聊的问题：为啥jsonp只能是get请求呢？看了实现过程，知道其实是因为script的加载就是get方式的~
}