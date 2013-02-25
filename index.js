"use strict";

var View0 = require("./lib/view0.js");
var View1 = require("./lib/view1.js");
var View2 = require("./lib/view2.js");
var ViewN = require("./lib/viewn.js");

var DTYPE = {
  INT8:             0,
  INT16:            1,
  INT32:            2,
  UINT8:            4,
  UINT16:           5,
  UINT32:           6,
  FLOAT32:          8,
  FLOAT64:          9,
  UNSIGNED:         4,
  FLOATING_POINT:   8,
  JSARRAY:          16
};

//Wraps a typed array as an ndarray
function wrap(tarray, shape, stride) {
  if(!stride) {
    stride = new Array(shape.length);
    var sz = 1;
    for(var i=shape.length-1; i>=0; --i) {
      stride[i] = sz;
      sz *= shape[i];
    }
  }
  switch(shape.length) {
  /*
    case 0:
      return new View0(tarray, shape, stride);
    case 1:
      return new View1(tarray, shape, stride);
    case 2:
      return new View2(tarray, shape, stride);
  */
    default:
      return new ViewN(tarray, shape, stride);
  }
}

function dtype(view) {
  if(view.data instanceof Float64Array) {
    return DTYPE.FLOAT64;
  } else if(view.data instanceof Float32Array) {
    return DTYPE.FLOAT32;
  } else if(view.data instanceof Int32Array) {
    return DTYPE.INT32;
  } else if(view.data instanceof Uint32Array) {
    return DTYPE.UINT32;
  } else if(view.data instanceof Uint8Array) {
    return DTYPE.UINT8;
  } else if(view.data instanceof Uint16Array) {
    return DTYPE.UINT16;
  } else if(view.data instanceof Int16Array) {
    return DTYPE.INT16;
  } else if(view.data instanceof Int8Array) {
    return DTYPE.INT8;
  } else if(view.data instanceof Array) {
    return DTYPE.JSARRAY;
  } else {
    return null;
  }
}

function zeros(shape, ndtype, order) {
  if(!ndtype) {
    ndtype = "float64";
  }
  //Default row-major order
  if(!order) {
    order = new Array(shape.length);
    for(var i=shape.length-1, j=0; i>=0; --i, ++j) {
      order[j] = i;
    }
  }
  var stride = new Array(shape.length);
  var size = 1;
  for(var i=0; i<shape.length; ++i) {
    stride[order[i]] = size;
    size *= shape[order[i]];
  }
  var buf;
  switch(ndtype) {
    case DTYPE.INT8:
      buf = new Int8Array(size);
    break;
    case DTYPE.INT16:
      buf = new Int16Array(size);
    break;
    case DTYPE.INT32:
      buf = new Int32Array(size);
    break;
    case DTYPE.UINT8:
      buf = new Uint8Array(size);
    break;
    case DTYPE.UINT16:
      buf = new Uint16Array(size);
    break;
    case DTYPE.UINT32:
      buf = new Uint32Array(size);
    break;
    case DTYPE.FLOAT32:
      buf = new Float32Array(size);
    break;
    case DTYPE.FLOAT64:
      buf = new Float64Array(size);
    break;
    case DTYPE.JSARRAY:
      buf = new Array(size);
    break;
    default:
      buf = null;
  }
  return wrap(buf, nshape, stride);
}


module.exports = wrap;
module.exports.DTYPE = DTYPE;
module.exports.zeros = zeros;
module.exports.dtype = dtype;
