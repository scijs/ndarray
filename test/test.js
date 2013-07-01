var test = require("tape")
var perm = require("permutation-rank")
var invPerm = require("invert-permutation")
var dup = require("dup")
var ndarray = require("../ndarray.js")

test("ndarray", function(t) {

  var p = ndarray(new Float32Array([1,2,3,4]), [2,2])
  t.equals(p.shape.length, 2)
  t.equals(p.shape[0], 2)
  t.equals(p.shape[1], 2)
  t.equals(p.stride[0], 2)
  t.equals(p.stride[1], 1)

  t.end()
})

test("order", function(t) {
  t.same(ndarray([0]).pick(0).order, [])
  var f = 1
  for(var d=1; d<=5; ++d) {
    f *= d
    for(var r=0; r<f; ++r) {
      var p = perm.unrank(d, r)
      var x = ndarray([1], dup(f), p)
      t.same(x.order, invPerm(p.slice(0)), x.stride.join(","))
    }
  }
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
    t.equals(x.get(1,1,1,1,1,1,1), 1, "get/set array d=" + d)
    
    var array1D = ndarray(new Int8Array(1000))
    var x = ndarray(array1D, shape)
    x.set(1,1,1,1,1,1,1,1,1)
    t.equals(x.get(1,1,1,1,1,1,1), 1, "get/set generic d=" + d)
  }

  t.end()
})

test("size", function(t) {
  var x = ndarray(new Float32Array(100), [2, 3, 5])
  t.equals(x.size, 2*3*5)
  t.equals(x.pick(0,0,0).size, 0)
  for(var d=1; d<5; ++d) {
    var x = ndarray(new Float32Array(256), dup(d,2))
    t.equals(x.size, 1<<d, "size d="+d)
  }
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


test("step", function(t) {

  var x = ndarray(new Float32Array(10))
  for(var i=0; i<10; ++i) {
    x.set(i, i)
  }
  
  var y = x.step(-1)
  for(var i=0; i<10; ++i) {
    t.equals(y.get(i), (9-i))
  }
  
  var z = y.step(-1)
  for(var i=0; i<10; ++i) {
    t.equals(z.get(i), i)
  }
  
  var w = x.step(2)
  t.equals(w.shape[0], 5)
  for(var i=0; i<5; ++i) {
    t.equals(w.get(i), 2*i)
  }
  
  
  var a = w.step(-1), b = y.step(2)
  t.same(a.shape, b.shape)
  for(var i=0; i<5; ++i) {
    t.equals(a.get(i)+1, b.get(i))
  }

  t.end()
})