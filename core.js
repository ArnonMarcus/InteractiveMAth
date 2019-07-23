const abs = Math.abs;
const max = Math.max;
const min = Math.min;
const pow = Math.pow;
const sqr = (x) => x * x;
const mul = (a, b) => a * b;
const add = (a, b) => a + b;
const sub = (a, b) => a - b;
const div = (a, b) => a / b;
const str = (x) => `${x}`;
const deg = (x) => x.deg;
const hgt = (x) => x.height;
const pol = (x) => x.hasOwnProperty('array');
const len = (x) => x.hasOwnProperty('array') ? x.array.length : x.length;
const zer = (x) => x.hasOwnProperty('is_zero')? x.is_zero : x === 0;
const sum = (...arr) => arr.sum();
const prd = (...arr) => arr.prd(); 

Array.prototype.min = function () {return min(...this)};
Array.prototype.max = function () {return max(...this)};
Array.prototype.sum = function () {return this.reduce(add, 0)};
Array.prototype.prd = function () {return this.reduce(mul, 1)};

Array.prototype.lengths = function () {return this.map(len)};
Array.prototype.min_len = function () {return this.lengths().min()};
Array.prototype.max_len = function () {return this.lengths().max()};
Array.prototype.sum_len = function () {return this.lengths().sum()};

Array.prototype.heights = function () {return this.map(hgt)};
Array.prototype.min_hgt = function () {return this.heights().min()};
Array.prototype.max_hgt = function () {return this.heights().max()};
Array.prototype.sum_hgt = function () {return this.heights().sum()};

Array.prototype.degrees = function () {return this.map(deg)};
Array.prototype.min_deg = function () {return this.degrees().min()};
Array.prototype.max_deg = function () {return this.degrees().max()};
Array.prototype.sum_deg = function () {return this.degrees().sum()};

Array.prototype.strings = function () {return this.map(str)};
Array.prototype.min_str = function () {return this.strings().min()};
Array.prototype.max_str = function () {return this.strings().max()};
Array.prototype.sum_str = function (d='') {return this.strings().join(d)};

Array.prototype.clear = function () {this.length = 0; return this};
Array.prototype.zero = function () {this.clear()[0] = 0; return this};
Array.prototype.zeros = function (n=null) {if (n !== null) this.length = n; this.fill(0); return this};
Array.prototype.is_zero = function (to=null) {return (to === null ? this : this.slice(0, to)).every(zer)};

const zip = (...arr) => {
    const zipped = Array(arr.max_len());
    for (let i of zipped.keys())
        zipped[i] = Array(arr.length);

    return arr.reduce(zipper, zipped);
};

function zipper(r, a, n) {
    for (const [i, v] of a.entries())
        r[i][n] = v;

    return r;
}

function grid2D(width=1, height=1, fill=null, grid=[]) {
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

function grid3D(width=1, height=1, depth=1, fill=null, grid=[]) {
    grid.length = depth;
    
    for (let i of grid.keys())
        grid[i] = grid2D(width, height, fill);

    return grid;
}

function factorsOf(n) {
    const results =[[1, n]];

    for (let i = 2; i <= n / 2; i++) {
        let x = findFactors(n, i, i - 1, results);
        while (x > 0) x = findFactors(n, i, x - 1, results);
    }

    return results;
}

function findFactors(x, n, k, results) {
    let i = k;
    let prod = n;
    let result = [];

    result.push(n);
    while (i > 1) {
        if (prod * i === x) {
            prod = prod * i;
            result.push(i);
            results.push(result);
            return i;
        } else if (prod * i < x) {
            prod = prod * i;
            result.push(i);
        } else i--;
    }

    return k;
}