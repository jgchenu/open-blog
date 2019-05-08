var n = parseInt(readline());
var least = 1024 - n;
var arrs = [];
var num;
while (least) {
    num = Math.floor(least / 1024);
    if (num === 1) {
        break;
    }
    num = Math.floor(least / 64);
    if (num > 0) {
        arrs[3] = num;
        least = least % 64;
    }
    num = Math.floor(least / 16)
    if (num > 0) {
        arrs[2] = num;
        least = least % 16;
    }
    num = Math.floor(least / 4)
    if (num > 0) {
        arrs[1] = num;
        least = least % 4;
    }
    num = least;
    if (num > 0) {
        arrs[0] = num;
        least = 0;
    }
}

var all = 0;
for (var i = 0; i < arrs.length; i++) {
    if (arrs[i]) {
        all += arrs[i]
    }
}
print(all)