class PolyNumber {
    form;
    array;
    orientation;
    
    static FORMS = ['x', 'y'];
    static EXPRESSION = new Expression();
    static NOTATION = [new ColumnNotation(), new RowNotation()];
    static EXTENDED = [new ColumnExtended(), new RowExtended()];

    constructor(array=[], orientation=ORIENTATION.COLUMN) {
        this.orientation = orientation;
        this.array = array instanceof this.constructor ? array.array : array;
        if (this.array.length === 0) this.array.push(this.constructor.zero());

        this.form = this.constructor.FORMS[orientation];
    }
    toString() {return this.expression.toString()};

    get expression() {return this.constructor.EXPRESSION.of(this)}
    get extended() {return this.constructor.EXTENDED[this.orientation].of(this)}
    get notation() {return this.constructor.NOTATION[this.orientation].of(this)}
    
    get is_row() {return this.orientation === ORIENTATION.ROW}
    get is_column() {return this.orientation === ORIENTATION.COLUMN}
    
    get height() {return this.is_row ? 1 : this.array.length}
    get width() {return this.is_column ? 1 : this.array.length}
    
    get msc() {return this.array[this.deg]}
    get deg() {
        for (let i = this.array.length - 1; i >= 0; i--)
            if (this.array[i] !== 0)
                return i;
    }

    static zero() {return 0}
    get is_zero() {return this.array.is_zero()}
    zeros = (up_to=this.array.length) => this.array.is_zero(up_to);
    
    copy = () => new this.constructor([...this.array]);
    equals(other) {
        const deg = new Sides(this.deg, other.deg);

        if (deg.left !== deg.right) return false;
        if (deg.max !== undefined)
            for (let i = 0; i <= deg.max; i++)
                if (this.array[i] !== other.array[i])
                    return false;

        return true;
    }
    
    iclr() {this.array.zero(); return this}
    irep = (other) => this.constructor._replace(other, this);
    replacedWith(other) {return this.constructor._replace(other)}
    static _replace(other, replaced=new this()) {
        if (Object.is(other, replaced)) return other;
        replaced.array.clear();

        if (other instanceof this) replaced.array.push(...other.array);
        if (Array.isArray(other)) replaced.array.push(...other);
        if (typeof other === 'number') replaced.array.push(other);

        return replaced;
    }

    iinv = () => this.constructor._inverse(this, this);
    get inverted() {return this.constructor._inverse(this)};
    static _inverse(polynumber, inverted=new this()) {
        if (polynumber.is_zero) return inverted.iclr();

        inverted.irep(polynumber);
        for (const i of inverted.array.keys()) inverted.array[i] *= -1;
        
        return inverted;
    }

    ishf = (amount) => this.constructor._shift(this, amount, this);
    shiftedBy = (amount) => this.constructor._shift(this, amount);
    get is_shifter() {return this.zeros(this.deg) && this.msc === 1}
    static _shift(polynumber, offset, shifted=new this()) {
        if (polynumber.is_zero) return shifted.iclr();

        shifted.irep(polynumber);

        if (offset > 0) {
            shifted.array.length += offset;
            shifted.array.copyWithin(offset);
            shifted.array.fill(0, 0, offset);
        }

        if (offset < 0) {
            shifted.array.reverse();
            shifted.array.length += offset;
            shifted.array.reverse();
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
                translated.array[0] = amount;
            else
                for (let i = 0; i <= deg; i++)
                    translated.array[i] += amount;
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
        for (const i of scaled.array.keys()) scaled.array[i] *= factor;

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
                case SIDE.right: added.array[i] = right.array[i]; break;
                case SIDE.both: added.array[i] += right.array[i];
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
            if (polynumbers.length === 0) return summed.irep(numbers.sum());
            if (polynumbers.length === 1) return summed.irep(polynumbers[0]).iadd(numbers.sum());
        }

        summed.array.zeros(polynumbers.max_hgt());        
        if (numbers.length !== 0)
            summed.array[0] = numbers.sum();
        
        for (const polynumber of polynumbers)
            for (const [i, v] of polynumber.array.entries())
                summed.array[i] += v;

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
                case SIDE.both: subtracted.array[i] -= right.array[i]; break;
                case SIDE.right: subtracted.array[i] = -right.array[i];
            }

        return subtracted;
    }

    times = (polynumber) => this.constructor._multiply(this, polynumber);
    imul = (polynumber) => this.constructor._multiply(this, polynumber, this);
    static _multiply(left, right, product=new this()) {
        const side = new Sides(left, right);

        if (side.row_column) return new BiPolyNumber(left.array.map((c) => right.scaledBy(c)));
        if (side.column_row) return new BiPolyNumber(right.array.map((c) => left.scaledBy(c)));

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

        let array = left.array;
        if (Object.is(product, left)) array = [...array];
        if (Object.is(product, right)) right = right.copy();
        
        product.iclr();

        for (const [i, v] of array.entries())
            if (v !== 0)
                product.iadd(right.scaledBy(v).ishf(i));

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
            if (factors.length === 0) return product.irep(numbers.prd());
            if (factors.length === 1) return product.irep(factors[0]).iscl(numbers.prd());
        }
        
        const degrees = factors.degrees();
        if (degrees.includes(undefined))
            return product.iclr();

        const product_paths = this._getProductPaths(degrees);
        product.array.zeros(product_paths.length);

        const values = [];
        const results = [];
        
        for (const [y, paths] of product_paths.entries()) {
            results.length = paths.length;

            for (const [i, path] of paths.entries()) {
                values.length = path.length;
                
                for (const [f, fy] of path.entries())
                    values[f] = factors[f].array[fy];

                results[i] = values.prd();
            }

            product.array[y] += results.sum();
        }

        return numbers.length === 0 ? product : product.iscl(numbers.prd());
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
            return quotient.irep(dividend.array[0] / divisor.array[0]);

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
            case DEGREE.Number: return this.array[0];
            case DEGREE.Linear: return this.array[0] + this.array[1] * num;
        }

        let result = this.array[0] + this.array[1] * num;
        for (let i = 2; i <= this.deg; i++)
            result += this.array[i] * pow(num, i);

        return result;
    }

    evaluatedToZero() {
        switch (this.deg) {
            case DEGREE.Linear: return -this.array[0] / this.array[1];
            case DEGREE.Quadratic: {
                const a = this.array[2];
                const b = this.array[1];
                const c = this.array[0];

                const two_a = 2 * a;
                const sqrt_of__b_squared_minus_4ac = Math.sqrt(sqr(b) - 4*a*c);

                return [
                    (-b + sqrt_of__b_squared_minus_4ac) / two_a,
                    (-b - sqrt_of__b_squared_minus_4ac) / two_a
                ];
            }
        }
    }
    
    static _getProductPaths(factor_degrees) {
        const deg = factor_degrees.sum();
        const last = factor_degrees.length - 1;
        const path = Array(factor_degrees.length);
        const paths = grid2D(deg + 1, 0);

        function findProductPath(f) {
            const f_deg = factor_degrees[f];
            let y;
            
            for (let fy = 0; fy <= f_deg; fy++) {
                path[f] = fy;

                if (f === last) {
                    y = path.sum();
                    if (y <= deg)
                        paths[y].push([...path]);
                } else
                    findProductPath(f + 1);
            }
        }
        findProductPath(0);

        return paths;
    }
}

const C = (...array) => new PolyNumber(array, ORIENTATION.COLUMN, FORM);
const R = (...array) => new PolyNumber(array, ORIENTATION.ROW, FORM);

const Px = (...array) => C(...array);
const Py = (...array) => R(...array);

const ALPHA = C([0, 1]);
const BETA = R([0, 1]);
const ONE = new PolyNumber([1]);

ALPHA.form = FORM[0];
BETA.form = FORM[1];

