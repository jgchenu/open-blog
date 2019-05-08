//实现两个溢出的大整数相加
function add(d1, d2) {
    // 如果第一个数较大则交换两个数
    //只有字符串 数组 有length属性，所以需要将数字转为字符串
    //~ 的效果是转为 (数字+1)取反，两次～～的效果就是转为数字类型 
    d1 = String(d1);
    d2 = String(d2);
    if (d1.length < d2.length) {
        [d1, d2] = [d2, d1];
    }
    // 将两个数转为反转数组形式
    let [arr1, arr2] = [
        [...d1].reverse(), [...d2].reverse()
    ];
    // carry用作当对应位数相加大于10时做进位
    let carry = 0;
    // 循环arr1.length次求和
    for (let i = 0; i < arr1.length; i++) {
        if (arr2[i]) {
            arr1[i] = ~~(arr1[i]) + ~~(arr2[i]) + carry;
        } else {
            arr1[i] = ~~(arr1[i]) + carry;
        }
        if (arr1[i] >= 10) {
            [arr1[i], carry] = [arr1[i] % 10, 1];
        } else {
            carry = 0;
        }
    }
    // 如果最后进位为1，则结果前应加1为
    if (carry === 1) {
        arr1[arr1.length] = carry;
    }
    // 返回结果整数
    return ~~(arr1.reverse().join(''));
}
console.log(add(7000000000, 3456000000))