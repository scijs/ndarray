declare function ndarray(data: ndarray.Data, shape?: number[], stride?: number[], offset?: number): ndarray.NdArray;

declare namespace ndarray {
  type Data =
    Array<number> | Int8Array | Int16Array | Int32Array |
    Uint8Array | Uint16Array | Uint32Array |
    Float32Array | Float64Array | Uint8ClampedArray;

  interface NdArray {
    data: Data;
    shape: number[];
    stride: number[];
    offset: number;
    dtype: 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' |'uint32' |
           'float32' | 'float64' | 'array'| 'uint8_clamped' | 'buffer' | 'generic';
    size: number;
    order: number[];
    dimension: number;
    get(...args: number[]): number;
    set(...args: number[]): number;
    index(...args: number[]): number;
    lo(...args: number[]): NdArray;
    hi(...args: number[]): NdArray;
    step(...args: number[]): NdArray;
    transpose(...args: number[]): NdArray;
    pick(...args: number[]): NdArray;
  }
}

export = ndarray;
