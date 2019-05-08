//节点构造函数,element用于保存节点的数据，next用来保存指向下一个节点的链接
function Node(element) {
    this.element=element;
    this.next=null;
}
//链表类构造函数，包含对链表操作的方法
function LList(){
    this.head=new Node('head');
    this.find=find;
    this.insert=insert;
    this.remove=remove;
    this.display=display;
    this.findPrevious=findPrevious;
}
//查找节点
function find(item){
    var currentNode=this.head;
    while(currentNode.element!=item){
        currentNode=currentNode.next;
    }
    return currentNode;
}
//插入新节点
function insert(newElement,item){
    var newNode=new Node(newElement);
    var currentNode=this.find(item);
    newNode.next=currentNode.next;
    currentNode.next=newNode;
}
//打印链表的数据
function display(){
    var currentNode=this.head;
    while(currentNode.next!=null){
        print(currentNode.next.element);
        currentNode=currentNode.next;
    }
}
//找到要删除的节点的上一个节点
function findPrevious(item){
    var currentNode=this.head;
    //只有同时满足该节点下一个节点既不是null，又不是找到的那个节点，循环才会继续，
    //如果该节点是null，或者是找到的那个节点，那么就跳出循环
    while (currentNode.next.element!=item&&currentNode.next!=null) {
        currentNode=currentNode.next;
    }
    return currentNode;
}


function remove(item){
    var prevNode=this.findPrevious(item);
    if (prevNode!=null) {
        //如果要删除节点的上一个节点不是null（也就不是找不到），那么将要删除的节点的上一个节点的next要链接到删除的节点的下一个节点的next
        prevNode.next=prevNode.next.next;
    }
}

var cities=new LList();
cities.insert('Conway','head');
cities.insert('Russellville','Conway');
cities.insert('jgchen','Russellville');
cities.insert('yinjun','jgchen');
cities.display();
print('---------------');
cities.remove('jgchen');
cities.display();