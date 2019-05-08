/*
广度优先能够找出从起点通往目的点的最少段数
*/
var graph = {
    you: ['alice', 'bob', 'claire'],
    bob: ['anuj', 'peggy'],
    alice: ['peggy'],
    claire: ['thom', 'jonny'],
    anuj: [],
    peggy: [],
    thom: [],
    jonny: []
}
let searchQueue = [],
    searched = [];
function search(findName) {
    searchQueue = searchQueue.concat(graph['you']);
    while (searchQueue.length) {
        let person = searchQueue.shift();
        if (searched.indexOf(person) === -1) {
            if (person === findName) {
                console.log(`${person} is the findName`);
                return true;
            } else {
                searchQueue = searchQueue.concat(graph[person]);
                searched.push(person)
            }
        }
    }
    return false;
}
console.log(search('jonny'))