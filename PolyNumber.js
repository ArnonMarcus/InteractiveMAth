

class PolyNumber {
    static STANDARD_FORM = 'x';
    co;
    
    constructor(co=[0]) {this.co = co}
    toString() {return this.str};
    toStandardForm(form=this.constructor.STANDARD_FORM) {
        if (this.is_zero) return `0${form}°`;

        const result = [];
        const deg = this.deg;
        const cls = this.constructor;

        let suffix;
        let prefix;
        let coefficient;
        let is_first_non_zero;
        
        for (let [index, value] of this.co.entries()) {
            if (value === 0 || index > deg) continue;
            if (index === 0) {result.push(value); continue;}

            is_first_non_zero = this.allZeros(index);
            suffix = cls._formatSuffix(index);
            prefix = cls._formatPrefix(value, is_first_non_zero);
            coefficient = cls._formatValue(value, is_first_non_zero);

            result.push([prefix, coefficient, form, suffix].join(''));
        }

        return result.join('');
    }

    get str() {return `[ ${this.co.join(' ')} )`};
    get string_rows() {return [this.str]}
    
    get msc() {return this.co[this.deg]}
    get deg() {
        for (let i = this.co.length - 1; i >= 0; i--)
            if (this.co[i] !== 0)
                return i;
    }

    get height() {return 1}
    get width() {return this.co.length}

    get string_height() {return 1}
    get string_width() {return sum(lengths(strings(this.co))) + this.co.length + 3}
    
    get is_zero() {return this.allZeros()}
    allZeros = (up_to=this.co.length) => this.co.slice(0, up_to).every(__ZER_MAP);
    copy = () => new this.constructor([...this.co]);
    equals(other) {
        const deg = new Sides(this.deg, other.deg);

        if (deg.left !== deg.right) return false;
        if (deg.max !== undefined)
            for (let i = 0; i <= deg.max; i++)
                if (this.co[i] !== other.co[i])
                    return false;

        return true;
    }
    
    iclr() {
        this.co.length = 1;
        this.co[0] = 0;
        return this;
    }

    irep = (other) => this.constructor._replace(other, this);
    replacedWith(other) {return this.constructor._replace(other)}
    static _replace(other, replaced=new this()) {
        if (Object.is(other, replaced)) return other;
        replaced.co.length = 0;

        if (other instanceof this) replaced.co.push(...other.co);
        if (Array.isArray(other)) replaced.co.push(...other);
        if (typeof other === 'number') replaced.co[0] = other;

        return replaced;
    }

    iinv = () => this.constructor._inverse(this, this);
    get inverted() {return this.constructor._inverse(this)};
    static _inverse(polynumber, inverted=new this()) {
        if (polynumber.is_zero) return inverted.iclr();

        inverted.irep(polynumber);
        for (let i of inverted.co.keys()) inverted.co[i] *= -1;
        
        return inverted;
    }

    ishf = (amount) => this.constructor._shift(this, amount, this);
    shiftedBy = (amount) => this.constructor._shift(this, amount);
    get is_shifter() {return this.allZeros(this.deg) && this.msc === 1}
    static _shift(polynumber, offset, shifted=new this()) {
        if (polynumber.is_zero) return shifted.iclr();

        shifted.irep(polynumber);

        if (offset > 0) {
            shifted.co.length += offset;
            shifted.co.copyWithin(offset);
            shifted.co.fill(0, 0, offset);
        }

        if (offset < 0) {
            shifted.co.reverse();
            shifted.co.length += offset;
            shifted.co.reverse();
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
                translated.co[0] = amount;
            else
                for (let i = 0; i <= deg; i++)
                    translated.co[i] += amount;
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
        for (let i of scaled.co.keys()) scaled.co[i] *= factor;

        return scaled;
    }

    plus = (polynumber) => this.constructor._add(this, polynumber);
    iadd = (polynumber) => this.constructor._add(this, polynumber, this);
    static _add(left, right, added=new this()) {
        switch (new Sides(left, right).is_number) {
            case SIDE.left: return this._translate(right, left, added);
            case SIDE.right: return this._translate(left, right, added);
            case SIDE.both: return added.irep(left + right);
        }
        
        const deg = new Sides(left.deg, right.deg);
        switch (deg.is_undefined) {
            case SIDE.both: return added.iclr();
            case SIDE.right: return added.irep(left);
            case SIDE.left: return added.irep(right);
        }

        added.irep(left);
        
        for (let i = 0; i <= deg.max; i++)
            switch (deg.lessThan(i)) {
                case SIDE.right: added.co[i] = right.co[i]; break;
                case SIDE.both: added.co[i] += right.co[i];
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

        summed.co.length = max(...polynumbers.map(p => p.co.length));
        summed.co.fill(0);
        
        if (numbers.length !== 0)
            summed.co[0] = sum(numbers);
        
        for (let polynumber of polynumbers)
            for (let [index, co] of polynumber.co.entries())
                summed.co[index] += co;

        return summed;
    }
    
    minus = (polynumber) => this.constructor._subtract(this, polynumber);
    isub = (polynumber) => this.constructor._subtract(this, polynumber, this);
    static _subtract(left, right, subtracted=new this()) {
        const side = new Sides(left, right);
        
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
                case SIDE.both: subtracted.co[i] -= right.co[i]; break;
                case SIDE.right: subtracted.co[i] = -right.co[i];
            }

        return subtracted;
    }

    times = (polynumber) => this.constructor._multiply(this, polynumber);
    imul = (polynumber) => this.constructor._multiply(this, polynumber, this);
    static _multiply(left, right, product=new this()) {
        const side = new Sides(left, right);
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

        const column = Object.is(left, product) ? [...left.co] : left.co;
        product.iclr();

        for (let [i, co] of column.entries())
            if (co !== 0)
                product.iadd(right.scaledBy(co).ishf(i));

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
        product.co.length = product_paths.length;
        product.co.fill(0);

        const values = [];
        const results = [];
        
        for (let [y, paths] of product_paths.entries()) {
            results.length = paths.length;

            for (let [i, path] of paths.entries()) {
                values.length = path.length;
                
                for (let [f, fy] of path.entries())
                    values[f] = factors[f].co[fy];

                results[i] = mul(values);
            }

            product.co[y] += sum(results);
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

        const deg = side.deg;
        if (deg.right === 0 && deg.left === 0)
            return quotient.irep(dividend.co[0] / divisor.co[0]);

        switch (side.is_shifter) {
            case SIDE.left: return quotient.irep(divisor).ishf(-deg.left);
            case SIDE.both: return quotient.irep(dividend).ishf(-deg.right);
            case SIDE.right: return quotient.irep(dividend).ishf(-deg.right);
        }

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

        return [quotient, remainder];
    }

    cubed = () => this.pow(3);
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
            case DEGREE.Number: return this.co[0];
            case DEGREE.Linear: return this.co[0] + this.co[1] * num;
        }

        let result = this.co[0] + this.co[1] * num;
        for (let i = 2; i <= this.deg; i++)
            result += this.co[i] * pow(num, i);

        return result;
    }

    evaluatedToZero() {
        switch (this.deg) {
            case DEGREE.Linear: return -this.co[0] / this.co[1];
            case DEGREE.Quadratic: {
                const a = this.co[2];
                const b = this.co[1];
                const c = this.co[0];

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

    // getFactors() {
    //     const result = [];
    //
    //     const degree = this.deg;
    //     if (degree === undefined)
    //         return result;
    //
    //     const factors = this.co.map(r => factorsOf(r));
    //    
    //    
    // }
    //
    //  getFactorPairs() {
    //     const result = [];
    //
    //     const degree = this.deg;
    //     if (degree === undefined)
    //         return result;
    //    
    //     const row_pair_factors = this.co.map(
    //         row_value => factorsOf(row_value).filter(
    //             found_factors => found_factors.length === 2
    //         )
    //     );
    //
    //     results.push([this, ONE]);
    //     // for ()
    //
    //     for (let left_degree = 1; left_degree < degree; left_degree++) {
    //         let right_degree = degree - left_degree;
    //
    //         let left = [];
    //         let right = [];
    //
    //         left.length = left_degree + 1;
    //         right.length = right_degree + 1;
    //        
    //        
    //     }
    // }
}

class RowPolyNumber extends PolyNumber {
    static STANDARD_FORM = FORM.alpha;
    
    get string_height() {return 3}
    get string_width() {return sum(lengths(strings(this.co))) + this.co.length - 1}
    get string_rows() {return ['┏', '┃'+strings(this.co).join(' ') , '┗']}
}

class ColumnPolyNumber extends PolyNumber {
    static STANDARD_FORM = FORM.beta;
    
    get string_height() {return this.co.length + 1}
    get string_width() {return max(...lengths(strings(this.co))) + this.co.length - 1}
    get string_rows() {
        const co_strings = strings(this.co);
        const width = max(...lengths(co_strings));
        return ['┏'+'━'.repeat(width)+'┓', ...co_strings.map(
            (s) => s.padStart(s.length + 1)
                    .padEnd(s.length + 2 + width)
        )];
    }
    get width() {return 1}
    get height() {return this.co.length}
}


const ONE = new PolyNumber([1]);
const ALPHA = new PolyNumber([0, 1]);
