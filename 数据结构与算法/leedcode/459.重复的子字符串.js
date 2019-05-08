function repeatedSubstring(str){
  var reg = /^(\w+)\1+$/
  return reg.test(str);
}
console.log(repeatedSubstring('abcabcabc'))
console.log(repeatedSubstring('abcbcabc'))
console.log(repeatedSubstring('bcbcbc'))

