var ndarray = require("../index.js");
var argv = require("optimist").argv;

console.log(argv)

function order(str) {
  return str === "F" ? [0, 1] : [1, 0];
}

var A = ndarray.zeros([1024, 1024], "float64", order(argv._[0]) )
var B = ndarray.zeros([1024, 1024], "float64", order(argv._[1]) )

var start = new Date()
for(var i=0; i<1000; ++i) {
  A.assign(B)
}
var end = new Date()
console.log("Elapsed time:", end - start)