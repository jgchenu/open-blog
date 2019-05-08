function List() {
    
    this.listSize = 0;   列表的元素个数
 
    this.pos = 0;    列表的当前位置

    this.dataStore = [];    列表数组

    this.append = append;    列表的末尾添加新元素

    this.find = find;    找到指定元素的位置

    this.toString = toString;     返回列表的字符串形式

    this.insert = insert;    在现有元素后插入新元素

    this.remove = remove;    从列表中删除元素

    this.clear = clear;    清空列表中的所有元素

    this.front = front;    将列表的当前位置移到第一个元素

    this.end = end;    将列表的当前位置移到最后一个元素

    this.next = next;    将当前位置后移一位

    this.hasNext;    判断是否有后一位

    this.hasPrev;    判断是否有前一位

    this.length = length;   返回列表元素的个数
 
    this.currPos = currPos;    返回列表的当前位置

    this.moveTo = moveTo;    将列表的当前位置移动到指定位置

    this.getElement = getElement;    返回当前位置的元素

    this.contains = contains; 判断给定元素是否在列表中
}


function append(element) {
    this.dataStore[this.listSize++] = element;
}

function find(element) {
    for (let i = 0; i < this.listSize; i++) { console.log(i); if (element == this.dataStore[i]) { return i; } } return -1; } function remove(element) { let findAt = this.find(element); if (findAt > -1) {
        this.dataStore.splice(findAt, 1);
        --this.listSize;
        return true;
    }
}

function length() {
    return this.listSize;
}

function toString() {
    return this.dataStore;
}

function insert(element, after) {
    let insertAt = this.find(after);
    if (insertAt > -1) {
        this.dataStore.splice(insertAt + 1, 0, element);
        this.listSize++;
        return true;
    }
    return false;
}

function clear() {
    delete this.dataStore;
    this.dataStore = [];
    this.listSize = this.pos = 0;
}

function contains(element) {
    for (let i = 0; i < this.listSize; i++) { if (this.dataStore[i] == element) { return true; } } return false; } function front() { this.pos = 0; } function end() { this.pos = this.listSize - 1; } function prev() { if (this.pos > 0) {
        this.pos--;
    }
}

function next() {
    if (this.pos < this.listSize - 1) {
        this.pos++;
    }
}

function currPos() {
    return this.pos;
}

function moveTo(position) {
    if (position < this.listSize - 1) {
        this.pos = position;
    }
}

function getElement() {
    return this.dataStore[this.pos];
}

function hasNext() {
    return this.pos < this.listSize - 1; } function hasPrev() { return this.pos > 0;
}
//初始化一个列表
let list = new List();
list.append('jianguang');
list.append('yinjun');
list.append('jiangsssuang');
list.append('yinssjun');


移动到第一个元素位置并且显示
list.front();
print(list.getElement());
移动向前一个元素位置，并且显示
list.next(); 
print(list.getElement());

还可以测试列表的其他函数....