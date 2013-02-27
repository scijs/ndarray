"use strict";

var ViewN = require("./viewn.js");

var RECURSION_LIMIT = 32;

function View2(data, shape, stride, offset) {
  this.data = data;
  this.shape = shape;
  this.stride = stride;
  this.offset = offset;
}

View2.prototype.get = function(i, j) {
  return this.data[this.offset + i * this.stride[0] + j * this.stride[1]];
}
View2.prototype.set = function(i, j, v) {
  return this.data[this.offset + i * this.stride[0] + j * this.stride[1]] = v;
}
View2.prototype.clone = function(p0, p1) {
  var nd = this.data.slice(this.offset, this.offset + this.shape[0] * this.shape[1]);
  var nstride;
  if(p0) {
    if(this.stride[1] === 1 && this.stride[0] === this.shape[1]) {
      return new View2(nd, this.shape.slice(0), this.stride.slice(0), 0);
    }
    nstride = [this.shape[1], 1];
  } else {
    if(this.stride[0] === 1 && this.stride[1] === this.shape[0]) {
      return new View2(nd, this.shape.slice(0), this.stride.slice(0), 0);
    }
    nstride = [1, this.shape[0]];
  }
  var nv = new View2(nd, this.shape.slice(0), nstride, 0);
  return nv.assign(this);
}

function assign_rec(a_data, a_stride, a_ptr,
                    b_data, b_stride, b_ptr,
                    shape) {
  var d = shape[0] > shape[1] ? 0 : 1;
  if(shape[d] < RECURSION_LIMIT) {
    for(var i=shape[0]-1; i>=0; --i) {
      for(var j=shape[1]-1; j>=0; --j) {
        a_data[a_ptr] = b_data[b_ptr];
        a_ptr += a_stride[1];
        b_ptr += b_stride[1];
      }
      a_ptr += a_stride[0] - a_stride[1] * shape[1];
      b_ptr += b_stride[0] - b_stride[1] * shape[1];
    }
    return;
  }
  var p = shape[d];
  shape[d] = p >> 1;
  assign_rec(a_data, a_stride, a_ptr,
             b_data, b_stride, b_ptr,
             shape);
  shape[d] = p - shape[d] - 1;
  assign_rec(a_data, a_stride, a_ptr + (p>>1) * a_stride[d],
             b_data, b_stride, b_ptr + (p>>1) * b_stride[d],
             shape);
  shape[d] = p;
}

View2.prototype.assign = function(other) {
  if(this.shape.length !== other.shape.length ||
     this.shape[0] !== other.shape[0] ||
     this.shape[1] !== other.shape[1]) {
    return this;
  }
  if(this.stride[0] < this.stride[1] &&
     other.stride[0] < other.stride[1]) {
    var a_ptr = 0;
    var b_ptr = 0;
    for(var i=this.shape[1]-1; i>=0; --i) {
      for(var j=this.shape[0]-1; j>=0; --j) {
        this.data[a_ptr] = other.data[b_ptr];
        a_ptr += this.stride[0];
        b_ptr += other.stride[0]
      }
      a_ptr += this.stride[1] - this.stride[0] * this.shape[0];
      b_ptr += other.stride[1] - other.stride[0] * other.shape[0];
    }    
  } else if(this.stride[1] < this.stride[0] &&
            other.stride[1] < other.stride[0]) {
    var a_ptr = 0;
    var b_ptr = 0;
    for(var i=this.shape[0]-1; i>=0; --i) {
      for(var j=this.shape[1]-1; j>=0; --j) {
        this.data[a_ptr] = other.data[b_ptr];
        a_ptr += this.stride[1];
        b_ptr += other.stride[1]
      }
      a_ptr += this.stride[0] - this.stride[1] * this.shape[1];
      b_ptr += other.stride[0] - other.stride[1] * other.shape[1];
    }
  } else {
    assign_rec(this.data, this.stride, this.offset,
               other.data, other.stride, other.offset,
               this.shape);
  }
  return this;
}

View2.prototype.hi = ViewN.prototype.hi;
View2.prototype.lo = ViewN.prototype.lo;
View2.prototype.step = ViewN.prototype.step;
View2.prototype.transpose = ViewN.prototype.transpose;
View2.prototype.toString = ViewN.prototype.toString;

module.exports = View2;