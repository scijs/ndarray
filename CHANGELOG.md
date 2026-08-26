# Changelog

## 1.1.1 (2026-08-25)

Note: published as 1.1.1 because the version number 1.1.0 was published and unpublished in 2014, and npm permanently reserves it.

- Added `Float16Array` support: it now gets a `"float16"` dtype instead of falling back to `"generic"`, which previously caused `.get()` to throw with `this.data.get is not a function` ([#49](https://github.com/scijs/ndarray/pull/49), thanks [@NAThompson](https://github.com/NAThompson))
