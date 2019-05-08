/*
归并排序是建立在归并操作上的一种有效的排序算法。
该算法是采用分治法（Divide and Conquer）的一个非常典型的应用。将已有序的子序列合并，得到完全有序的序列；
即先使每个子序列有序，再使子序列段间有序。若将两个有序表合并成一个有序表，称为2-路归并。
    时间复杂度O(Nlog2N)
    空间复杂度O(N)
*/
function mergeSort(arr){
    var len=arr.length;
    if(len<2){
        return arr;
    }
    var mid=Math.floor(len/2);
    var left=arr.slice(0,mid);
    var right=arr.slice(mid);
    return merge(mergeSort(left),mergeSort(right))
}
function merge(left,right){
    var result=[];
    while(left.length>0&&right.length>0){
        if(left[0]<right[0]){
            result.push(left.shift())
        }else{
            result.push(right.shift())
        }
    }
    while(left.length){
        result.push(left.shift())
    }
    while(right.length){
        result.push(right.shift())
    }
    return result;
}
var arr=[22,33,11,2,1,2,34,1,222,3];
var sortArr=mergeSort(arr);
console.log(sortArr)