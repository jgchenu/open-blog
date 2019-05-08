function Queen() {
    this.dataStore = [];
    this.enqueue = enqueue;
    this.dequeue = dequeue;
    this.front = front;
    this.back = back;
    this.toString = toString;
    this.empty = empty;
}
//enqueue方法向队尾添加一个元素
function enqueue(element) {
    this.dataStore.push(element);
}
//dequeue方法删除队首的元素
function dequeue() {
    return this.dataStore.shift();
}
//读取队首的元素
function front() {
    return this.dataStore[0];
}
//读取队尾的元素
function back() {
    return this.dataStore[this.dataStore.length - 1];
}

//toString方法
function toString() {
    let str = '';
    for (let i = 0; i < this.dataStore.length; i++) {
        str += this.dataStore[i] + '\n';
    }
    return str;
}
//判断队列是否为空
function empty() {
    if (this.dataStore.length == 0) {
        return true;
    } else {
        return false;
    }
}
//判断队列是否为空
function empty() {
    if (this.dataStore.length == 0) {
        return true;
    } else {
        return false;
    }
}
//基数排序
function distribute(nums, queues, n, digit) {
    for (var i = 0; i < n; i++) {
        if (digit == 1) {
            queues[nums[i] % 10].enqueue(nums[i]);
        } else {
            queues[Math.floor(nums[i] / 10)].enqueue(nums[i]);
        }
    }
}
//从队列中收集数字
function collect(queues, num) {
    let i = 0;
    for (let digit = 0; digit < 10; digit++) {
        while (!queues[digit].empty()) {
            nums[i++] = queues[digit].dequeue();
        }
    }
}
//返回队列的字符串
function dispArray(arr) {
    let str = '';
    for (let i = 0; i < arr.length; i++) {
        str += arr[i] + " ";
    }
    print(str);
}
let queues = [];
for (let i = 0; i < 10; ++i) {
    queues[i] = new Queue();
}
let nums = [];
for (let i = 0; i < 10; i++) {
    nums[i] = Math.floor(Math.random() * 100);
}

print("Befor radix sort: ");
dispArray(nums);
distribute(nums, queues, 10, 1);
collect(queues, nums);
distribute(nums, queues, 10, 10);
collect(queues, nums);
print('\n\n After radix sort: ');
dispArray(nums);