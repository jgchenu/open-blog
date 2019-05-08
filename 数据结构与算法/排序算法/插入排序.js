function insertSort(arr){
    for(let i=1;i<arr.length;i++){
        let preIndex=i-1;
        let current=arr[i];
        while(preIndex>=0&&arr[preIndex]>current){
            arr[preIndex+1]=arr[preIndex];
            preIndex--;
        }
        arr[preIndex+1]=current;
    }
    return arr;
}
var arr=[22,33,11,2,1,2,34,1,222,3];
var sortArr=insertSort(arr);
console.log(sortArr)