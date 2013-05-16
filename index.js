"use strict"

var tools = require("./lib/tools.js")
var makeView = require("./lib/viewn.js")

function arrayDType(data) {
  if(data instanceof Float64Array) {
    return "float64";
  } else if(data instanceof Float32Array) {
    return "float32"
  } else if(data instanceof Int32Array) {
    return "int32"
  } else if(data instanceof Uint32Array) {
    return "uint32"
  } else if(data instanceof Uint8Array) {
    return "uint8"
  } else if(data instanceof Uint16Array) {
    return "uint16"
  } else if(data instanceof Int16Array) {
    return "int16"
  } else if(data instanceof Int8Array) {
    return "int8"
  }
  return null
}

function eor(shape, stride, offset) {
  for(var i=0; i<shape.length; ++i) {
    if(shape[i] === 0) {
      return 0
    }
    offset += (shape[i]-1) * stride[i]
  }
  return offset
}

//Wraps a typed array as an ndarray
function wrap(tarray, shape, stride, offset) {
  if(!arrayDType(tarray)) {
    throw new Error("Input is not a typed array")
  }
  if(!shape) {
    shape = [ tarray.length ]
  } else {
    var tsz = 1
    for(var i=0; i<shape.length; ++i) {
      tsz *= shape[i]
    }
    if(tsz > tarray.length) {
      throw new Error("Array shape out of bounds")
    }
  }
  if(!stride) {
    stride = new Array(shape.length)
    var sz = 1
    for(var i=shape.length-1; i>=0; --i) {
      stride[i] = sz
      sz *= shape[i]
    }
  } else if(stride.length !== shape.length) {
    throw new Error("Bad stride length")
  }
  if(!offset) {
    offset = 0
  }
  if(tarray.length > 0) {
    if(offset < 0 || offset >= tarray.length) {
      throw new Error("Offset out of range")
    }
    var e = eor(shape, stride, offset)
    if(e < 0 || e >= tarray.length) {
      throw new Error("Array shape out of bounds")
    }
  } else {
    offset = 0
  }
  return makeView(tarray, shape, stride, offset)
}

function dtype(view) {
  return arrayDType(view.data)
}

function zeros(shape, dtype, order) {
  if(!dtype) {
    dtype = "float64"
  }
  //Default row-major order
  if(!order) {
    order = new Array(shape.length)
    for(var i=shape.length-1, j=0; i>=0; --i, ++j) {
      order[j] = i
    }
  }
  var stride =  new Array(shape.length)
  var size = 1
  for(var i=0; i<shape.length; ++i) {
    stride[order[i]] = size
    size *= shape[order[i]]
  }
  var buf
  switch(dtype) {
    case "int8":
      buf = new Int8Array(size)
    break
    case "int16":
      buf = new Int16Array(size)
    break
    case "int32":
      buf = new Int32Array(size)
    break
    case "uint8":
      buf = new Uint8Array(size)
    break
    case "uint16":
      buf = new Uint16Array(size)
    break
    case "uint32":
      buf = new Uint32Array(size)
    break
    case "float32":
      buf = new Float32Array(size)
    break
    case "float64":
      buf = new Float64Array(size)
    break
    default:
      throw new Error("Invalid data type")
    break
  }
  return makeView(buf, shape, stride, 0)
}

function order(view) {
  return tools.order(view.stride)
}

function size(view) {
  var shape = view.shape
    , d = shape.length
    , r = 1, i
  if(d === 0) {
    return 0
  }
  for(i=0; i<d; ++i) {
    r *= shape[i]
  }
  return r
}

function pstride(shape, order) {
  var i = 0, d = shape.length
  var result = new Array(d), s = 1
  if(order) {
    for(i=0; i<d; ++i) {
      result[order[i]] = s
      s *= shape[order[i]]
    }
  } else {
    for(var i=d-1; i>=0; --i) {
      stride[i] = s
      s *= shape[i]
    }
  }
  return result
}

module.exports = wrap
module.exports.zeros    = zeros
module.exports.dtype    = dtype
module.exports.order    = order
module.exports.size     = size
module.exports.stride   = pstride
module.exports.ctor     = makeView