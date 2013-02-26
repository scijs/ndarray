"use strict";

function View2(data, shape, stride) {
  this.data = data;
  this.shape = shape;
  this.stride = stride;
}

View2.prototype.get = function(i, j) {
  return this.data[i * this.stride[0] + j * this.stride[1]];
}
View2.prototype.set = function(i, j, v) {
  this.data[i * this.stride[0] + j * this.stride[1]] = v;
  return v;
}
View2.prototype.clone = function(p0, p1) {
  var nd = this.data.slice(0, this.shape[0] * this.shape[1]);
  var nstride;
  if(p0) {
    if(this.stride[1] === 1 && this.stride[0] === this.shape[1]) {
      return new View2(nd, this.shape.slice(0), this.stride.slice(0));
    }
    nstride = [this.shape[1], 1];
  } else {
    if(this.stride[0] === 1 && this.stride[1] === this.shape[0]) {
      return new View2(nd, this.shape.slice(0), this.stride.slice(0));
    }
    nstride = [1, this.shape[0]];
  }
  var nv = new View2(nd, this.shape.slice(0), nstride);
  return nv.assign(this);
}
View2.prototype.assign = function(other) {
  if(this.shape.length !== other.shape.length ||
     this.shape[0] !== other.shape[0] ||
     this.shape[1] !== other.shape[1]) {
    return this;
  }
  //FIXME: This can be done much faster
  for(var i=0; i<this.shape[0]; ++i) {
    for(var j=0; j<this.shape[1]; ++j) {
      this.set(i,j,other.get(i,j));
    }
  }
  return this;
}
View2.prototype.lo = function(i, j) {
  var nshape = this.shape.slice(0);
  nshape[0] -= i;
  nshape[1] -= j;
  return new View2(this.data.subarray(i*this.stride[0] + j*this.stride[1]), nshape, this.stride.slice(0));
}
View2.prototype.hi = function(i, j) {
  var nshape = this.shape.slice(0);
  nshape[0] -= i;
  nshape[1] -= j;
  return new View2(this.data, nshape, this.stride.slice(0));
}

module.exports = View2;