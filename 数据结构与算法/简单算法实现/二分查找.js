/*
使用二分查找的数组必须是有序的
*/

function binarySearch (arr,target){
    var start=0;
    var end=arr.length-1;
    while(start<=end){
        var mid=Math.floor((end+start)/2)
        if(target>arr[mid]){
            start=mid+1;
        }else if(target<arr[mid]){
            end=mid-1;
        }else{
            return mid;
        }
    }
    return -1
}
var arr = [1, 1, 2, 2, 3, 11, 22, 33, 34, 222];
var target = binarySearch(arr, 33);
console.log(target)