/*
空间复杂度 O(n^3/2)
空间复杂度 O(1)
希尔排序是对插入排序的优化 在时间复杂度上突破了O(n^2)
*/
function shellSort(arr) {
    var len = arr.length,
        gap = 1,
        arr=arr.slice();
    while (gap < len / 3) {          // 动态定义间隔序列
        gap = gap * 3 + 1;
    }
    for (gap; gap > 0; gap = Math.floor(gap / 3)) {
        //根据gap的动态定义间隔来进行分组，在每一个分组都进行自己的插入排序
        //gap进行动态定义，然后分组，进行组内的插入排序
        //直到gap间隔为1 之后 再进行整组的插入排序，这个时候大部分已经排序完，只是进行微调而已。
        for (var i = gap; i < len; i++) {
            var preIndex=i-gap;
            var current=arr[i];
            while(preIndex>=0&&arr[preIndex]>current){
                arr[preIndex+gap]=arr[preIndex];
                preIndex=preIndex-gap;
            }
            arr[preIndex + gap] = current;
        }
    }
    return arr;
}
var arr = [1, 1, 2, 2, 3, 11, 22, 33, 34, 222];
var target = shellSort(arr, 33);
console.log(target)