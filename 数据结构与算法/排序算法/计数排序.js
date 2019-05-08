/*
时间复杂度O(n+k) 空间复杂度 O(n+k)
*/
function countingSort(arr) {
    var maxValue = Math.max(...arr)
    var bucketLen = maxValue + 1;
    var bucket = new Array(bucketLen);
    var len = arr.length;
    var sortIndex = 0;
    for (var i = 0; i < len; i++) {
        if (!bucket[arr[i]]) {
            bucket[arr[i]] = 0;
        }
        bucket[arr[i]]++;
    }
    for (var j = 0; j < bucketLen; j++) {
        while (bucket[j] > 0) {
            arr[sortIndex++] = j;
            bucket[j]--;
        }
    }
    return arr;
}


var arr = [22, 33, 11, 2, 1, 2, 34, 1, 222, 3];
var sortArr = countingSort(arr);
console.log(sortArr)