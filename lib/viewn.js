"use strict"

var tools = require("./tools.js")

var RECURSION_LIMIT = 32

function ViewN(data, shape, stride, offset) {
  this.data = data
  this.shape = shape
  this.stride = stride
  this.offset = offset
}

ViewN.prototype.get = function() {
  var ptr = this.offset
  for(var i=0; i<this.shape.length; ++i) {
    ptr += arguments[i] * this.stride[i]
  }
  return this.data[ptr]
}
ViewN.prototype.set = function() {
  var ptr = this.offset
  for(var i=0; i<this.shape.length; ++i) {
    ptr += arguments[i] * this.stride[i]
  }
  var v = arguments[this.shape.length]
  this.data[ptr] = v
  return v
}
ViewN.prototype.lo = function() {
  var nshape = this.shape.slice(0);
  var nstride = this.stride.slice(0);
  var noffset = this.offset;
  for(var i=0; i<nshape.length; ++i) {
    var arg = arguments[i];
    noffset += arg * nstride[i];
    nshape[i] -= arg;
  }
  return new this.constructor(this.data, nshape, nstride, noffset);
}
ViewN.prototype.hi = function() {
  var nshape = new Array(this.shape.length);
  for(var i=0; i<nshape.length; ++i) {
    nshape[i] = arguments[i];
  }
  return new this.constructor(this.data, nshape, this.stride.slice(0), this.offset);
}
ViewN.prototype.step = function() {
  var nshape = this.shape.slice(0);
  var nstride = this.stride.slice(0);
  var noffset = this.offset;
  for(var i=0; i<nshape.length; ++i) {
    var s = arguments[i];
    nstride[i] *= s;
    if(s < 0) {
      noffset += this.stride[i] * (this.shape[i] - 1);
      nshape[i] = Math.ceil(-this.shape[i] / s);
    } else if(s > 0) {
      nshape[i] = Math.ceil(this.shape[i] / s);
    }
  }
  return new this.constructor(this.data, nshape, nstride, noffset);
}
ViewN.prototype.transpose = function() {
  var nshape = this.shape.slice(0)
  var nstride = this.stride.slice(0)
  var noffset = this.offset
  for(var i=0; i<nshape.length; ++i) {
    var ord = arguments[i]
    nshape[i] = this.shape[ord]
    nstride[i] = this.stride[ord]
  }
  return new this.constructor(this.data, nshape, nstride, noffset);
}

ViewN.prototype.toString = function() {
  var buffer = [];
  var index = new Array(this.shape.length);
  for(var i=0; i<index.length; ++i) {
    index[i] = 0;
  }
  var ptr = this.offset;
  while(true) {
    for(var i=index.length-1; i>=0; --i) {
      if(index[i] === 0) {
        buffer.push("[");
      } else {
        break;
      }
    }
    var i = this.shape.length-1;
    buffer.push(this.data[ptr]);
    while(i>=0) {
      ptr += this.stride[i];
      ++index[i];
      if(index[i] >= this.shape[i]) {
        buffer.push("]");
        if(i === 0) {
          return buffer.join("");
        }
        ptr -= this.stride[i] * this.shape[i];
        index[i--] = 0;
      } else {
        buffer.push(",")
        break;
      }
    }
  }
}

module.exports = ViewN;