function grayCode(n) {
  let make = n => {
    if (n === 1) {
      return [0, 1];
    } else if (n === 0) {
      return [0];
    } else {
      let prev = make(n - 1);
      let max = Math.pow(2, n) - 1;
      let result = [];
      for (let i = 0; i < prev.length; i++) {
        result[i] = `0${prev[i]}`;
        result[max - i] = `1${prev[i]}`;
      }
      return result;
    }
  };
  return make(n);
}
console.log(grayCode(2));
