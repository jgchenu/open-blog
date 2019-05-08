function sortCard(arr) {
  let str = arr.sort().join("");
  let group = str.match(/(\d)\1+|\d/g);
  let gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  while (group.length > 1) {
    let a = group.shift().length;
    let b = group.shift().length;
    let v = gcd(a, b);
    if ((v === 1)) {
      return false;
    } else {
      group.unshift("0".repeat(v));
    }
  }
  return group.length ? group[0].length > 1 : false;
}
console.log(sortCard([1,1,2,2,3,3]))