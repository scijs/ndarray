var ndarray = require("../index.js");

var x = ndarray.zeros([5, 5])
var y = x.hi(4,4).lo(1,1)

for(var i=0; i<y.shape[0]; ++i) {
  for(var j=0; j<y.shape[1]; ++j) {
    y.set(i,j, 1)
  }
}
console.log(y.toString())
console.log(x.toString())


var x = ndarray.zeros([5,5])
var y = ndarray.zeros([3,3])
for(var i=0; i<y.shape[0]; ++i) {
  for(var j=0; j<y.shape[1]; ++j) {
    y.set(i,j,1)
  }
}

x.hi(2,2).assign(y)
x.lo(2,2).assign(y)



var x = ndarray.zeros([5,5], "float64", [0,1])
var y = ndarray.zeros([5,5], "float64", [1,0])
for(var i=0; i<x.shape[0]; ++i) {
  for(var j=0; j<x.shape[1]; ++j) {
    x.set(i,j, i + j * 10);
  }
}

console.log(x.toString())
y.assign(x)
console.log(y.toString())

