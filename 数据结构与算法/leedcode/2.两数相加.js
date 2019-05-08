/**
 * 
给出两个 非空 的链表用来表示两个非负的整数。其中，它们各自的位数是按照 逆序 的方式存储的，并且它们的每个节点只能存储 一位 数字。
如果，我们将这两个数相加起来，则会返回一个新的链表来表示它们的和。

您可以假设除了数字 0 之外，这两个数都不会以 0 开头。

示例：

输入：(2 -> 4 -> 3) + (5 -> 6 -> 4)
输出：7 -> 0 -> 8
原因：342 + 465 = 807


 * 
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {

    const retNode = new ListNode(0);
    //retNode用于保留初始节点的引用
    let o = retNode;
    //p q 就是复制l1跟l2的节点引用，不对l1 跟l2 进行赋值处理
    let p = l1,
        q = l2;
    let carry = 0;


    while (p !== null || q !== null) {

        // 当出现空节点时：
        // l1 = null
        // l2 = 0->1
        if (p === null) {
            p = new ListNode(0);
        }
        // 当出现空节点时：
        // l1 = 0->1
        // l2 = null
        if (q === null) {
            q = new ListNode(0);
        }

        // 求和
        const sum = p.val + q.val + carry;
        if (sum >= 10) {
            o.val = sum % 10;
            carry = 1;
        } else {
            o.val = sum;
            carry = 0;
        }
        //都取到下一个节点
        p = p.next;
        q = q.next;

        // 当一个链表比另一个链表长时：
        // l1 = 0->1
        // l2 = 0->1->2
        if (p === null && q === null && carry === 1) {
            o.next = new ListNode(1);
        }
        if (p === null && q !== null) {
            p = new ListNode(0);
        }

        if (p !== null && q === null) {
            q = new ListNode(0);
        }

        // 创建下一个节点
        if (p !== null || q !== null) {
            o.next = new ListNode(0);
            o = o.next;
        }
    }
    return retNode;
};