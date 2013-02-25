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
  var nsize = 1;
  var nstride = new Array(this.shape.length);
  if(arguments.length === this.shape) {
    for(var i=0; i<this.shape.length; ++i) {
      var ord = arguments[i];
      nstride[ord] = nsize;
      nsize *= this.shape[ord];
    }
  } else {
    for(var i=this.shape.length-1; i>=0; --i) {
      nstride[i] = nsize;
      nsize *= this.shape[i];
    }
  }
  var nbuf = this.data.slice(0, nsize);
  var nv = new ViewN(nbuf, this.shape.slice(0), nstride);
  return nv.assign(this);
}
ViewN.prototype.assign = function(other) {
  if(this.shape.length !== other.shape.length) {
    return this;
  }
  for(var i=0; i<shape.length; ++i) {
    if(this.shape[i] !== other.shape[i]) {
      return this;
    }
  }
  
  //FIXME: This should be replaced with a cache oblivious algorithm eventually
  
  
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