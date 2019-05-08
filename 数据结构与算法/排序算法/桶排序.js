/*
 时间复杂度O(n)
 空间复杂度O(n)
*/
function bucketSort(arr, bucketSize) {
    if (arr.length === 0) {
        return arr;
    }

    var i;
    var minValue = arr[0];
    var maxValue = arr[0];
    for (i = 1; i < arr.length; i++) {
        if (arr[i] < minValue) {
            minValue = arr[i]; // 输入数据的最小值
        } else if (arr[i] > maxValue) {
            maxValue = arr[i]; // 输入数据的最大值
        }
    }

    // 桶的初始化
    bucketSize = bucketSize || 5;// 设置桶的默认数量为5
    var bucketCount = Math.floor((maxValue - minValue) / bucketSize) + 1;
    var buckets = new Array(bucketCount);
    for (i = 0; i < buckets.length; i++) {
        buckets[i] = [];
    }

    // 利用映射函数将数据分配到各个桶中
    for (i = 0; i < arr.length; i++) {
        buckets[Math.floor((arr[i] - minValue) / bucketSize)].push(arr[i]);
    }

    arr.length = 0;
    for (i = 0; i < buckets.length; i++) {
        buckets[i] = insertSort(buckets[i]); // 对每个桶进行排序，这里使用了插入排序
        for (var j = 0; j < buckets[i].length; j++) {
            arr.push(buckets[i][j]);
        }
    }

    return arr;
}
/*
插入排序
*/
function insertSort(arr) {
    var len = arr.length;
    var arr = arr.slice();
    for (var i = 1; i < len; i++) {
        var preIndex = i - 1;
        var current = arr[i];
        while (preIndex >= 0 && arr[preIndex] > current) {
            arr[preIndex + 1] = arr[preIndex]
            preIndex--;
        }
        arr[preIndex + 1] = current;
    }
    return arr;
}
var arr = [22, 33, 11, 2, 1, 2, 34, 1, 222, 3];
var sortArr = bucketSort(arr, 5);
console.log(sortArr)