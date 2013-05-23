"use strict"

var tools = require("./tools.js")

var RECURSION_LIMIT = 32

function ViewN(data, shape, stride, offset) {
  this.data = data
  this.shape = shape
  this.stride = stride
  this.offset = offset
}

ViewN.prototype.get = function() {
  var ptr = this.offset
  for(var i=0; i<this.shape.length; ++i) {
    ptr += arguments[i] * this.stride[i]
  }
  return this.data[ptr]
}
ViewN.prototype.set = function() {
  var ptr = this.offset
  for(var i=0; i<this.shape.length; ++i) {
    ptr += arguments[i] * this.stride[i]
  }
  var v = arguments[this.shape.length]
  this.data[ptr] = v
  return v
}
ViewN.prototype.lo = function() {
  var nshape = this.shape.slice(0)
  var nstride = this.stride.slice(0)
  var noffset = this.offset
  for(var i=0; i<nshape.length; ++i) {
    var x = arguments[i]
    if(typeof x === "number") {
      x |= 0
      if(x < 0) {
        x = nshape[i] + x
      }
      noffset += x * nstride[i]
      nshape[i] -= x
    }
  }
  return new this.constructor(this.data, nshape, nstride, noffset)
}
ViewN.prototype.hi = function() {
  var nshape = new Array(this.shape.length)
  for(var i=0; i<nshape.length; ++i) {
    var x = arguments[i]
    if(typeof x === "number") {
      x |= 0
      if(x < 0) {
        x = this.shape[i] + x
      }
      nshape[i] = x
    } else {
      nshape[i] = this.shape[i]
    }
  }
  return new this.constructor(this.data, nshape, this.stride.slice(0), this.offset)
}
ViewN.prototype.step = function() {
  var nshape = this.shape.slice(0)
  var nstride = this.stride.slice(0)
  var noffset = this.offset
  for(var i=0; i<nshape.length; ++i) {
    var s = arguments[i]
    nstride[i] *= s
    if(s < 0) {
      noffset += this.stride[i] * (this.shape[i] - 1)
      nshape[i] = Math.ceil(-this.shape[i] / s)
    } else if(s > 0) {
      nshape[i] = Math.ceil(this.shape[i] / s)
    }
  }
  return new this.constructor(this.data, nshape, nstride, noffset)
}
ViewN.prototype.transpose = function() {
  var nshape = this.shape.slice(0)
  var nstride = this.stride.slice(0)
  var noffset = this.offset
  for(var i=0; i<nshape.length; ++i) {
    var ord = arguments[i]
    nshape[i] = this.shape[ord]
    nstride[i] = this.stride[ord]
  }
  return new this.constructor(this.data, nshape, nstride, noffset)
}
ViewN.prototype.pick = function() {
  var nshape = []
  var nstride = []
  var noffset = this.offset
  for(var i=0; i<this.shape.length; ++i) {
    if(arguments[i] >= 0) {
      noffset += this.stride[i] * arguments[i]
    } else {
      nshape.push(this.shape[i])
      nstride.push(this.stride[i])
    }
  }
  return CTOR(this.data, nshape, nstride, noffset)
}

ViewN.prototype.toString = function() {
  var buffer = []
  var index = new Array(this.shape.length)
  for(var i=0; i<index.length; ++i) {
    index[i] = 0
  }
  var ptr = this.offset
  while(true) {
    for(var i=index.length-1; i>=0; --i) {
      if(index[i] === 0) {
        buffer.push("[")
      } else {
        break
      }
    }
    var i = this.shape.length-1
    buffer.push(this.data[ptr])
    while(i>=0) {
      ptr += this.stride[i]
      ++index[i]
      if(index[i] >= this.shape[i]) {
        buffer.push("]")
        if(i === 0) {
          return buffer.join("")
        }
        ptr -= this.stride[i] * this.shape[i]
        index[i--] = 0
      } else {
        buffer.push(",")
        break
      }
    }
  }
}

function View0(data) {
  this.data = data
  this.shape = []
  this.stride = []
  this.offset = 0
}
View0.prototype.get =
View0.prototype.set = function() {
  return Number.NaN
}
View0.prototype.lo =
View0.prototype.hi =
View0.prototype.step =
View0.prototype.transpose =
View0.prototype.pick = function() {
  return new View0(this.data)
}
View0.prototype.toString = function() {
  return "[]"
}


function View1(data, shape, stride, offset) {
  this.data = data
  this.shape = shape
  this.stride = stride
  this.offset = offset
}
View1.prototype.get = function(i) {
  return this.data[i * this.stride[0] + this.offset]
}
View1.prototype.set = function(i, v) {
  this.data[i * this.stride[0] + this.offset] = v
  return v
}
View1.prototype.lo = ViewN.prototype.lo
View1.prototype.hi = ViewN.prototype.hi
View1.prototype.step = ViewN.prototype.step
View1.prototype.transpose = ViewN.prototype.transpose
View1.prototype.pick = ViewN.prototype.pick
View1.prototype.toString = ViewN.prototype.toString


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


function View3(data, shape, stride, offset) {
  this.data = data
  this.shape = shape
  this.stride = stride
  this.offset = offset
}
View3.prototype.get = function(i, j, k) {
  return this.data[this.offset + i * this.stride[0] + j * this.stride[1] + k * this.stride[2]]
}
View3.prototype.set = function(i, j, k, v) {
  return this.data[this.offset + i * this.stride[0] + j * this.stride[1] + k * this.stride[2]] = v
}
View3.prototype.hi = ViewN.prototype.hi
View3.prototype.lo = ViewN.prototype.lo
View3.prototype.step = ViewN.prototype.step
View3.prototype.transpose = ViewN.prototype.transpose
View3.prototype.pick = ViewN.prototype.pick
View3.prototype.toString = ViewN.prototype.toString


function CTOR(data, shape, stride, offset) {
  switch(shape.length) {
    case 0:   return new View0(data)
    case 1:   return new View1(data, shape, stride, offset)
    case 2:   return new View2(data, shape, stride, offset)
    case 3:   return new View3(data, shape, stride, offset)
    default:  return new ViewN(data, shape, stride, offset)
  }
}

module.exports = CTOR
