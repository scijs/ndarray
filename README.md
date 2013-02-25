ndarray
=======
Multidimensional arrays for JavaScript.  Based on these [experiments](https://github.com/mikolalysenko/ndarray-experiments).


Basic Usage
===========
First, install the library using npm:

    npm install ndarray

Then you can use it in your projects as follows:

    var ndarray = require("ndarray");
    

API
===
* to be written *

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

The central concept in ndarray is the idea of a `view`.  A view is basically an [ArrayBufferView](https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays/ArrayBufferView) together with a shape and a stride.  The `shape` of an ndarray is basically its dimensions


## Why use this library instead of manual management of flat typed arrays?

While you can recreate the functionality of this library using typed arrays and manual index arithmetic, in practice doing that is very tedious and error prone.  It also means that you need to pass around extra semantic information, like the shape of the multidimensional array and it's striding.  The

## Why use this library instead of numeric.js?

Numeric.js is a fantastic library, and has many useful features for numerical computing.  If you are working with sparse linear systems, need to do quadratic programming or solve some other complicated problem it should be your go-to library.  However, numeric.js uses arrays-of-native-arrays to encode multidimensional arrays.  Doing this presents several problems:

* Native arrays are much slower than typed arrays. [Proof](https://github.com/mikolalysenko/ndarray-experiments)
* Allocating an array of native-arrays induces an overhead of O(shape.length^2) extra independent JavaScript objects.  Not only does this greatly increase the amount of memory they consume, but it also prevents them from scaling with block size (leading to cache performance problems).
* Slicing arrays-of-arrays is an O(n) operation, while resizing a view is only O(1) and can be done without allocating any intermediate objects.
* Arrays-of-arrays can not be directly uploaded to WebGL, and instead require a costly "unboxing" step to convert them into a typed array.

## What are the downsides?

The main problem with using views is that they are not a native part of JavaScript.  If you want to use multidimensional views in your code, you need to decide on a set of interfaces and conventions for accessing elements and specifying slices.  This means that if you have two different view libraries, code written for one or the other won't be able to interoperate without performing some type of conversion step.

Credits
=======
(c) 2013 Mikola Lysenko. MIT License