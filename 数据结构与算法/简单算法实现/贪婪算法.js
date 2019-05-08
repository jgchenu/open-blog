//差集
Set.prototype.difference = function (other) {
    let difference = new Set();
    let values = this.values();
    for (let value of values) {
        if (!other.has(value)) {
            difference.add(value)
        }
    }
    return difference;
}
//交集
Set.prototype.intersect = function (other) {
    let intersect = new Set();
    let values = this.values();
    for (let value of values) {
        if (other.has(value)) {
            intersect.add(value)
        }
    }
    return intersect;
}

//并集
Set.prototype.union = function (other) {
    let union = new Set();
    let values = this.values();
    for (let value of values) {
        union.add(value);
    }
    values = other.values(); // 将values重新赋值为新的集合
    for (let value of values) {
        union.add(value);
    }

    return union;
};

var statesNeeded = new Set(['mt', 'wa', 'or', 'id', 'nv', 'ut']);
var stations = {
    kone: new Set(['id', 'nv', 'ut']),
    ktwo: new Set(['wa', 'id', 'mt']),
    kthree: new Set(['or', 'nv', 'ca']),
    kfour: new Set(['nv', 'ut']),
    kfive: new Set(['ca', 'az'])
}
var finalStations = new Set()

function findLeast() {
    let size = statesNeeded.size;
    while (size) {
        let bestStation = null;
        let statesCovered = new Set();
        for (let station in stations) {
            let states = stations[station];
            let covered = states.intersect(statesNeeded);
            if (covered.size > statesCovered.size) {
                bestStation = station;
                statesCovered = covered
            }
        }
        statesNeeded = statesNeeded.difference(statesCovered);
        finalStations.add(bestStation)
        size = statesNeeded.size;
    }
}
findLeast()
console.log(finalStations)


console.log([...(stations.kone.difference(stations.ktwo))])
console.log([...(stations.kone.intersect(stations.ktwo))])
console.log([...(stations.kone.union(stations.ktwo))])