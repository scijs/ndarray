var test = require("tap").test
var ndarray = require("../index.js");

test("ndarray", function(t) {

  var p = ndarray(new Float32Array([1,2,3,4]), [2,2])
  t.equals(p.shape.length, 2)
  t.equals(p.shape[0], 2)
  t.equals(p.shape[1], 2)
  t.equals(p.stride[0], 2)
  t.equals(p.stride[1], 1)

  t.end()
})

test("zeros", function(t) {

  var x = ndarray.zeros([5, 5])

  t.equals(x.shape.length, 2)
  t.equals(x.shape[0], 5)
  t.equals(x.shape[1], 5)
  
  var y = ndarray.zeros([11,10,9], 'float32')
  t.equals(ndarray.dtype(y), 'float32')
  t.equals(y.shape.length, 3)

  t.end()
})

test("accessor", function(t) {

  t.end()
})

test("slicing", function(t) {

  t.end()
})
