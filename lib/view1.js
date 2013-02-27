"use strict";

var ViewN = require("./viewn.js");

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

View1.prototype.lo = ViewN.prototype.lo;
View1.prototype.hi = ViewN.prototype.hi;
View1.prototype.step = ViewN.prototype.step;
View1.prototype.transpose = ViewN.prototype.transpose;
View1.prototype.toString = ViewN.prototype.toString;

module.exports = View1;