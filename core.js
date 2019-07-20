const abs = Math.abs;
const max = Math.max;
const pow = Math.pow;
const sqrt = Math.sqrt;

const __STR_MAP = (number) => `${number}`;
const __ZER_MAP = (number) => typeof number === 'number' ? number === 0 : number.is_zero;
const __LEN_MAP = (array) => array.length;
const __SUM_REDUCER = (a, b) => a + b;
const __MUL_REDUCER = (a, b) => a * b;
const mul = (array) => array.reduce(__MUL_REDUCER, 1);
const sum = (array) => array.reduce(__SUM_REDUCER, 0);
const strings = (array) => array.map(__STR_MAP);
const lengths = (arrays) => arrays.map(__LEN_MAP);
const longest = (arrays) => max(...lengths(arrays));
const all_zeros = (array, up_to=array.length) => array.slice(0, up_to).every(__ZER_MAP);
const is_poly = (number) => number instanceof PolyNumber || number instanceof BiPolyNumber;

const sqr = (n) => n * n;

const ORIENTATION = {
    COLUMN: 0,
    ROW: 1
};

const NOTATION = [
    'α',
    'β'
];

const VARIABLES = [
    'x', 
    'y', 
    'z'
];

const BINARY_OPS = {
    '+': 'iadd',
    '-': 'isub',
    'x': 'imul',
    '/': 'idiv',
    '^': 'ipow',
    '<': 'irep',
    '>': 'ishf',
    '|': 'itrl',
    '*': 'iscl',
    '~': 'equals'
};


const UNARY_OPS = {
    '!': 'iinv',
    '%': 'itrp',
    '0': 'iclr',
    '1': 'copy',
    '2': 'isqr',
    '3': 'icub'
};

const DEGREE = {
    Undefined: undefined,
    Number: 0,
    Linear: 1,
    Quadratic: 2,
    Cubic: 3
};

const SIDE = {
    none: 0,
    left: 1,
    right: 2,
    both: 3
};

class Sides {
    left;
    right;

    constructor (left, right) {
        this.left = left;
        this.right = right;
    }

    lessThan(value) {
        switch (this.is_undefined) {
            case SIDE.both: return SIDE.none;
            case SIDE.left: return value > this.right ? SIDE.none : SIDE.right;
            case SIDE.right: return value > this.left ? SIDE.none : SIDE.left;
        }

        if (this.right === this.left)
            return value > this.left ? SIDE.none : SIDE.both;

        if (value > this.left) return SIDE.right;
        if (value > this.right) return SIDE.left;
        return SIDE.both;
    }
    get is_greater() {
        return this.right === this.left ? SIDE.none : (
            this.right > this.left ? SIDE.right : SIDE.left
        )
    }

    get row_column() {return this.left.is_row && this.right.is_column}
    get column_row() {return this.left.is_column && this.right.is_row}

    get is_undefined() {return this._map(this.constructor._maps.is_undefined).is_true}
    get is_shifter() {return this._map(this.constructor._maps.is_shifter).is_true}
    get is_scalar() {return this._map(this.constructor._maps.is_scalar).is_true}
    get is_number() {return this._map(this.constructor._maps.is_number).is_true}
    get is_empty() {return this._map(this.constructor._maps.is_empty).is_true}
    get is_zero() {return this._map(this.constructor._maps.is_zero).is_true}
    get is_row() {return this._map(this.constructor._maps.is_row).is_true}
    get is_column() {return this._map(this.constructor._maps.is_column).is_true}
    get is_true() {
        if (this.right && this.left) return SIDE.both;
        if (this.right && !this.left) return SIDE.right;
        if (!this.right && this.left) return SIDE.left;
        if (!this.right && !this.left) return SIDE.none;
    }
    
    get deg() {return this._map(this.constructor._maps.degree)}    
    get max() {
        switch (this.is_undefined) {
            case SIDE.both: return undefined;
            case SIDE.left: return this.right;
            case SIDE.right: return this.left;
        }

        return max(this.left, this.right);
    }

    _map = (func)  => new Sides(func(this.left), func(this.right));
    static _maps = {
        degree: (x) => x.deg,
        is_scalar: (x) => x.deg === 0,
        is_number: (x) => typeof x === 'number',
        is_zero: __ZER_MAP,
        is_shifter: (x) => 'is_shifter' in x && x.is_shifter,
        is_undefined: (x) => x === undefined,
        is_empty: (x) => x.length === 0,
        is_column: (x) => x.orientation === ORIENTATION.COLUMN,
        is_row: (x) => x.orientation === ORIENTATION.ROW
    };
}

function zipper(result, array, array_number) {
    for (let [i, v] of array.entries())
        result[i][array_number] = v;

    return result;
}
function zip(...arrays) {
    const zipped = [];
    zipped.length = longest(arrays);
    for (let i of zipped.keys())
        zipped[i] = Array(arrays.length);

    return arrays.reduce(zipper, zipped);
}

function zeros(amount=0, out=null) {
    if (!Array.isArray(out))
        out = [];

    out.length = amount;
    out.fill(0);

    return out;
}

function grid2D(width=1, height=1, fill=null, grid=null) {
    if (!Array.isArray(grid))
        grid = [];

    grid.length = width;
    
    let item;
    for (let i of grid.keys()) {
        item = [];
        item.length = height;
        
        grid[i] = item;
        if (fill !== null) 
            item.fill(fill);
    }

    return grid;
}

function grid3D(width=1, height=1, depth=1, fill=null, grid=null) {
    if (!Array.isArray(grid))
        grid = [];

    grid.length = depth;
    
    for (let i of grid.keys())
        grid[i] = grid2D(width, height, fill);

    return grid;
}

function factorsOf(N) {
    const results =[[1, N]];

    for (let i = 2; i <= N/2; i++) {
        let x = findFactors(N, i, i - 1, results);
        while (x > 0) x = findFactors(N, i, x - 1, results);
    }

    return results;
}

function findFactors(N, n, k, results) {
    let i = k;
    let prod = n;
    let result = [];

    result.push(n);
    while (i > 1) {
        if (prod * i === N) {
            prod = prod * i;
            result.push(i);
            results.push(result);
            return i;
        } else if (prod * i < N) {
            prod = prod * i;
            result.push(i);
        } else i--;
    }

    return k;
}