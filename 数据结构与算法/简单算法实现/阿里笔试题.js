//评测题目: 
/**
 * 查找落单的数字
 * 描述：给定一个非空的数字数组，数组有且只有一个非重复项，实现一个方法获取落单项
 * 示例：
 *  getSingleNumber([1, 2, 1, 2, 0]); // 0
 *  getSingleNumber([0, 1, 0, 0]); // 1
 *  getSingleNumber([1, 2, 3, 1, 2]); // 3
 */
function getSingleNumber(numbers) {
    /* 代码实现 */
      var hashArr={};
      var one;
      numbers.forEach((item)=>{
          if(!hashArr[item]){
              hashArr[item]=0;
          }
          hashArr[item]++;
      })
      Object.keys(hashArr).forEach(key=>{
          if(hashArr[key]===1){
              one=key;
          }
      })
      return one;
  }
  
  /**
   * 合并数组中相邻且重复的元素
   * 说明：请实现一个函数 `merge`，传入一个数组，合并数组中【相邻且重复】的元素。
   * 示例：
   *   merge([3,2,2,4,5,5,6,2,1]); // 输出[3,2,4,5,6,2,1]
   *   merge([3,2,3]); // 输出[3,2,3]
   *   merge([2,2,3]); // 输出[2,3]
   */
  function merge(arr) {
    /* 代码实现 */
      let newArr=[];
      while(arr.length){
          var pop=arr.shift();
          if(newArr[newArr.length-1]!==pop){
              newArr.push(pop)
          }
      }
      return newArr;
  }