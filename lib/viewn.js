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
  var size = 1;
  var index = new Array(this.shape.length);
  for(var i=0; i<this.shape.length; ++i) {
    size *= this.shape[i];
    index[i] = 0;
  }
  while(true) {
    var a_ptr = 0;
    var b_ptr = 0;
    var i = this.shape.length-1;
    while(true) {
      a_ptr += this.stride[i];
      b_ptr += other.stride[i];
      ++this.index[i];
      if(this.index[i] >= this.shape[i]) {
        if(i === 0) {
          return this;
        }
        this.index[i] = 0;
        a_ptr -= this.stride[i] * this.shape[i];
        b_ptr -= this.stride[i] * this.shape[i];
      } else {
        break;
      }
    }
    this.data[a_ptr] = other.data[b_ptr];
  }
}
ViewN.prototype.lo = function() {
  var ptr = 0;
  var nshape = this.shape.slice(0);
  var nstride = this.stride.slice(0);
  for(var i=0; i<nshape.length; ++i) {
    var arg = arguments[i];
    ptr += arg * nstride[i];
    nshape[i] -= arg;
  }
  return new ViewN(this.data.subarray(ptr), nshape, nstride);
}
ViewN.prototype.hi = function() {
  var nshape = new Array(this.shape.length);
  for(var i=0; i<nshape.length; ++i) {
    nshape[i] = arguments[i];
  }
  return new ViewN(this.data, nshape, this.stride.slice(0));
}

module.exports = ViewN;