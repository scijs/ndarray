"use strict";

var RECURSION_LIMIT = 32;

function View2(data, shape, stride) {
  this.data = data;
  this.shape = shape;
  this.stride = stride;
}

View2.prototype.get = function(i, j) {
  return this.data[i * this.stride[0] + j * this.stride[1]];
}
View2.prototype.set = function(i, j, v) {
  this.data[i * this.stride[0] + j * this.stride[1]] = v;
  return v;
}
View2.prototype.clone = function(p0, p1) {
  var nd = this.data.slice(0, this.shape[0] * this.shape[1]);
  var nstride;
  if(p0) {
    if(this.stride[1] === 1 && this.stride[0] === this.shape[1]) {
      return new View2(nd, this.shape.slice(0), this.stride.slice(0));
    }
    nstride = [this.shape[1], 1];
  } else {
    if(this.stride[0] === 1 && this.stride[1] === this.shape[0]) {
      return new View2(nd, this.shape.slice(0), this.stride.slice(0));
    }
    nstride = [1, this.shape[0]];
  }
  var nv = new View2(nd, this.shape.slice(0), nstride);
  return nv.assign(this);
}

//Divide & conquer
function assign_rec(a_data, a_stride_x, a_stride_y,
                    b_data, b_stride_x, b_stride_y,
                    nx, ny, a_ptr, b_ptr) {
  var hnx = nx >> 1;
  var hny = ny >> 1;
  if(nx > RECURSION_LIMIT) {
    if(ny > RECURSION_LIMIT) {
      assign_rec(a_data, a_stride_x, a_stride_y,
                 b_data, b_stride_x, b_stride_y,
                 hnx, hny,
                 a_ptr,
                 b_ptr);
      assign_rec(a_data, a_stride_x, a_stride_y,
                 b_data, b_stride_x, b_stride_y,
                 nx-hnx, hny,
                 a_ptr+hnx*a_stride_x,
                 b_ptr + hnx*b_stride_x);
      assign_rec(a_data, a_stride_x, a_stride_y,
                 b_data, b_stride_x, b_stride_y,
                 hnx, ny-hny,
                 a_ptr+hny*a_stride_y,
                 b_ptr+hny*b_stride_y);
      assign_rec(a_data, a_stride_x, a_stride_y,
                 b_data, b_stride_x, b_stride_y,
                 nx-hnx, ny-hny,
                 a_ptr+hnx*a_stride_x+hny*a_stride_y,
                 b_ptr+hnx*b_stride_x+hny*b_stride_y);
    } else {
      assign_rec(a_data, a_stride_x, a_stride_y,
                 b_data, b_stride_x, b_stride_y,
                 hnx, ny,
                 a_ptr,
                 b_ptr);
      assign_rec(a_data, a_stride_x, a_stride_y,
                 b_data, b_stride_x, b_stride_y,
                 nx-hnx, ny,
                 a_ptr+hnx*a_stride_x,
                 b_ptr + hnx*b_stride_x);
    }
    return;
  } else if(ny > RECURSION_LIMIT) {
    assign_rec(a_data, a_stride_x, a_stride_y,
               b_data, b_stride_x, b_stride_y,
               nx, hny,
               a_ptr,
               b_ptr);
    assign_rec(a_data, a_stride_x, a_stride_y,
               b_data, b_stride_x, b_stride_y,
               nx, ny-hny,
               a_ptr+hny*a_stride_y,
               b_ptr+hny*b_stride_y);
    return;
  }
  for(var i=ny-1; i>=0; --i) {
    for(var j=nx-1; j>=0; --j) {
      a_data[a_ptr] = b_data[b_ptr];
      a_ptr += a_stride_x;
      b_ptr += b_stride_x;
    }
    a_ptr += a_stride_y - nx * a_stride_x;
    b_ptr += b_stride_y - nx * b_stride_x;
  }
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
    //Array strides don't match, use recursive fill
    assign_rec(this.data, this.stride[0], this.stride[1],
              other.data, other.stride[0], other.stride[1],
              this.shape[0], this.shape[1], 0, 0)
  }
  return this;
}
View2.prototype.lo = function(i, j) {
  var nshape = this.shape.slice(0);
  nshape[0] -= i;
  nshape[1] -= j;
  return new View2(this.data.subarray(i*this.stride[0] + j*this.stride[1]), nshape, this.stride.slice(0));
}
View2.prototype.hi = function(i, j) {
  var nshape = this.shape.slice(0);
  nshape[0] -= i;
  nshape[1] -= j;
  return new View2(this.data, nshape, this.stride.slice(0));
}

module.exports = View2;