"use strict"

var iota = require("iota-array")

function compare1st(a, b) {
  return a[0] - b[0]
}

function order() {
  var stride = this.stride
  var terms = new Array(stride.length)
  var i
  for(i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i]
  }
  terms.sort(compare1st)
  var result = new Array(terms.length)
  for(i=0; i<result.length; ++i) {
    result[i] = terms[i][1]
  }
  return result
}

var ZeroArray = "function ZeroArray(a,b,c,d) {\
this.data = a;\
this.shape = b;\
this.stride = c;\
this.offset = d;\
}\
ZeroArray.prototype.size=0\
ZeroArray.prototype.order=[]\
ZeroArray.prototype.get=function() {\
return Number.NaN\
}\
ZeroArray.prototype.set=function(v) {\
return Number.NaN\
}\
ZeroArray.prototype.lo=\
ZeroArray.prototype.hi=\
ZeroArray.prototype.transpose=\
ZeroArray.prototype.step=\
ZeroArray.prototype.pick=function() {\
return new ZeroArray(this.data,this.shape,this.stride,this.offset)\
}"

function compileConstructor(dtype, dimension) {
  //Special case for 0d arrays
  if(dimension === 0) {
    var compiledProc = new Function(ZeroArray+"ZeroArray.prototype.dtype='"+dtype+"'")
    return compiledProc()
  }
  var useGetters = dtype === "generic"
  var code = ["'use strict'"]
  var indices = iota(dimension)
  var args = indices.map(function(i) { return "i"+i })
  var index_str = "this.offset+" + indices.map(function(i) {
        return ["a[", i, "]*i",i].join("")
      }).join("+")
  var className = ["View", dimension, "d", dtype].join("")
  
  //Create constructor
  code.push(["function ", className, "(a,b,c,d){"].join(""))
    code.push("this.data=a")
    code.push("this.shape=b")
    code.push("this.stride=c")
    code.push("this.offset=d")
  code.push("}")
  
  //Create prototype
  code.push(["var proto=",className,".prototype"].join(""))
  
  //view.dtype:
  code.push(["proto.dtype='", dtype, "'"].join(""))
  
  //view.size:
  code.push("Object.defineProperty(proto,'size',{get:function(){var s=this.shape")
  code.push(["return ", indices.map(function(i) {
    return ["s[",i,"]"].join("")
  }).join("*")].join(""))
  code.push("}})")
  
  //view.order:
  if(dimension===1) {
    code.push("proto.order=[0]")
  } else if(dimension === 2) {
    code.push("Object.defineProperty(proto,'order',{get:function(){return this.stride[0]>this.stride[1]?[1,0]:[0,1]}})")
  } else {
    code.push("Object.defineProperty(proto,'order',{get:ORDER})")
  }
  
  //view.set(i0, ..., v):
  code.push(["proto.set=function ",className,"_set(", args.join(","), ",v){"].join(""))
  code.push("var a=this.stride")
  if(useGetters) {
    code.push(["return this.data.set(", index_str, ",v)}"].join(""))
  } else {
    code.push(["return this.data[", index_str, "]=v}"].join(""))
  }
  
  //view.get(i0, ...):
  code.push(["proto.get=function ",className,"_get(", args.join(","), "){"].join(""))
  code.push("var a=this.stride")
  if(useGetters) {
    code.push(["return this.data.get(", index_str, ")}"].join(""))
  } else {
    code.push(["return this.data[", index_str, "]}"].join(""))
  }
  
  //view.hi():
  code.push(["proto.hi=function ",className,"_hi(",args.join(","),"){var a=this.shape"].join(""))
  var hiShape = new Array(dimension)
  for(var i=0; i<dimension; ++i) {
    hiShape[i] = ["typeof i", i, "!=='number'?a[", i, "]:i", i,"|0"].join("")
  }
  code.push(["return new ", className, "(this.data,[", hiShape.join(","), "],this.stride.slice(0),this.offset)}"].join(""))
  
  //view.lo():
  code.push(["proto.lo=function ",className,"_lo(",args.join(","),"){var a=this.shape.slice(0),b=this.offset,c=this.stride.slice(0),d=0"].join(""))
  for(var i=0; i<dimension; ++i) {
    code.push(["if(typeof i", i, "==='number'){"].join(""))
    code.push(["d=i",i,"|0"].join(""))
    code.push(["b+=c[",i,"]*d"].join(""))
    code.push(["a[",i,"]-=d"].join(""))
    code.push("}")
  }
  code.push(["return new ", className, "(this.data,a,c,b)}"].join(""))
  
  //view.step():
  code.push(["proto.step=function ",className,"_step(",args.join(","),"){var a=this.shape.slice(0),b=this.stride.slice(0),c=this.offset,d=0,ceil=Math.ceil"].join(""))
  for(var i=0; i<dimension; ++i) {
    code.push("if(typeof i"+i+"==='number'){")
      code.push("d=i"+i+"|0")
      code.push("if(d<0){")
        code.push("c+=b["+i+"]*(a["+i+"]-1)")
        code.push("a["+i+"]=ceil(-a["+i+"]/d)")
      code.push("}else{")
        code.push("a["+i+"]=ceil(a["+i+"]/d)")
      code.push("}")
      code.push("b["+i+"]*=d")
    code.push("}")
  }
  code.push(["return new ", className, "(this.data,a,b,c)}"].join(""))
  
  //view.transpose():
  var tShape = new Array(dimension)
  var tStride = new Array(dimension)
  for(var i=0; i<dimension; ++i) {
    tShape[i] = ["a[i", i, "|0]"].join("")
    tStride[i] = ["b[i", i, "|0]"].join("")
  }
  code.push(["proto.transpose=function ",className,"_transpose(",args,"){var a=this.shape,b=this.stride;return new ", className, "(this.data,[", tShape.join(","), "],[", tStride.join(","), "],this.offset)}"].join(""))
  
  //view.pick():
  code.push(["proto.pick=function ",className,"_pick(",args,"){var a=[],b=[],c=this.offset,d=this.shape,e=this.stride"].join(""))
  for(var i=0; i<dimension; ++i) {
    code.push(["if(i",i,">=0){c=(c+e[",i,"]*i",i,")|0}else{a.push(d[",i,"]);b.push(e[",i,"])}"].join(""))
  }
  code.push("return CTOR(this.data,a,b,c)}")
    
  //Add return statement
  code.push("return "+className)
  
  //Compile procedure
  var procedure = new Function("CTOR", "ORDER", code.join("\n"))
  return procedure(constructNDArray, order)
}

function arrayDType(data) {
  if(data instanceof Float64Array) {
    return "float64";
  } else if(data instanceof Float32Array) {
    return "float32"
  } else if(data instanceof Int32Array) {
    return "int32"
  } else if(data instanceof Uint32Array) {
    return "uint32"
  } else if(data instanceof Uint8Array) {
    return "uint8"
  } else if(data instanceof Uint16Array) {
    return "uint16"
  } else if(data instanceof Int16Array) {
    return "int16"
  } else if(data instanceof Int8Array) {
    return "int8"
  } else if(data instanceof Array) {
    return "array"
  }
  return "generic"
}

var CACHED_CONSTRUCTORS = {}
function constructNDArray(data, shape, stride, offset) {
  var dtype = arrayDType(data)
  var dimension = shape.length
  var ctor_name = dtype + dimension
  var ctor = CACHED_CONSTRUCTORS[ctor_name]
  if(ctor) {
    return new ctor(data, shape, stride, offset)
  }
  ctor = compileConstructor(dtype, dimension)
  CACHED_CONSTRUCTORS[ctor_name] = ctor
  return new ctor(data, shape, stride, offset)
}

function wrappedNDArrayCtor(data, shape, stride, offset) {
  if(shape === undefined) {
    shape = [ data.length ]
  }
  if(stride === undefined) {
    var d = shape.length
    stride = new Array(d)
    for(var i=d-1, sz=1; i>=0; --i) {
      stride[i] = sz
      sz *= shape[i]
    }
  }
  if(offset === undefined) {
    offset = 0
    var d = shape.length
    for(var i=0; i<d; ++i) {
      if(stride[i] < 0) {
        offset -= (shape[i]-1)*stride[i]
      }
    }
  }
  return constructNDArray(data, shape, stride, offset)
}

module.exports = wrappedNDArrayCtor