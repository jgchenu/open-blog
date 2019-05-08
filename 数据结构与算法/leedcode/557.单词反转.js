/**f
 * 反转单词III
 */

  function reserveWord1(str) {
    return  str.split(' ').map(item=>(
         item.split('').reverse().join('')
     )).join(' ');
  }

 function reserveWord2(str) {
    return  str.match(/[\w']+/g).map(item=>(
            item.split('').reverse().join('')
            )).join(' ');
}