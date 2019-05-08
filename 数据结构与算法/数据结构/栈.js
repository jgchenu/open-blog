function Stack() {
    this.dataStore = [];
    this.top = 0;
    this.push = push;
    this.pop = pop;
    this.peek = peek;
    this.clear = clear;
    this.length = length;
}

function push(element) {
    this.dataStore[this.top++] = element;
}

function pop() {
    return this.dataStore[--this.top]
}

function length() {
    return this.top;
}

function clear() {
    this.top = 0;
}

function peek() {
   return this.dataStore[this.top - 1];
}

利用stack类实现10进制转换为其它进制

function mulBase(num, base) {
    let s = new Stack();
    do {
        s.push(num % base);
        num = Math.floor(num /= base);
    } while (num > 0);
    let content = '';
    while (s.length() > 0) {
        content += s.pop();
    }
    return content;
}
讲10进制数9转换为2进制数1001
print(mulBase(9, 2));


//用栈来判断是否是回文，回文就是一个字符串，从前往后写跟从后往前写都是一样的 例如'racecar','data'

function isPalindrome(word) {
    let s = new Stack();
    for (let i = 0; i < word.length; i++) { s.push(word[i]); } let rword = ''; while (s.length() > 0) {
        rword += s.pop();
    }
    if (word == rword) {
        return true;
    } else {
        return false;
    }
}
判断racecar是否是回文
print(isPalindrome('racecar'))