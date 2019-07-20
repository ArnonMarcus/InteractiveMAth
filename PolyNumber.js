

class PolyNumber {
    variable;
    orientation;
    coefficients;
    
    constructor(coefficients=[0], orientation=ORIENTATION.COLUMN) {
        this.variable = VARIABLES[orientation];
        this.orientation = orientation;
        this.coefficients = coefficients instanceof PolyNumber ? 
            coefficients.coefficients : coefficients;
    }
    
    toString() {return this.expression};
    get expression() {
        if (this.is_zero) return `0${this.variable}°`;

        const lines = [];
        const deg = this.deg;

        let suffix;
        let prefix;
        let coefficient;
        let is_first_non_zero;
        
        for (const [index, value] of this.coefficients.entries()) {
            if (value === 0 || index > deg) continue;
            if (index === 0) {lines.push(value); continue;}

            is_first_non_zero = this.allZeros(index);
            suffix = this.constructor._formatSuffix(index);
            prefix = this.constructor._formatPrefix(value, is_first_non_zero);
            coefficient = this.constructor._formatValue(value, is_first_non_zero);

            lines.push([prefix, coefficient, this.variable, suffix].join(''));
        }

        return lines.join('');
    }

    get notation() {return this.notation_lines.join('\n')};
    get notation_height() {return this.is_row ? 3 : this.height + 1}
    get notation_width() {return 3 + this.is_row ? this.total_length : this.max_length}
    get notation_lines() {
        const width = this.is_row ? this.total_length : this.max_length;
        return this.is_row ? [
            '┏'.padEnd(width + 1),
            '┃'+this.string+' )',
            '┗'.padEnd(width + 1)
        ] : [
            '┏'+'━'.repeat(width)+'┓',
            ...this.strings.map(
                (s) => s
                    .padEnd(s.length + 1)
                    .padStart( width + 2)
            )
        ]
    }

    get is_row() {return this.orientation === ORIENTATION.ROW}
    get is_column() {return this.orientation === ORIENTATION.COLUMN}
    
    get height() {return this.is_row ? 1 : this.coefficients.length}
    get width() {return this.is_column ? 1 : this.coefficients.length}

    get string() {return this.strings.join(' ')}
    get strings() {return strings(this.coefficients)}

    get lengths() {return lengths(this.strings)}
    get total_length() {return this.string.length}
    get max_length() {return max(...this.lengths)}
    get sum_lengths() {return sum(this.lengths)}
    
    get msc() {return this.coefficients[this.deg]}
    get deg() {
        for (let i = this.coefficients.length - 1; i >= 0; i--)
            if (this.coefficients[i] !== 0)
                return i;
    }
    
    get is_zero() {return this.coefficients.every(__ZER_MAP)}
    allZeros = (up_to=this.coefficients.length) => all_zeros(this.coefficients, up_to);
    copy = () => new this.constructor([...this.coefficients]);
    equals(other) {
        const deg = new Sides(this.deg, other.deg);

        if (deg.left !== deg.right) return false;
        if (deg.max !== undefined)
            for (let i = 0; i <= deg.max; i++)
                if (this.coefficients[i] !== other.coefficients[i])
                    return false;

        return true;
    }
    
    iclr() {
        this.coefficients.length = 1;
        this.coefficients[0] = 0;
        return this;
    }

    irep = (other) => this.constructor._replace(other, this);
    replacedWith(other) {return this.constructor._replace(other)}
    static _replace(other, replaced=new this()) {
        if (Object.is(other, replaced)) return other;
        replaced.coefficients.length = 0;

        if (other instanceof this) replaced.coefficients.push(...other.coefficients);
        if (Array.isArray(other)) replaced.coefficients.push(...other);
        if (typeof other === 'number') replaced.coefficients[0] = other;

        return replaced;
    }

    iinv = () => this.constructor._inverse(this, this);
    get inverted() {return this.constructor._inverse(this)};
    static _inverse(polynumber, inverted=new this()) {
        if (polynumber.is_zero) return inverted.iclr();

        inverted.irep(polynumber);
        for (const i of inverted.coefficients.keys()) inverted.coefficients[i] *= -1;
        
        return inverted;
    }

    ishf = (amount) => this.constructor._shift(this, amount, this);
    shiftedBy = (amount) => this.constructor._shift(this, amount);
    get is_shifter() {return this.allZeros(this.deg) && this.msc === 1}
    static _shift(polynumber, offset, shifted=new this()) {
        if (polynumber.is_zero) return shifted.iclr();

        shifted.irep(polynumber);

        if (offset > 0) {
            shifted.coefficients.length += offset;
            shifted.coefficients.copyWithin(offset);
            shifted.coefficients.fill(0, 0, offset);
        }

        if (offset < 0) {
            shifted.coefficients.reverse();
            shifted.coefficients.length += offset;
            shifted.coefficients.reverse();
        }

        return shifted;
    }

    itrl = (amount) => this.constructor._translate(this, amount, this);
    translatedBy = (amount) => this.constructor._translate(this, amount);
    static _translate(polynumber, amount, translated=new this()) {
        translated.irep(polynumber);
        
        if (amount !== 0) {
            const deg = translated.deg;
            if (deg === undefined)
                translated.coefficients[0] = amount;
            else
                for (let i = 0; i <= deg; i++)
                    translated.coefficients[i] += amount;
        }
            
        return translated;
    }
    
    iscl = (amount) => this.constructor._scale(this, amount, this);
    scaledBy = (amount) => this.constructor._scale(this, amount);
    static _scale(polynumber, factor, scaled=new this()) {
        if (factor === 0 || polynumber.is_zero) return scaled.iclr();

        scaled.irep(polynumber);

        if (factor === 1) return scaled;
        if (factor === -1) return this._inverse(polynumber, scaled);
        for (const i of scaled.coefficients.keys()) scaled.coefficients[i] *= factor;

        return scaled;
    }

    plus = (polynumber) => this.constructor._add(this, polynumber);
    iadd = (polynumber) => this.constructor._add(this, polynumber, this);
    static _add(left, right, added=new this()) {
        const side = new Sides(left, right);
        
        if (side.row_column) return BiPolyNumber.fromRowAndColumn(left, right);
        if (side.column_row) return BiPolyNumber.fromRowAndColumn(right, left);
        
        switch (side.is_number) {
            case SIDE.left: return this._translate(right, left, added);
            case SIDE.right: return this._translate(left, right, added);
            case SIDE.both: return added.irep(left + right);
        }
        
        switch (side.is_zero) {
            case SIDE.both: return added.iclr();
            case SIDE.right: return added.irep(left);
            case SIDE.left: return added.irep(right);
        }

        added.irep(left);

        const deg = new Sides(left.deg, right.deg);
        for (let i = 0; i <= deg.max; i++)
            switch (deg.lessThan(i)) {
                case SIDE.right: added.coefficients[i] = right.coefficients[i]; break;
                case SIDE.both: added.coefficients[i] += right.coefficients[i];
            }

        return added;
    }
    static sum(array, summed=new this()) {        
        const numbers = [];
        const polynumbers = [];
        for (const item of array) {
            if (item instanceof this && !item.is_zero) 
                polynumbers.push(item);
            else if (typeof item === 'number' && item !== 0)
                numbers.push(item);
        }

        if (numbers.length === 0) {
            if (polynumbers.length === 0) return summed.iclr();
            if (polynumbers.length === 1) return summed.irep(polynumbers[0]);
        } else {
            if (polynumbers.length === 0) return summed.irep(sum(numbers));
            if (polynumbers.length === 1) return summed.irep(polynumbers[0]).iadd(sum(numbers));
        }

        summed.coefficients.length = max(...polynumbers.map(p => p.height));
        summed.coefficients.fill(0);
        
        if (numbers.length !== 0)
            summed.coefficients[0] = sum(numbers);
        
        for (const polynumber of polynumbers)
            for (const [index, coefficient] of polynumber.coefficients.entries())
                summed.coefficients[index] += coefficient;

        return summed;
    }
    
    minus = (polynumber) => this.constructor._subtract(this, polynumber);
    isub = (polynumber) => this.constructor._subtract(this, polynumber, this);
    static _subtract(left, right, subtracted=new this()) {
        const side = new Sides(left, right);

        if (side.row_column) return BiPolyNumber.fromRowAndColumn(left, right.inverted);
        if (side.column_row) return BiPolyNumber.fromRowAndColumn(right.inverted, left);
        
        switch (side.is_number) {
            case SIDE.both: return subtracted.irep(left - right);
            case SIDE.left: return subtracted.irep(left).isub(right);
            case SIDE.right: return this._translate(left, -right, subtracted);
        }
        switch (side.is_zero) {
            case SIDE.right: return subtracted.irep(left);
            case SIDE.both: return subtracted.iclr();
            case SIDE.left: return subtracted.irep(right).iinv();
        }

        subtracted.irep(left);
        
        const deg = side.deg;
        for (let i = 0; i <= deg.max; i++)
            switch (deg.lessThan(i)) {
                case SIDE.both: subtracted.coefficients[i] -= right.coefficients[i]; break;
                case SIDE.right: subtracted.coefficients[i] = -right.coefficients[i];
            }

        return subtracted;
    }

    times = (polynumber) => this.constructor._multiply(this, polynumber);
    imul = (polynumber) => this.constructor._multiply(this, polynumber, this);
    static _multiply(left, right, product=new this()) {
        const side = new Sides(left, right);

        if (side.row_column) return new BiPolyNumber(left.coefficients.map((c) => right.scaledBy(c)));
        if (side.column_row) return new BiPolyNumber(right.coefficients.map((c) => left.scaledBy(c)));

        switch (side.is_number) {
            case SIDE.left: return this._scale(right, left, product);
            case SIDE.right: return this._scale(left, right, product);
            case SIDE.both: return product.irep(left * right);
        }
        
        if (side.is_zero !== SIDE.none) return product.iclr();
        switch (side.is_shifter) {
            case SIDE.left: return product.irep(right).ishf(left.deg);
            case SIDE.both: return product.irep(left).ishf(right.deg);
            case SIDE.right: return product.irep(left).ishf(right.deg);
        }

        let coefficients = left.coefficients;
        if (Object.is(product, left)) coefficients = [...coefficients];
        if (Object.is(product, right)) right = right.copy();
        
        product.iclr();

        for (const [i, coefficient] of coefficients.entries())
            if (coefficient !== 0)
                product.iadd(right.scaledBy(coefficient).ishf(i));

        return product;
    }
    static mul(array, product=new this()) {
        const numbers = [];
        const factors = [];
        for (const item of array) {
            if (item instanceof PolyNumber) {
                if (item.is_zero)
                    return product.iclr();
                else
                    factors.push(item);
            } else if (typeof item === 'number') {
                if (item === 0)
                    return product.iclr();
                else
                    numbers.push(item)
            }
        }
        
        if (numbers.length === 0) {
            if (factors.length === 0) return product.iclr();
            if (factors.length === 1) return product.irep(factors[0]);
        } else {
            if (factors.length === 0) return product.irep(mul(numbers));
            if (factors.length === 1) return product.irep(factors[0]).iscl(mul(numbers));
        }
        
        const degrees = factors.map(p => p.deg);
        if (degrees.includes(undefined))
            return product.iclr();

        const product_paths = this._getProductPaths(degrees);
        product.coefficients.length = product_paths.length;
        product.coefficients.fill(0);

        const values = [];
        const results = [];
        
        for (const [y, paths] of product_paths.entries()) {
            results.length = paths.length;

            for (const [i, path] of paths.entries()) {
                values.length = path.length;
                
                for (const [f, fy] of path.entries())
                    values[f] = factors[f].coefficients[fy];

                results[i] = mul(values);
            }

            product.coefficients[y] += sum(results);
        }

        return numbers.length === 0 ? product : product.iscl(mul(numbers));
    }

    over = (polynumber) => this.constructor._divide(this, polynumber);
    idiv = (polynumber) => this.constructor._divide(this, polynumber, this);
    static _divide(dividend, divisor, quotient=new this()) {
        if (divisor === 0 || divisor.is_zero)
            throw `Division by zero!`;

        const side = new Sides(dividend, divisor);
        
        switch (side.is_number) {
            case SIDE.left: throw 'Number/PolyNumber division!!';
            case SIDE.right: return this._scale(dividend, (1.0 / divisor), quotient);
            case SIDE.both: return quotient.irep(dividend / divisor);
        }
        switch (side.is_zero) {
            case SIDE.left: return quotient.iclr();
            case SIDE.right: throw `Division by zero!`;
            case SIDE.both: throw `Division by zero!`;
        }

        if (side.row_column || side.column_row) {
            if (side.is_scalar === SIDE.both)
                return new BiPolyNumber([[dividend / divisor]]);
            else
                return quotient.iclr();
        } 
        
        const deg = side.deg;
        if (deg.right === 0 && deg.left === 0)
            return quotient.irep(dividend.coefficients[0] / divisor.coefficients[0]);

        switch (side.is_shifter) {
            case SIDE.left: return quotient.irep(divisor).ishf(-deg.left);
            case SIDE.both: return quotient.irep(dividend).ishf(-deg.right);
            case SIDE.right: return quotient.irep(dividend).ishf(-deg.right);
        }

        if (Object.is(divisor, quotient)) divisor = divisor.copy();
        const remainder = dividend.copy();
        quotient.iclr();

        const temp = new PolyNumber();
        const denominator_msc = divisor.msc;

        let factor;
        let offset = deg.left - deg.right;

        while (offset >= 0) {
            factor = remainder.msc / denominator_msc;
            quotient.iadd(temp.irep(factor).ishf(offset));
            remainder.isub(temp.irep(divisor).iscl(factor).ishf(offset));
            if (remainder.is_zero) {
                remainder.iclr();
                break;
            }

            offset = remainder.deg - deg.right;
        }

        return quotient;
    }

    cubed = () => this.pow(3);
    icub = () => this.ipow(3);
    
    isqr = () => this.ipow(2);
    squared = () => this.pow(2);
    
    pow = (exponent) => this.constructor._raiseToPower(this, exponent);
    ipow = (exponent) => this.constructor._raiseToPower(this, exponent, this);
    static _raiseToPower(polynumber, exponent, product=new this()) {
        const side = new Sides(polynumber, exponent);
        if (SIDE.left === side.is_zero &&
            SIDE.right === side.is_number && 
            exponent < 0)
            throw `Can not raise zero to a negative power!`;
        
        switch (exponent) {
            case 0: return product.irep(ONE);
            case 1: return product.irep(polynumber);
        }

        product.irep(polynumber);
        if (exponent > 0) 
            for (let e = 1; e < exponent; e++) product.imul(polynumber);
        else 
            for (let e = 1; e > exponent; e--) product.idiv(polynumber);

        return product;
    }
    
    evaluatedAt(num) {
        switch (this.deg) {
            case DEGREE.Undefined: return 0;
            case DEGREE.Number: return this.coefficients[0];
            case DEGREE.Linear: return this.coefficients[0] + this.coefficients[1] * num;
        }

        let result = this.coefficients[0] + this.coefficients[1] * num;
        for (let i = 2; i <= this.deg; i++)
            result += this.coefficients[i] * pow(num, i);

        return result;
    }

    evaluatedToZero() {
        switch (this.deg) {
            case DEGREE.Linear: return -this.coefficients[0] / this.coefficients[1];
            case DEGREE.Quadratic: {
                const a = this.coefficients[2];
                const b = this.coefficients[1];
                const c = this.coefficients[0];

                const two_a = 2 * a;
                const sqrt_of__b_squared_minus_4ac = sqrt(sqr(b) - 4*a*c);

                return [
                    (-b + sqrt_of__b_squared_minus_4ac) / two_a,
                    (-b - sqrt_of__b_squared_minus_4ac) / two_a
                ];
            }
        }
    }
    
    static _getProductPaths(factor_degrees) {
        const deg = sum(factor_degrees);
        const last = factor_degrees.length - 1;
        const path = Array(factor_degrees.length);
        const paths = grid2D(deg + 1, 0);

        function findProductPath(f) {
            const f_deg = factor_degrees[f];
            let y;
            
            for (let fy = 0; fy <= f_deg; fy++) {
                path[f] = fy;

                if (f === last) {
                    y = sum(path);
                    if (y <= deg)
                        paths[y].push([...path]);
                } else
                    findProductPath(f + 1);
            }
        }
        findProductPath(0);

        return paths;
    }

    static _formatValue(value, is_first_non_zero) {
        switch (value) {
            case 1: return '';
            case -1: return is_first_non_zero ? '-' : '';
            default: return is_first_non_zero ? value : abs(value);
        }
    }

    static _formatPrefix(value, is_first_non_zero) {
        if (is_first_non_zero) return '';
        return value > 0 ? ' + ' : ' - ';        
    }

    static _formatSuffix(index) {
        switch (index) {
            case 0: return '';
            case 1: return '';
            case 2: return '²';
            case 3: return '³';
        }
        
        return '^' + index;
    }
}

const C = (...coefficients) => new PolyNumber(coefficients, ORIENTATION.COLUMN, NOTATION);
const R = (...coefficients) => new PolyNumber(coefficients, ORIENTATION.ROW, NOTATION);

const Px = (...coefficients) => C(...coefficients);
const Py = (...coefficients) => R(...coefficients);

const ALPHA = C([0, 1]);
const BETA = R([0, 1]);
const ONE = new PolyNumber([1]);

ALPHA.variable = NOTATION[0];
BETA.variable = NOTATION[1];

