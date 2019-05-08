// var line = readline()
var line = '3 2'
var lines = line.split(" ");
var n = lines[0];
var m = lines[1];
var len = 0;
var all = 0;
// line = readline();
line = '12 5 4';
lines = line.split(" ");
var half = 2;
lines = lines.sort((a, b) => b - a)
if (n >= m) {
    len = lines[m - 1]
    if(len<((~~lines[0]) / half).toFixed(2)){
        while (all < m) {
            len = ((~~lines[0]) / half).toFixed(2);
            for (let i = 0; i < lines.length; i++) {
                all += (Math.floor(lines[i] / len))
            }
            half++;
        }  
    }
}
half=2;
if (n < m) {
    while (all < m) {
        len = ((~~lines[0]) / half).toFixed(2);
        for (let i = 0; i < lines.length; i++) {
            all += (Math.floor(lines[i] / len))
        }
        half++;
    }   
}
console.log(len)