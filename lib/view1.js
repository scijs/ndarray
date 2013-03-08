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
View1.prototype.lo = ViewN.prototype.lo;
View1.prototype.hi = ViewN.prototype.hi;
View1.prototype.step = ViewN.prototype.step;
View1.prototype.transpose = ViewN.prototype.transpose;
View1.prototype.toString = ViewN.prototype.toString;

module.exports = View1;