var len;
function buildMaxHeap(arr){
    len=arr.length;
    for(var i=Math.floor(len-1/2);i>=0;i--){
        heapify(arr,i);
    }
}
function heapify(arr,i){
    var left=i*2+1;
    var right=i*2+2;
    var largest=i;
    if(left<len&&arr[left]>arr[largest]){
        largest=left;
    }
    if(right<len&&arr[right]>arr[largest]){
        largest=right;
    }
    if(largest!==i){
        swap(arr,i,largest)
        heapify(arr,largest)
    }
}
function swap(arr,i,j){
    var temp=arr[i];
    arr[i]=arr[j];
    arr[j]=temp;
}
function heapSort(arr){
    buildMaxHeap(arr);
    for(var i=arr.length-1;i>0;i--){
        swap(arr,0,i);
        len--;
        heapify(arr,0);
    }
    return arr;
}
var arr=[22,33,11,2,1,2,34,1,222,3];
console.log(heapSort(arr));