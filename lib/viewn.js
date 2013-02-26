"use strict";

function ViewN(data, shape, stride, offset) {
  this.data = data;
  this.shape = shape;
  this.stride = stride;
  this.offset = offset;
}

ViewN.prototype.get = function() {
  var ptr = this.offset;
  for(var i=0; i<this.shape.length; ++i) {
    ptr += arguments[i] * this.stride[i];
  }
  return this.data[ptr];
}
ViewN.prototype.set = function() {
  var ptr = this.offset;
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
  for(var i=0; i<this.shape.length; ++i) {
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
  if(size === 0) {
    return this;
  }
  var a_ptr = this.offset;
  var b_ptr = other.offset;
  while(true) {
    this.data[a_ptr] = other.data[b_ptr];
    var i = this.shape.length-1;
    while(true) {
      a_ptr += this.stride[i];
      b_ptr += other.stride[i];
      ++index[i];
      if(index[i] >= this.shape[i]) {
        if(i === 0) {
          return this;
        }
        a_ptr -= this.stride[i] * this.shape[i];
        b_ptr -= other.stride[i] * other.shape[i];
        index[i--] = 0;
      } else {
        break;
      }
    }
  }
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
  return new ViewN(this.data, nshape, nstride, noffset);
}
ViewN.prototype.hi = function() {
  var nshape = new Array(this.shape.length);
  for(var i=0; i<nshape.length; ++i) {
    nshape[i] = arguments[i];
  }
  return new ViewN(this.data, nshape, this.stride.slice(0), this.offset);
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
    } else {
      nshape[i] = Math.ceil(this.shape[i] / s);
    }
  }
  return new ViewN(this.data, nshape, nstride, noffset);
}
ViewN.prototype.transpose = function() {
  var nshape = this.shape.slice(0);
  var nstride = this.stride.slice(0);
  for(var i=0; i<nshape.length; ++i) {
    var ord = arguments[i];
    nshape[i] = this.shape[ord];
    nstride[i] = this.stride[ord];
  }
  return new ViewN(this.data, nshape, nstride, noffset);
}


module.exports = ViewN;