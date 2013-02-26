"use strict";

var View0 = require("./lib/view0.js");
var View1 = require("./lib/view1.js");
var View2 = require("./lib/view2.js");
var ViewN = require("./lib/viewn.js");

function arrayDType(data) {
  if(data instanceof Float64Array) {
    return "float64";
  } else if(data instanceof Float32Array) {
    return "float32";
  } else if(data instanceof Int32Array) {
    return "int32";
  } else if(data instanceof Uint32Array) {
    return "uint32";
  } else if(data instanceof Uint8Array) {
    return "uint8";
  } else if(data instanceof Uint16Array) {
    return "uint16";
  } else if(data instanceof Int16Array) {
    return "int16";
  } else if(data instanceof Int8Array) {
    return "int8";
  }
  return null;
}

//Wraps a typed array as an ndarray
function wrap(tarray, shape, stride, offset) {
  if(!arrayDType(tarray)) {
    throw new Error("Input is not a typed array");
  }
  if(typeof(shape) === "undefined") {
    shape = [ tarray.length ];
  } else {
    var tsz = 1;
    for(var i=0; i<shape.length; ++i) {
      tsz *= shape[i];
    }
    if(tsz > tarray.length) {
      throw new Error("Array shape out of bounds");
    }
  }
  if(typeof(stride) === "undefined") {
    stride = new Array(shape.length);
    var sz = 1;
    for(var i=shape.length-1; i>=0; --i) {
      stride[i] = sz;
      sz *= shape[i];
    }
  } else if(stride.length !== shape.length) {
    throw new Error("Bad stride length");
  }
  if(typeof(offset) === "undefined") {
    offset = 0;
  } else if(offset >= tarray.length || offset < 0) {
    throw new Error("Offset out of range");
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
      return new ViewN(tarray, shape, stride, offset);
  }
}

function dtype(view) {
  return arrayDType(view.data);
}

function zeros(shape, dtype, order) {
  if(typeof(dtype) === "undefined") {
    dtype = "float64";
  }
  //Default row-major order
  if(typeof(order) === "undefined") {
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
      throw new Error("Invalid data type");
    break;
  }
  return wrap(buf, shape, stride, 0);
}

function compare1st(a, b) {
  return a[0] - b[0];
}

function order(view) {
  var terms = new Array(view.shape.length);
  for(var i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(view.stride[i]), i];
  }
  terms.sort(compare1st);
  var result = new Array(view.shape.length);
  for(var i=0; i<result.length; ++i) {
    result[i] = terms[i][1];
  }
  return result;
}

module.exports = wrap;
module.exports.zeros = zeros;
module.exports.dtype = dtype;
module.exports.order = order;
