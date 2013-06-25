var test = require("tap").test
var ndarray = require("../index.js");

test("ndarray", function(t) {

  var p = ndarray(new Float32Array([1,2,3,4]), [2,2])
  console.log(p)
  t.equals(p.shape.length, 2)
  t.equals(p.shape[0], 2)
  t.equals(p.shape[1], 2)
  t.equals(p.stride[0], 2)
  t.equals(p.stride[1], 1)

  t.end()
})

test("pick", function(t) {

  var x = ndarray(new Float32Array(25), [5, 5])
  
  x.set(0, 0, 1)
  x.set(4, 0, 5)
  x.set(0, 4, 10)
  
  var y = x.pick(0)
  t.equals(y.get(0), 1)
  t.equals(y.get(1), 0)
  t.equals(y.get(2), 0)
  t.equals(y.get(3), 0)
  t.equals(y.get(4), 10)
  t.equals(y.shape.join(","), "5")

  y = x.pick(-1, 0)
  t.equals(y.get(0), 1)
  t.equals(y.get(1), 0)
  t.equals(y.get(2), 0)
  t.equals(y.get(3), 0)
  t.equals(y.get(4), 5)
  t.equals(y.shape.join(","), "5")
  
  t.end()
})

test("accessor", function(t) {

  for(var d=1; d<5; ++d) {
    var shape = new Array(d)
    for(var i=0; i<d; ++i) {
      shape[i] = 3
    }
    var x = ndarray(new Float32Array(1000), shape)
    x.set(1,1,1,1,1,1,1,1,1)
    t.equals(x.get(1,1,1,1,1,1,1), 1)
  }

  t.end()
})

test("size", function(t) {
  var x = ndarray(new Float32Array(100), [2, 3, 5])
  t.equals(x.size, 2*3*5)
  t.end()
})

test("lo", function(t) {

  var x = ndarray(new Float32Array(9), [3, 3])
    , y = x.lo(1, 2)
  t.equals(y.shape.join(","), "2,1")
  t.equals(y.stride.join(","), x.stride.join(","))
  t.equals(y.offset, 3+2)
  
  y.set(0, 0, 1)
  t.equals(x.get(1, 2), 1)

  t.end()
})

test("hi", function(t) {
  var x = ndarray(new Float32Array(9), [3, 3])
    , y = x.hi(1, 2)
  t.equals(y.shape.join(","), "1,2")
  t.equals(y.stride.join(","), x.stride.join(","))
  t.equals(y.offset, 0)

  y.set(0, 1, 1)
  t.equals(x.get(0, 1), 1)


  t.end()
})