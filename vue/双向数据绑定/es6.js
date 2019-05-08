function Vue(options) {
    this._init(options)
}
Vue.prototype._init = function (options) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$methods = options.methods
    this._binding = {};
    this._obverse(this.$data);
    this._compile(this.$el)
}
Vue.prototype._obverse = function (obj) {
    Object.keys(obj).forEach((key) => {
        this._binding[key] = {
            directives: []
        }
        let value = obj[key];
        if (typeof value === 'object') {
            this._obverse(value);
        }
        Object.defineProperty(this.$data, key, {
            enumerable: true,
            configurable: true,
            get: () => {
                return value;
            },
            set: (newVal) => {
                if (newVal !== value) {
                    value = newVal;
                }
                this._binding[key].directives.forEach(watcher => {
                    watcher.update(); //遍历 Watcher的实例数组 watchers
                })
            }
        })
    })
}

Vue.prototype._compile = function (root) {
    let nodes = root.children;
    for (var i = 0; i < nodes.length; i++) {
        //如果不使用块级作用域的话，那么要使用匿名函数创造一个函数作用域，详情看index.js.否则node取到的是最后一个node=nodes[nodes.length-1]
        let node = nodes[i];
        if (node.children.length) {
            this._compile(node);
        }
        if (node.hasAttribute('v-bind')) {
            let attr = node.getAttribute('v-bind');
            this._binding[attr].directives.push(new Watcher(
                'text',
                node,
                this,
                attr,
                'innerHTML'
            ))
        }
        if (node.hasAttribute('v-click')) {
            let attr = node.getAttribute('v-click')
            node.onclick = (() => {
                return this.$methods[attr].bind(this.$data);
            })()
        }
        if (node.hasAttribute('v-model') && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
            let attr = node.getAttribute('v-model')
            node.oninput = (() => {
                this._binding[attr].directives.push(new Watcher(
                    'input',
                    node,
                    this,
                    attr,
                    'value'
                ))
                return () => {
                    this.$data[attr] = node.value;
                }
            })()
        }
    }
}

function Watcher(name, el, vm, attr, domAttr) {
    this.name = name;
    this.el = el;
    this.vm = vm;
    this.attr = attr;
    this.domAttr = domAttr;
    this.update()
}
Watcher.prototype.update = function () {
    this.el[this.domAttr] = this.vm.$data[this.attr]
}