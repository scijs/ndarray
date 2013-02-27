"use strict";

var tools = require("./tools.js");

var RECURSION_LIMIT = 32;

function ViewN(data, shape, stride, offset) {
  this.data = data;
  this.shape = shape;
  this.stride = stride;
  this.offset = offset;
}

ViewN.prototype.get = function() {
  var ptr = this.offset;
  for(var i=0; i<this.shape.length; ++i) {
    ptr += arguments[i] * this.stride[i];
  }
  return this.data[ptr];
}
ViewN.prototype.set = function() {
  var ptr = this.offset;
  for(var i=0; i<this.shape.length; ++i) {
    ptr += arguments[i] * this.stride[i];
  }
  var v = arguments[this.shape.length];
  this.data[ptr] = v;
  return v;
}
ViewN.prototype.clone = function() {
  var nsize = 1;
  var nstride = new Array(this.shape.length);
  if(arguments.length === this.shape) {
    for(var i=0; i<this.shape.length; ++i) {
      var ord = arguments[i];
      nstride[ord] = nsize;
      nsize *= this.shape[ord];
    }
  } else {
    for(var i=this.shape.length-1; i>=0; --i) {
      nstride[i] = nsize;
      nsize *= this.shape[i];
    }
  }
  var nbuf = this.data.slice(this.offset, this.offset+nsize);
  var nv = new ViewN(nbuf, this.shape.slice(0), nstride, 0);
  return nv.assign(this);
}
function assign_compat(a_data, a_stride, a_ptr,
                       b_data, b_stride, b_ptr,
                       shape) {
  var size = 1;
  var index = new Array(shape.length);
  for(var i=shape.length-1; i>=0; --i) {
    size *= shape[i];
    index[i] = 0;
  }
  while(size>0) {
    a_data[a_ptr] = b_data[b_ptr];
    var i = shape.length-1;
    while(i>=0) {
      a_ptr += a_stride[i];
      b_ptr += b_stride[i];
      ++index[i];
      if(index[i] >= shape[i]) {
        if(i === 0) {
          return this;
        }
        a_ptr -= a_stride[i] * shape[i];
        b_ptr -= b_stride[i] * shape[i];
        index[i--] = 0;
      } else {
        break;
      }
    }
    --size;
  }
}
function assign_rec(a_data, a_stride, a_ptr,
                    b_data, b_stride, b_ptr,
                    shape, rec_end) {
  var max_len = 0;
  var max_axis = rec_end;
  for(var i=rec_end; i<shape.length; ++i) {
    if(shape[i] > max_len) {
      max_len = shape[i];
      max_axis = i;
    }
  }
  if(max_len < RECURSION_LIMIT) {
    assign_compat(a_data, a_stride, a_ptr,
                  b_data, b_stride, b_ptr,
                  shape);
    return;
  }
  shape[max_axis] = max_len >>> 1;
  assign_rec(a_data, a_stride, a_ptr,
             b_data, b_stride, b_ptr,
             shape, rec_end);
  shape[max_axis] = max_len - shape[max_axis];
  assign_rec(a_data, a_stride, a_ptr + a_stride[max_axis] * (max_len>>>1),
             b_data, b_stride, b_ptr + b_stride[max_axis] * (max_len>>>1),
             shape, rec_end);
  shape[max_axis] = max_len;
}
ViewN.prototype.assign = function(other) {
  if(this.shape.length !== other.shape.length) {
    return this;
  }
  for(var i=0; i<this.shape.length; ++i) {
    if(this.shape[i] !== other.shape[i]) {
      return this;
    }
  }  
  var a_order = tools.order(this.stride);
  var b_order = tools.order(other.stride);
  var a_stride_p = this.stride.slice(0);
  var b_stride_p = other.stride.slice(0);
  var i_shape = this.shape.slice(0);
  var rec_end = this.shape.length;
  for(var i=this.shape.length-1; i>=0; --i) {
    if(a_order[i] !== b_order[i]) {
      rec_end = i;
    }
    var p = a_order[i];
    var q = i_shape.length - 1 - i;
    a_stride_p[q] = this.stride[p];
    b_stride_p[q] = other.stride[p];
    i_shape[q] = this.shape[p];
  }
  assign_rec( this.data, a_stride_p, this.offset,
              other.data, b_stride_p, other.offset,
              i_shape, rec_end );
  return this;
}
ViewN.prototype.lo = function() {
  var nshape = this.shape.slice(0);
  var nstride = this.stride.slice(0);
  var noffset = this.offset;
  for(var i=0; i<nshape.length; ++i) {
    var arg = arguments[i];
    noffset += arg * nstride[i];
    nshape[i] -= arg;
  }
  return new ViewN(this.data, nshape, nstride, noffset);
}
ViewN.prototype.hi = function() {
  var nshape = new Array(this.shape.length);
  for(var i=0; i<nshape.length; ++i) {
    nshape[i] = arguments[i];
  }
  return new ViewN(this.data, nshape, this.stride.slice(0), this.offset);
}
ViewN.prototype.step = function() {
  var nshape = this.shape.slice(0);
  var nstride = this.stride.slice(0);
  var noffset = this.offset;
  for(var i=0; i<nshape.length; ++i) {
    var s = arguments[i];
    nstride[i] *= s;
    if(s < 0) {
      noffset += this.stride[i] * (this.shape[i] - 1);
      nshape[i] = Math.ceil(-this.shape[i] / s);
    } else if(s > 0) {
      nshape[i] = Math.ceil(this.shape[i] / s);
    }
  }
  return new ViewN(this.data, nshape, nstride, noffset);
}
ViewN.prototype.transpose = function() {
  var nshape = this.shape.slice(0);
  var nstride = this.stride.slice(0);
  for(var i=0; i<nshape.length; ++i) {
    var ord = arguments[i];
    nshape[i] = this.shape[ord];
    nstride[i] = this.stride[ord];
  }
  return new ViewN(this.data, nshape, nstride, noffset);
}

ViewN.prototype.toString = function() {
  var buffer = [];
  var index = new Array(this.shape.length);
  for(var i=0; i<index.length; ++i) {
    index[i] = 0;
  }
  var ptr = this.offset;
  while(true) {
    for(var i=index.length-1; i>=0; --i) {
      if(index[i] === 0) {
        buffer.push("[");
      } else {
        break;
      }
    }
    var i = this.shape.length-1;
    buffer.push(this.data[ptr]);
    while(i>=0) {
      ptr += this.stride[i];
      ++index[i];
      if(index[i] >= this.shape[i]) {
        buffer.push("]");
        if(i === 0) {
          return buffer.join("");
        }
        ptr -= this.stride[i] * this.shape[i];
        index[i--] = 0;
      } else {
        buffer.push(",")
        break;
      }
    }
  }
}

module.exports = ViewN;