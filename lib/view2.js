"use strict";

var ViewN = require("./viewn.js");

var RECURSION_LIMIT = 32;

function View2(data, shape, stride, offset) {
  this.data = data
  this.shape = shape
  this.stride = stride
  this.offset = offset
}
View2.prototype.get = function(i, j) {
  return this.data[this.offset + i * this.stride[0] + j * this.stride[1]]
}
View2.prototype.set = function(i, j, v) {
  return this.data[this.offset + i * this.stride[0] + j * this.stride[1]] = v
}
View2.prototype.hi = ViewN.prototype.hi
View2.prototype.lo = ViewN.prototype.lo
View2.prototype.step = ViewN.prototype.step
View2.prototype.transpose = ViewN.prototype.transpose
View2.prototype.pick = ViewN.prototype.pick
View2.prototype.toString = ViewN.prototype.toString

module.exports = View2;