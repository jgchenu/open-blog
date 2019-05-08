function Vue(options) {
    this._init(options);
}
Vue.prototype._init = function (options) {
    this.$options = options; // options 为上面使用时传入的结构体，包括el,data,methods
    this.$el = document.querySelector(options.el); // el是 #app, this.$el是id为app的Element元素
    this.$data = options.data; // this.$data = {number: 0}
    this.$methods = options.methods; // this.$methods = {increment: function(){}}
    this._binding = {}; //_binding保存着model与view的映射关系，也就是我们前面定义的Watcher的实例。当model改变时，我们会触发其中的指令类更新，保证view也能实时更新
    this._obverse(this.$data)
    this._compile(this.$el)
}
//使用defineProperty 重写data属性的get跟set
Vue.prototype._obverse = function (obj) {
    var _this = this;
    Object.keys(obj).forEach(function (key) {
        _this._binding[key] = {
            _directives: []
        }
        var value = obj[key];
        if (typeof value === 'object') {
            _this._obverse(value)
        }
        //相当于发布订阅模式，用data的key->bing(obj)->directives([])来收集watch实例
        //每次更新 去遍历directives里面改属性所有的watch实例，去触发他们的更新方法
        var binding = _this._binding[key]
        console.log(binding)
        Object.defineProperty(_this.$data, key, {
            enumerable: true,
            configurable: true,
            get: function () {
                console.log(`获取了${value}`)
                return value
            },
            set: function (newVal) {
                console.log(`更新${newVal}`);
                if (value !== newVal) {
                    value = newVal;
                }
                binding._directives.forEach(function (item) {
                    item.update();
                })
            }
        })
    })
}
//对于指令v-bind，v-model ，v-click进行解析
Vue.prototype._compile = function (root) {
    var _this = this;
    var nodes = root.children;
    for (var i = 0; i < nodes.length; i++) {
        (function (i) {
            var node = nodes[i];
            if (node.children.length) {
                _this._compile(node);
            }
            // 如果有v-click属性，我们监听它的onclick事件，触发increment事件，即number++
            if (node.hasAttribute('v-click')) {
                node.onclick = (function () {
                    var attrVal = node.getAttribute('v-click')
                    return _this.$methods[attrVal].bind(_this.$data)
                })()
            }

            if (node.hasAttribute('v-model') && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
                node.oninput = (function () {
                    //利用闭包 把i的值存下来
                    var attrVal = node.getAttribute('v-model');
                    _this._binding[attrVal]._directives.push(
                        new Watcher(
                            'input',
                            node,
                            _this,
                            attrVal,
                            'value'
                        ))
                    return function () {
                        _this.$data[attrVal] = node.value; // 使number 的值与 node的value保持一致，已经实现了双向绑定
                    }
                })();
            }
            if (node.hasAttribute('v-bind')) {
                var attrVal = node.getAttribute('v-bind');
                _this._binding[attrVal]._directives.push(new Watcher(
                    'text',
                    node,
                    _this,
                    attrVal,
                    'innerHTML'
                ))
            }
        })(i)


    }
}


function Watcher(name, el, vm, attr, domAttr) {
    this.name = name; //指令绑定的dom节点名称如‘input’，‘text’
    this.el = el; //指令对应的DOM元素
    this.vm = vm; //指令所属Vue实例
    this.attr = attr; //指令对应的data的属性值，本例如"number"
    this.domAttr = domAttr; //实际dom绑定的属性值，input对应value,普通标签对应'innerHTML'
    this.update();
}
Watcher.prototype.update = function () {
    this.el[this.domAttr] = this.vm.$data[this.attr];
    //比如 input.value = this.data.number;
    //input改变时候，会触发input函数，然后重新设置number，导致触发Object.defineProperty代理的number属性，
    //从而触发这个number属性对应的directors的watchers收集数组，遍历会触发watcher的update函数，保证对应的DOM内容进行了更新。
}