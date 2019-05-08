function phoneNum(str) {
  let map = ["", 1, "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];
  //把输入字符串分割成数组 ‘1234’--> [1,2,3,4]
  let num = str.split("");
  //保存键盘映射后的字母内容，如 '23' --> ['abc','def']
  let code = [];
  num.forEach(item => {
    if (map[item]) {
      code.push(map[item]);
    }
  });
  let comb = arr => {
    //临时变量 用来保存前两个组合的结果
    let tmp = [];
    //最外层的循环便利第一个元素,里面的遍历表示第二个元素
    for (let i = 0, il = arr[0].length; i < il; i++) {
      for (let j = 0, jl = arr[1].length; j < jl; j++) {
        tmp.push(`${arr[0][j]}${arr[1][j]}`);
      }
    }
    arr.splice(0, 2, tmp);
    if (arr.length > 1) {
      comb(arr);
    } else {
      return tmp;
    }
    return arr[0];
  };
  return comb(code);
}
console.log(phoneNum('234'));