"use strict";

function View0(data) {
  this.data = data;
  this.shape = []
  this.stride = [];
  this.offset = 0;
}
View0.prototype.get =
View0.prototype.set = function() {
  return Number.NaN;
}
View0.prototype.clone = function() {
  return new View0(this.data.slice(0,0));
}
View0.prototype.assign = function(other) {
  return this;
}
View0.prototype.lo =
View0.prototype.hi =
View0.prototype.step =
View0.prototype.transpose = function() {
  return new View0(this.data);
}
View0.prototype.toString = function() {
  return "[]";
}

module.exports = View0;