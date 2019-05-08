function firstMissingPositive(arr) {
  //过滤掉负数
  arr = arr.filter(item => item > 0);
  //正整数数组是否为空
  if (arr.length) {
    arr.sort((a, b) => a - b);
    if (arr[0] !== 1) {
      return 1;
    } else {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i + 1] - arr[i] > 1) {
          return arr[i] + 1;
        }
      }
      return arr.pop() + 1;
    }
  } else {
    return 1;
  }
}
// console.log(firstMissingPositive([1, 2, 3, 4, 5, 7]));
// console.log(firstMissingPositive([0, 0, -1, -1, -1, 1]));

function firstMissingPositive1(arr) {
  arr = arr.filter(item => item > 0);
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      let temp = arr[i];
      arr[i] = arr[minIndex];
      arr[minIndex] = temp;
    }
    if (i > 0) {
      if (arr[i] - arr[i - 1] > 1) {
        return arr[i - 1] + 1;
      }
      if (i === arr.length - 2 && arr[i + 1] - arr[i] > 1) {
        return arr[i] + 1;
      }
    } else {
      if (arr[i] !== 1) {
        return 1;
      }
    }
  }
  return arr.length ? arr.pop() + 1 : 1;
}
console.log(firstMissingPositive1([1, 4, 3, 2, 5, 7]));
console.log(firstMissingPositive1([0, 0, -1, -1, -1, 1]));
