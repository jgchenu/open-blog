/*
    时间复杂度O(Nlog2N)
    空间复杂度O(Nlog2N)
    参考文章 阮一峰-快速排序
    http://blog.jgchen.xin/detail/109
*/
function quickSort(arr) {
    var len = arr.length;
    if (len < 2) {
        return arr;
    }
    var provitIndex = Math.floor(len / 2),
        provit = arr.splice(provitIndex, 1)[0],
        left = [],
        right = [];
    while (arr.length) {
        if (arr[0] < provit) {
            left.push(arr.shift())
        } else {
            right.push(arr.shift())
        }
    }
    return quickSort(left).concat([provit],quickSort(right))
}
var arr = [1, 1, 2, 2, 3, 11, 22, 33, 34, 222];
var target = quickSort(arr, 33);
console.log(target)