const FORM = ['α', 'β'];
const VARS = ['x', 'y', 'z'];
const SUFFIXES = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

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

const ORIENTATION = {
    COLUMN: 0,
    ROW: 1
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
        is_zero: zer,
        is_shifter: (x) => 'is_shifter' in x && x.is_shifter,
        is_undefined: (x) => x === undefined,
        is_empty: (x) => x.length === 0,
        is_column: (x) => x.orientation === ORIENTATION.COLUMN,
        is_row: (x) => x.orientation === ORIENTATION.ROW
    };
}