/*
选择排序
*/
function selectSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      let temp = arr[minIndex];
      arr[minIndex] = arr[i];
      arr[i] = temp;
    }
  }
  return arr;
}
var arr = [22, 33, 11, 2, 1, 2, 34, 1, 222, 3];
var sortArr = selectSort(arr);
console.log(sortArr);
