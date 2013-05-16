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
var img = ndarray.zeros([128, 128], "float32")
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


### `ndarray.size(array)`
Computes the size of the flattened ndarray

* `array` is a view of an nd-array

**Returns** The number of elements in the array.

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

### `ndarray.ctor(data, shape, stride, offset)`
Directly constructs a new ndarray without any checking (not recommended, unless you know what you are doing).

* `data` the underlying typed array
* `shape` shape of typed array
* `stride` striding of typed array
* `offset` offset of typed array

**Returns** A new typed array

### `ndarray.stride(shape[, order])`
Computes the stride for a packed ndarray with the given order.  If the order is not specified row major order is assumed.

* `shape` the shape if the array
* `order` the order of the stride

**Returns** The stride of the array

Views
=====
The central concept in `ndarray` is the idea of a view.  The way these work is very similar to [SciPy's array slices](http://docs.scipy.org/doc/numpy/reference/arrays.indexing.html).  Views are references to ranges within typed arrays.  To better understand what this means, let's first look at the properties of the view object.  It has exactly 4 variables:

* `array.data` - The underlying typed array of the multidimensional array
* `array.shape` - The shape of the typed array, encodes dimensions
* `array.stride` - The layout of the typed array in memory
* `array.offset` - The starting offset of the array in memory

Keeping a separate stride means that we can use the same data structure to support both [row major and column major storage](http://en.wikipedia.org/wiki/Row-major_order)


## Element Access
To access elements of the array, you can use the `set/get` methods:

### `array.get(i,j,...)`
Retrieves element `i,j,...` from the array.  In psuedocode, this is implemented as follows:

```javascript
function get(i,j, ...) {
  return this.data[this.offset + this.stride[0] * i + this.stride[1] * j + ... ];
}
```

### `array.set(i,j ..., v)`
Sets element `i,j,...` to `v`. Again, in psuedocode this works like this:

```javascript
function set(i,j, ..., v) {
  return this.data[this.offset + this.stride[0] * i + this.stride[1] * j + ... ] = v;
}
```

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

### `array.pick(p0, p1, ...)`
You can also pull out a subarray from an ndarray by fixing a particular axis.  The way this works is you specify the direction you are picking by giving a list of values.  For example, if you have an image stored as an nxmx3 array you can pull out the channel as follows:

```javascript
var red   = image.pick(-1, -1, 0)
var green = image.pick(-1, -1, 1)
var blue  = image.pick(-1, -1, 2)
```


## Miscellaneous
Finally, there are a few odd ball methods for debugging arrays:

### `array.toString()`
Makes a human readable stringified version of the contents of the view.


FAQ
===

## What are the goals of this library?

To expose a simple, low level interface for working with contiguous blocks of memory.  The intended applications for this code are:

* WebGL interoperability
* Image processing
* Volume graphics
* Mesh processing
* Scientific computing (ie finite difference based PDE solvers)

This is **not** a linear algebra library, and does not implement things like component-wise arithmetic or tensor operations, though you can use it to do that stuff if you like.  If you are interested in those things, check out the following packages which are built on top of ndarray:

* [cwise](http://github.com/mikolalysenko/cwise)
* [ndarray-ops](http://github.com/mikolalysenko/ndarray-ops)

## Why use this library instead of manual management of flat typed arrays?

While you can recreate the functionality of this library using typed arrays and manual index arithmetic, in practice doing that is very tedious and error prone.  It also means that you need to pass around extra semantic information, like the shape of the multidimensional array and it's striding.  Using a view, you can get nearly the same performance as a flat typed array, while still maintaining all of the relevant semantic information.

## Why use this library instead of numeric.js?

Numeric.js is a fantastic library, and has many useful features for numerical computing.  If you are working with sparse linear systems, or need to solve a linear/quadratic programming problem it should be your go-to library.  However, numeric.js uses arrays-of-native-arrays to encode multidimensional arrays, which makes it suboptimal for image processing and solving PDEs on grids. The reasons for this are as follows:

* Native arrays are much slower than typed arrays. [Proof](https://github.com/mikolalysenko/ndarray-experiments)
* Allocating an array of native-arrays induces an overhead of O(n^{d-1}) extra independent JavaScript objects.  Not only does this greatly increase the amount of memory consumed, but it also prevents them from scaling with block size (leading to cache performance problems).
* Slicing arrays-of-arrays is an O(n) operation, while resizing a view is only O(1) and can be done without allocating any intermediate objects.
* Arrays-of-arrays can not be directly uploaded to WebGL, and instead require a costly "unboxing" step to convert them into a typed array.

## What optimizations does this library use?

* Typed array storage
* In place slicing (ie `subarray()` like semantics)
* Optimized classes for low dimensional views (shape.length <= 4)
* Cache oblivious view assignment and copying (implemented in `cwise`)

## Does this library do any error checking?

The constructors are validated, but slicing and element access are not, since this would be prohibitively slow.  If you write past the bounds of the array, you will corrupt the contents of the underlying array object.

Credits
=======
(c) 2013 Mikola Lysenko. MIT License