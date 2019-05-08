function maximumGap(arr) {
  let len = arr.length;
  let space;
  let max = 0;
  for (let i = len - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
    if (i < len - 1) {
      space = arr[i + 1] - arr[i];
      if (space > max) {
        max = space;
      }
    }
  }
  return Math.max(max, arr[1] - arr[0]);
}
console.log(maximumGap([1, 3, 5, 7, 9, 11, 14]));
