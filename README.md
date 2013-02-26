ndarray
=======
Multidimensional arrays for JavaScript.

Basic Usage
===========
First, install the library using npm:

```sh
npm install ndarray
```

Then you can use it in your projects as follows:

```javascript
var ndarray = require("ndarray")
```
    
To create an array full of zeros, you just call `ndarray.zeros()`.  For example, this makes a 128x128 array of floats:

```javascript
var img = ndarray.zeros([128, 128], ndarray.FLOAT32)
```

You can also wrap existing typed arrays in ndarrays.  For example, here is how you can turn a length 4 typed array into an nd-array:

```javascript
var mat = ndarray(new Float64Array([1, 0, 0, 1]), [2,2])
```

Once you have an nd-array you can access elements using `.set` and `.get`.  For example, here is some code to apply a box filter to an image using these routines:

```javascript
var A = ndarray.zeros([128,128])
var B = ndarray.zeros([128,128])

for(var i=1; i<127; ++i) {
  for(var j=1; j<127; ++j) {
    var s = 0;
    for(var dx=-1; dx<=1; ++dx) {
      for(var dy=-1; dy<=1; ++dy) {
        s += A.get(i+dx, j+dy)
      }
    }
    B.set(i,j,s/9.0)
  }
}
```

You can also pull out views of ndarrays without copying the underlying elements.  Here is an example showing how to update part of a subarray:

```javascript
var x = ndarray.zeros([5, 5])
var y = x.hi(4,4).lo(1,1)

for(var i=0; i<y.shape[0]; ++i) {
  for(var j=0; j<y.shape[1]; ++j) {
    y.set(i,j,1)
  }
}

//Now:
//    x = 0 0 0 0 0
//        0 1 1 1 0
//        0 1 1 1 0
//        0 1 1 1 0
//        0 0 0 0 0
```

It is also possible to do bulk assignment to views of ndarrays:


```javascript
var x = ndarray.zeros([5,5])
var y = ndarray.zeros([3,3])
for(var i=0; i<y.shape[0]; ++i) {
  for(var j=0; j<y.shape[1]; ++j) {
    y.set(i,j,1)
  }
}

x.hi(3,3).assign(y)
x.lo(2,2).assign(y)

//Now:
//    x = 1 1 1 0 0
//        1 1 1 0 0
//        1 1 1 1 1
//        0 0 1 1 1
//        0 0 1 1 1
```

And you can also make copies of arrays:

```javascript
var x = ndarray.zeros([1])
var z = x.clone()
z.set(0, 1)

//Now:
//      x = 0
//
//      z = 1
```

Basic Functions
===============
### `ndarray(typed_array[, shape, stride, offset])`

Creates an n-dimensional array view wrapping the specified typed array.

* `typed_array` is a typed array
* `shape` is the shape of the view (Default: `[typed_array].length`)
* `stride` is the resulting stride of the new array.  (Default: row major)
* `offset` is the offset to start the view (Default: `0`)

Returns an n-dimensional array view of the buffer

### `ndarray.dtype(array)`

Returns the data type of the underlying array.  The result is one of the following strings: `"int8"`, `"int16"`, `"int32"`, `"uint8"`, `"uint16"`, `"uint32"`, `"float32"`, `"float64"` or `null` (the last one occuring only if the array is invalid).  These correspond to the various [typed arrays](http://www.khronos.org/registry/typedarray/specs/latest/).

### `ndarray.zeros(shape[, dtype, order])`

Creates an array filled with zeros.

* `shape` is the shape of the array to create
* `dtype` is the datatype of the array to create.  Must be one of the strings specified in the above list. (Default: `"float64"`)
* `order` is the order of the components of the array, encoded as a permutation.  (Default: row-major)

Returns a view of a newly allocated array.

### `ndarray.order(array)`

Returns the order of the array represented as a permutation.

* `array` is a view of an nd-array

The result gives you an ordered list, representing the strides sorted in ascending order.  For example, if an array in C/row-major order, then:

```javascript
ndarray.order(array) == [ array.shape.length-1, array.shape.length-2 ..., 1, 0 ]
```

While if the array is in FORTRAN/column-major order, you get:

```javascript
ndarray.order(array) == [ 0, 1, ...,  array.shape.length-2, array.shape.length-1 ]
```

Views
=====
The central concept in `ndarray` is the idea of a view.  The way these work is very similar to [SciPy's array slices](http://docs.scipy.org/doc/numpy/reference/arrays.indexing.html).  Views are references to ranges within typed arrays.  To better understand what this means, let's first look at the properties of the view object.  It has exactly 4 variables:

* `array.data` - The underlying typed array of the multidimensional array
* `array.shape` - The shape of the typed array, encodes dimensions
* `array.stride` - The layout of the typed array in memory
* `array.offset` - The starting offset of the array in memory


## Element Access
To access elements of the array, you can use the `set/get` methods.  In psuedocode, the way these are implemented is as follows:

```javascript
function get(i,j, ...) {
  return this.data[this.offset + this.stride[0] * i + this.stride[1] * j + ... ];
}
```

And similarly for `get`:

```javascript
function set(i,j, ..., v) {
  return this.data[this.offset + this.stride[0] * i + this.stride[1] * j + ... ] = v;
}
```

Understanding how views are laid out in memory is important if you are going to use the library.

## Slicing
Given a view, we can change the indexing by shifting, truncating or permuting the strides.  This lets us perform operations like array reversals or matrix transpose in **constant time** (well, technically `O(shape.length)`, but since shape.length is typically less than 4, it might as well be).  To make life simpler, the following interfaces are exposed:

### `array.lo(i,j,k,...)`
This creates a shifted view of the array.  Think of it as taking the upper left corner of the image and dragging it inward by an amount equal to `(i,j,k...)`.

### `array.hi(i,j,k,...)`
This does the dual of `array.lo()`.  Instead of shifting from the top-left, it truncates from the bottom-right of the array, returning a smaller array object.   Using `hi` and `lo` in combination lets you select ranges in the middle of an array.

**Note:**  `hi` and `lo` do not commute.   In general:

```javascript
a.hi(3,3).lo(3,3)  !=  a.lo(3,3).hi(3,3)
```

### `array.step(i,j,k...)`
Changes the stride length by rescaling.  Negative indices flip axes.  For example, here is how you create a reversed view of a 1D array:

```javascript
var reversed = a.step(-1)
```

You can also change the step size to be greater than 1 if you like, letting you skip entries of a list.  For example, here is how to split an array into even and odd components:

```javascript
var evens = a.step(2)
var odds = a.lo(1).step(2)
```

### `array.transpose(p0, p1, ...)`
Finally, for higher dimensional arrays you can transpose the indices in place.  This has the effect of permuting the shape and stride values.  For example, in a 2D array you can calculate the matrix transpose by:

```javascript
M.transpose(1, 0)
```

Or if you have a 3D volume image, you can shift the axes using more generic transformations:

```javascript
volume.transpose(2, 0, 1)
```

## Bulk Operations
Finally, array views expose a few bulk memory operations.

### `clone([o0, o1, o2, ... ])`
Makes a copy of the array with an optionally specified ordering

### `assign(other)`
Copies the contents of `other` into this view.

**TODO:**  Eventually make this support in place moves so you can use it to transpose matrices.  ie:

```javascript
M.transpose(1,0).assign(M)
```


FAQ
===

## What are the goals of this library?

To expose a simple, low level interface for working with contiguous blocks of memory.  The intended applications for this code are:

* WebGL interoperability
* Image processing
* Volume graphics
* Mesh processing
* Scientific computing (ie finite difference based PDE solvers)

This is **not** a linear algebra library, and does not implement things like component-wise arithmetic or tensor operations.  (Though it should be possible to build such features on top of this library as separate module.)  For now, the best option if you need those features would be to use [numeric.js](http://www.numericjs.com/).

## How does it work?

The central concept in ndarray is the idea of a `view`.  A view is basically an [ArrayBufferView](https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays/ArrayBufferView) together with a shape and a stride.  The `shape` of an ndarray is basically its dimensions, while the `stride` describes how it is arranged in memory.  To compute an index in a view, you would use the following recipe:

```javascript
this.data[i0 * this.stride[0] + i1 * this.stride[1] + i2 * this.stide[2] ....]
```

Where `i0, i1, ...` is the index of the element we are accessing.

**Note**: You should *not* assume that `this.stride[this.stride-length-1]=1`.  In general, a view can be arranged in either C/[row major order](http://en.wikipedia.org/wiki/Row-major_order)), FORTRAN/[column major](http://en.wikipedia.org/wiki/Row-major_order#Column-major_order)), or anything in between.  Also, the contents of a view may not be packed tightly, as it could represent some view of a subarray.

## Why use this library instead of manual management of flat typed arrays?

While you can recreate the functionality of this library using typed arrays and manual index arithmetic, in practice doing that is very tedious and error prone.  It also means that you need to pass around extra semantic information, like the shape of the multidimensional array and it's striding.  Using a view, you can get nearly the same performance as a flat typed array, while still maintaining all of the relevant semantic information.

## Why use this library instead of numeric.js?

Numeric.js is a fantastic library, and has many useful features for numerical computing.  If you are working with sparse linear systems, need to do quadratic programming or solve some other complicated problem it should be your go-to library.  However, numeric.js uses arrays-of-native-arrays to encode multidimensional arrays.  Doing this presents several problems:

* Native arrays are much slower than typed arrays. [Proof](https://github.com/mikolalysenko/ndarray-experiments)
* Allocating an array of native-arrays induces an overhead of O(shape.length^2) extra independent JavaScript objects.  Not only does this greatly increase the amount of memory they consume, but it also prevents them from scaling with block size (leading to cache performance problems).
* Slicing arrays-of-arrays is an O(n) operation, while resizing a view is only O(1) and can be done without allocating any intermediate objects.
* Arrays-of-arrays can not be directly uploaded to WebGL, and instead require a costly "unboxing" step to convert them into a typed array.

## What optimizations does this library use?

The following optimizations are planned:

* Typed array back storage
* 0-allocation accessor interface
* In place slicing (ie `subarray()` like semantics)
* Optimized classes for low dimensional views (shape.length <= 4)
* Cache oblivious view assignment and copying

## Does this library do any error checking?

No.  Don't write past the bounds of the array or you will crash/corrupt its contents.

Credits
=======
(c) 2013 Mikola Lysenko. MIT License