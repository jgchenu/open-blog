var n = parseInt(readline());
var arr = []
for (let i = 0; i < n; i++) {
    arr[i] = [];
    str = readline();
    str = str.split('');
    while (str.length) {
        let pop = str.shift();
        let len = arr[i].length;
        if (len >= 3 && arr[i][len - 3] == arr[i][len - 2] && arr[i][len - 1] == pop) {
            continue;
        }
        if (len >= 2 && arr[i][len - 1] == arr[i][len - 2] && arr[i][len - 1] == pop) {
            continue;
        }
        arr[i].push(pop)
    }
}
for (let i = 0; i < arr.length; i++) {
    print(arr[i].join(''))
}