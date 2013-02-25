"use strict";

function View0(data, shape, stride) {
  this.data = data;
}
View0.prototype.shape = [];
View0.prototype.stride = [];

View0.prototype.get = function(i) {
  return this.data[0];
}
View0.prototype.set = function(i, v) {
  this.data[0] = v;
  return v;
}
View0.prototype.view = function() {
  return new View0(this.data);
}
View0.prototype.clone = function() {
  return new View0(this.data.slice(0));
}
View0.prototype.assign = function(other) {
  if(other.shape.length > 0) {
    return this;
  }
  this.data[0] = other.data[0];
  return this;
}
View0.prototype.lo = function() {
  return this;
}
View0.prototype.hi = function() {
  return this;
}

module.exports = View0;