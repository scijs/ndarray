var test = require("tape")
var perm = require("permutation-rank")
var invPerm = require("invert-permutation")
var dup = require("dup")
var ndarray = require("../ndarray.js")

test("ndarray", function(t) {

  var p = ndarray(new Float32Array([1,2,3,4]), [2,2])

  t.equals(p.dtype, "float32")
  t.equals(p.shape.length, 2)
  t.equals(p.shape[0], 2)
  t.equals(p.shape[1], 2)
  t.equals(p.stride[0], 2)
  t.equals(p.stride[1], 1)
  
  t.end()
})

test("index", function(t) {

  var p = ndarray(new Float32Array([1,2,3,4]), [2,2])

  t.equals(p.index(0,0), 0)
  t.equals(p.index(0,1), 1)
  t.equals(p.index(1,0), 2)
  t.equals(p.index(1,1), 3)
  t.end()
})

test("scalars", function(t) {
  var p = ndarray(new Float32Array([1,2,3,4]))
  var c = p.pick(0)
  t.equals(c.get(), 1)
  t.equals(c.set(10), 10)
  t.equals(p.get(0), 10)
  c = p.pick(3)
  t.equals(c.index(), 3)
  t.same(c.shape, [])
  t.same(c.order, [])
  t.same(c.stride, [])
  t.equals(c.get(), 4)
  t.same(c.lo(), c)
  t.equals(c + 1, 5)
  //Test trivial array
  t.equals(c.pick().dimension, -1)
  t.end()
})

if((typeof Uint8ClampedArray) !== "undefined")
test("uint8clamped", function(t) {
  var p = ndarray(new Uint8ClampedArray([1,2,3,4]), [4])
  t.equals(p.dtype, "uint8_clamped")
  t.equals(p.get(0), 1)
  t.equals(p.get(1), 2)
  t.equals(p.get(2), 3)
  t.equals(p.get(3), 4)
  p.set(0, 1000)
  t.equals(p.get(0), 255)
  p.set(1, -1000)
  t.equals(p.get(1), 0)
  t.end()
})

if((typeof BigInt64Array) !== "undefined")
test("bigint64", function(t) {
  var p = ndarray(new BigInt64Array([1,2,3,4].map(BigInt)), [4])
  t.equals(p.dtype, "bigint64")
  t.equals(p.get(0), BigInt(1))
  t.equals(p.get(1), BigInt(2))
  t.equals(p.get(2), BigInt(3))
  t.equals(p.get(3), BigInt(4))
  t.end()
})

test("buffer", function(t) {
  var p = ndarray(new Buffer(5))
  t.equals(p.dtype, "buffer")
  p.set(0, 1)
  p.set(1, 2)
  p.set(2, 3)
  p.set(3, 4)
  t.equals(p.get(0), 1)
  t.equals(p.get(1), 2)
  t.equals(p.get(2), 3)
  t.equals(p.get(3), 4)
  t.end()
})

test("dtypes", function(t) {
  t.equals(ndarray(new Uint8Array(5)).dtype, "uint8")
  t.equals(ndarray(new Uint16Array(5)).dtype, "uint16")
  t.equals(ndarray(new Uint32Array(5)).dtype, "uint32")
  t.equals(ndarray(new Int8Array(5)).dtype, "int8")
  t.equals(ndarray(new Int16Array(5)).dtype, "int16")
  t.equals(ndarray(new Int32Array(5)).dtype, "int32")
  t.equals(ndarray(new Float32Array(5)).dtype, "float32")
  t.equals(ndarray(new Float64Array(5)).dtype, "float64")
  t.equals(ndarray([1,2,3]).dtype, "array")
  t.end()
})

test("shape/stride", function(t) {

  var p = ndarray(new Float32Array(100), [3,3,3], [3,2,1])
  
  t.equals(p.dtype, "float32")
  t.equals(p.shape[0], 3)
  p.shape[0] = 1
  t.equals(p.shape[0], 1)
  t.equals(p.shape[1], 3)
  t.equals(p.shape[2], 3)
  
  t.end()
})

test("order", function(t) {
  t.same(ndarray([0]).pick(0).order, [])
  var f = 1
  for(var d=1; d<=5; ++d) {
    f *= d
    for(var r=0; r<f; ++r) {
      var p = perm.unrank(d, r)
      var x = ndarray([1], dup(d), p)
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
  
  y = x.pick(undefined, 0)
  t.equals(y.get(0), 1)
  t.equals(y.get(1), 0)
  t.equals(y.get(2), 0)
  t.equals(y.get(3), 0)
  t.equals(y.get(4), 5)
  t.equals(y.shape.join(","), "5")

  y = x.pick(null, 0)
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
  t.equals(x.pick(0,0,0).size, 1)
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

  t.equals(x.hi(undefined, 2).shape.join(","), "3,2")

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
  t.same(a.shape.toString(), b.shape.toString())
  for(var i=0; i<5; ++i) {
    t.equals(a.get(i)+1, b.get(i))
  }

  t.end()
})

test("transpose", function(t) {
  var x = ndarray(new Array(6), [2,3])
  var y = x.transpose(1, 0)
  t.equals(x.shape[0], y.shape[1])
  t.equals(x.shape[1], y.shape[0])
  t.equals(x.stride[0], y.stride[1])
  t.equals(x.stride[1], y.stride[0])
  
  var f = 1
  var shape = []
  for(var d=1; d<=5; ++d) {
    shape.push(d)
    f *= d
    var x = ndarray(new Array(f), shape, shape)
    for(var r=0; r<f; ++r) {
      var p = perm.unrank(d, r)
      var xt = x.transpose.apply(x, p)
      var xord = xt.order
      var pinv = invPerm(p.slice(0))
      t.same(xord, pinv)
      for(var i=0; i<d; ++i) {
        t.equals(xt.shape[i], x.shape[p[i]])
        t.equals(xt.stride[i], x.stride[p[i]])
      }
    }
  }
  
  t.end()
})

test("toJSON", function(t) {

  var x = ndarray(new Float32Array(10))
  
  t.same(JSON.stringify(x.shape), "[10]")
  
  t.end()
})

test("generic", function(t) {
  var hash = {}
  var hashStore = {
    get: function(i) {
      return +hash[i]
    },
    set: function(i,v) {
      return hash[i]=v
    },
    length: Infinity
  }
  var array = ndarray(hashStore, [1000,1000,1000])

  t.equals(array.dtype, "generic")
  t.same(array.shape.slice(), [1000,1000,1000])

  array.set(10,10,10, 1)
  t.equals(array.get(10,10,10), 1)
  t.equals(array.pick(10).dtype, "generic")
  t.equals(+array.pick(10).pick(10).pick(10), 1)
  
  t.end()
})