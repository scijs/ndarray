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


