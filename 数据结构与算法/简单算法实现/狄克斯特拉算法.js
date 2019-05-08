/*
狄克斯特拉算法：找出加权图中加权和最小的路径
缺点：不能有负权边，只能计算正权边
*/

var graph = {
    start: {
        a: 6,
        b: 2
    },
    a: {
        end: 1
    },
    b: {
        a: 3,
        end: 5
    },
    end: null
}
let processed = [];
let costs = {
    a: 6,
    b: 2,
    end: Infinity
}
let parents = {
    a: 'start',
    b: 'start',
    end: null
}
//找出当前最小的开销点
function findLowestCostNode() {
    let lowestCost = Infinity,
        lowestCostNode = null;
    for (let node in costs) {
        cost = costs[node];
        if (cost < lowestCost && processed.indexOf(node) === -1) {
            lowestCost = cost;
            lowestCostNode = node;
        }
    }
    return lowestCostNode
}

function findLowestCost() {
    let node = findLowestCostNode(costs);
    console.log(node)
    while (node !== null) {
        let cost = costs[node];
        let neighbors = graph[node];
        for (let n in neighbors) {
            let newCost = cost + neighbors[n];
            if (newCost < costs[n]) {
                costs[n] = newCost;
                parents[n] = node;
            }
        }
        processed.push(node);
        node = findLowestCostNode(costs);
    }
}
findLowestCost();
console.log(costs);
console.log(parents)