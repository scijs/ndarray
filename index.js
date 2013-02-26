"use strict";

var View0 = require("./lib/view0.js");
var View1 = require("./lib/view1.js");
var View2 = require("./lib/view2.js");
var ViewN = require("./lib/viewn.js");

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
    return "float64";
  } else if(view.data instanceof Float32Array) {
    return "float32";
  } else if(view.data instanceof Int32Array) {
    return "int32";
  } else if(view.data instanceof Uint32Array) {
    return "uint32";
  } else if(view.data instanceof Uint8Array) {
    return "uint8";
  } else if(view.data instanceof Uint16Array) {
    return "uint16";
  } else if(view.data instanceof Int16Array) {
    return "int16";
  } else if(view.data instanceof Int8Array) {
    return "int8";
  }
  return "unknown";
}

function zeros(shape, dtype, order) {
  if(!dtype) {
    dtype = "float64";
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
  switch(dtype) {
    case "int8":
      buf = new Int8Array(size);
    break;
    case "int16":
      buf = new Int16Array(size);
    break;
    case "int32":
      buf = new Int32Array(size);
    break;
    case "uint8":
      buf = new Uint8Array(size);
    break;
    case "uint16":
      buf = new Uint16Array(size);
    break;
    case "uint32":
      buf = new Uint32Array(size);
    break;
    case "float32":
      buf = new Float32Array(size);
    break;
    case "float64":
      buf = new Float64Array(size);
    break;
    default:
      buf = new Array(size);
    break;
  }
  return wrap(buf, shape, stride);
}

module.exports = wrap;
module.exports.zeros = zeros;
module.exports.dtype = dtype;
