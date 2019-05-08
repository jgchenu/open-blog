function findKthLargest(arr, k) {
  arr.sort((a, b) => b - a);
  return arr[k - 1];
}
console.log(findKthLargest([3, 1, 3, 4, 2, 5], 2));

function findKthLargest1(arr, k) {
  let len = arr.length;
  for (let i = len - 1; i > len - k - 1; i--) {
    for (let j = 0; j < i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr[len - k];
}
console.log(findKthLargest1([3, 1, 3, 4, 2, 5], 2));
