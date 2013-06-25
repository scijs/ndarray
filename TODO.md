Goals for rewrite
=================

+ Simplify interface (remove useless methods, reduce clutter)
+ Automatic code generation for slicing operations, no more accessing arguments
+ Support for different storage types, including sparse arrays (use get()/set() if array accessor not present)
+ Thorough code coverage

This part should be easy, but downstream propagations (especially to cwise) will take some time to sort out.

