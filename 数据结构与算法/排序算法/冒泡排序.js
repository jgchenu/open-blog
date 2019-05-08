/*
    冒泡排序
    时间复杂度O(n^2)
    空间复杂度O(1)
*/
function bubbleSort(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
var arr = [22, 33, 11, 2, 1, 2, 34, 1, 222, 3];
var sortArr = bubbleSort(arr);
console.log(sortArr);
