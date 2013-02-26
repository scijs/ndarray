"use strict";

function View0(data) {
  this.data = data;
}
View0.prototype.shape = [];
View0.prototype.stride = [];

View0.prototype.get = function() {
  return Number.NaN;
}
View0.prototype.set = function() {
  return Number.NaN;
}
View0.prototype.clone = function() {
  return new View0(this.data.slice(0,0));
}
View0.prototype.assign = function(other) {
  return this;
}
View0.prototype.lo = function() {
  return new View0(this.data);
}
View0.prototype.hi = function() {
  return new View0(this.data);
}

module.exports = View0;