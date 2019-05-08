// var str = readline();
var str = '1+2';
var numArr = str.split(/\+|\-|\=/);
str = str.split('');
var all = 0;
var len = numArr.length;
var start = 0;
while (str.length) {
    let pop = str.shift();
    if (pop === '=') {
        break;
    } else if (pop === '-') {
        all -= ~~numArr[start++];
        console.log(all)
    } else if (pop === '+') {
        all += ~~numArr[start++];
        console.log(all)
    }
    if(start===len-1){
        break;
    }
}


console.log(all)
// print(all);