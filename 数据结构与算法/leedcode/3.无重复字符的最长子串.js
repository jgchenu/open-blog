/*
给定一个字符串，请你找出其中不含有重复字符的 最长子串 的长度。

示例 1:

输入: "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
示例 2:

输入: "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。
示例 3:

输入: "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。

*/
/**
 * 第一种  时间复杂度为O(n^3)
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    function isUnique(s,start,end){
        var hashArr=[];
        for(var i=start;i<end;i++){
            var cha=s.charAt(i);
            if(~hashArr.indexOf(cha)) return false;
            hashArr.push(cha)
        }
        return true;
    }
 
     var n=s.length;
     var ans=0;
     for(var i=0;i<n;i++){
         for(var j=i+1;j<=n;j++){
             if(isUnique(s,i,j)) ans=Math.max(j-i,ans);
         }
     }
     return ans;
     
 };