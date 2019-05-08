function sortArrayByParityII(arr) {
  let odd = 1;
  let even = 0;
  let r = [];
  arr.sort((a, b) => a - b);
  arr.forEach(item => {
    if (item % 2 === 1) {
      r[odd] = item;
      odd += 2;
    } else {
      r[even] = item;
      even += 2;
    }
  });
  return r;
}
console.log(sortArrayByParityII([4, 2, 5, 7]));
