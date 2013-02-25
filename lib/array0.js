"use strict";

function Array0(data, shape, stride) {
  this.data = data;
}
Array0.prototype.shape = [];
Array0.prototype.stride = [];

Array0.prototype.get = function(i) {
  return this.data[0];
}
Array0.prototype.set = function(i, v) {
  this.data[0] = v;
  return v;
}
Array0.prototype.view = function() {
  return new Array0(this.data);
}
Array0.prototype.clone = function() {
  return new Array0(this.data.slice(0));
}
Array0.prototype.assign = function(other) {
  if(other.shape.length > 0) {
    return this;
  }
  this.data[0] = other.data[0];
  return this;
}
Array0.prototype.lo = function() {
  return this;
}
Array0.prototype.hi = function() {
  return this;
}
Array0.prototype.transpose = function() {
  return this;
}

module.exports = Array0;