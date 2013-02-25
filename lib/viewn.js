"use strict";

function ViewN(data, shape, stride) {
  this.data = data;
  this.shape = shape;
  this.stride = stride;
}

ViewN.prototype.get = function() {
  var ptr = 0;
  for(var i=0; i<this.shape.length; ++i) {
    ptr += arguments[i] * this.stride[i];
  }
  return this.data[ptr];
}
ViewN.prototype.set = function() {
  var ptr = 0;
  for(var i=0; i<this.shape.length; ++i) {
    ptr += arguments[i] * this.stride[i];
  }
  var v = arguments[this.shape.length];
  this.data[ptr] = v;
  return v;
}
ViewN.prototype.view = function() {
  return new ViewN(this.data, this.shape, this.stride);
}
ViewN.prototype.clone = function() {
}
ViewN.prototype.assign = function(other) {
}
ViewN.prototype.lo = function() {
  var ptr = 0;
  for(var i=0; i<this.shape.length; ++i) {
    var arg = arguments[i];
    ptr += arg * this.stride[i];
    this.shape[i] -= arg;
  }
  this.data = this.data.subarray(ptr);
  return this;
}
ViewN.prototype.hi = function() {
  for(var i=0; i<this.shape.length; ++i) {
    this.shape[i] = arguments[i];
  }
  return this;
}

module.exports = ViewN;