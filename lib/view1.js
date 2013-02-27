"use strict";

function View1(data, shape, stride, offset) {
  this.data = data;
  this.shape = shape;
  this.stride = stride;
  this.offset = offset;
}

View1.prototype.get = function(i) {
  return this.data[i * this.stride[0] + this.offset];
}
View1.prototype.set = function(i, v) {
  this.data[i * this.stride[0] + this.offset] = v;
  return v;
}
View1.prototype.clone = function() {
  var nd = this.data.slice(this.offset, this.offset+this.shape[0]);
  if(this.stride[0] === 1) {
    return new View1(nd, this.shape.slice(0), this.stride.slice(0), 0);
  }
  for(var i=0, ptr=0; i<shape[0]; ++i) {
    nd[i] = this.data[ptr];
    ptr += this.stride[0];
  }
  return new View1(nd, shape.slice(0), [1]);
}
View1.prototype.assign = function(other) {
  if(this.shape.length !== other.shape.length ||
     this.shape[0] !== other.shape[0]) {
    return this;
  }
  for(var i=this.shape[0], a_ptr=this.offset, b_ptr=other.offset; i>=0; --i) {
    this.data[a_ptr] = other.data[b_ptr];
    a_ptr += this.stride[0];
    b_ptr += other.stride[0];
  }
  return this;
}
View1.prototype.lo = function(i) {
  return new View1(this.data,
                  [this.shape[0]-i],
                  this.stride.slice(0),
                  this.offset + i * this.stride[0]);
}
View1.prototype.hi = function(i) {
  return new View1(this.data,
                  [this.shape[0]-i],
                  this.stride.slice(0),
                  this.offset);
}
View1.prototype.step = function(s) {
  if(s < 0) {
    return new View1(this.data,
                    [Math.ceil(-this.shape[0]/s)],
                    [this.stride[0] * s],
                    this.offset + (this.shape[0]-1) * this.stride[0]);
  } else if(s > 0) {
    return new View1(this.data,
                    [Math.ceil(this.shape[0]/s)],
                    [this.stride[0] * s],
                    this.offset);
  } else {
    return new View1(this.data,
                    this.shape.slice(0),
                    this.stride.slice(0),
                    this.offset);
  }
}
View1.prototype.transpose = function() {
  return new View1(this.data, this.shape.slice(0), this.stride.slice(0), this.offset);
}

module.exports = View1;