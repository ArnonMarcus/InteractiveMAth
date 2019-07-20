const OPS_NOTATION = {
    '+': ' + ',
    '-': ' - ',
    'x': ' x ',
    '/': ' / ',
    '^': ' raised to the power of ',
    '<': ' replaced with ',
    '>': ' shifted by ',
    '|': ' translated by ',
    '*': ' scaled by ',
    '~': ' equals ',
    '=': ' = ',
    '!': 'inverse of ',
    '%': 'transpose of ',
    '0': 'cleared ',
    '1': 'copy of ',
    '2': '²',
    '3': '³'
};

const OPS_EXPRESSION = {
    '+': ' + ',
    '-': ' - ',
    'x': '',
    '/': ' / ',
    '^': '^',
    '<': ' <= ',
    '>': ' >> ',
    '|': ' > ',
    '*': ' * ',
    '~': ' ?= ',
    '!': '-',
    '%': '%',
    '0': '0*',
    '1': '',
    '2': '²',
    '3': '³',
    '=': ' = '
};

class OutputStream {
    lines = [];

    get height() {return this.lines.length}
    get width() {return this.lines.length === 0 ? 0 : this.lines[0].length};
    get latest_width() {return this.lines[this.lines.length - 1].length}

    print(lines) {
        if (Array.isArray(lines)) {
            if (lines.length === 0) 
                return;
        } else lines = [lines];
        
        const diff = this.lines.length - lines.length;
        if (diff > 0) lines.push(...Array(diff).fill(' '.repeat(lines[0].length)));
        if (diff < 0) this.lines.push(...Array(-diff).fill(' '.repeat(this.width)));

        for (let [l, line] of lines.entries())
            this.lines[l] += line;
    }
}

const P = (...array) => new PolyNumber(array);
const B = (...array) => new BiPolyNumber(array);


function pr(...args) {
    const numbers = [];
    const operators = [];
    
    for (const arg of args)
        if (typeof arg === 'string')
            operators.push(arg === '=' ? '~' : arg);
        else
            numbers.push(arg);
    
    const notation_stream_1 = new OutputStream();
    const notation_stream_2 = new OutputStream();
    const expressions = [];

    const first_number = numbers.shift();
    if (first_number === undefined) throw 'No numbers provided!';
    
    function printNumberExpression(number, wrap=false) {
        const expression = is_poly(number) ? number.expression : `${number}`;
        expressions.push(wrap ? `(${expression})` : expression);
    }
    
    function printExpression(number, operator='', postfix=false, wrap=false) {
        const operator_string = operator.length === 0 ? '' : OPS_EXPRESSION[operator];
        const prefix = postfix ? '' : operator_string;
        const suffix = postfix ? operator_string : '';
        
        expressions.push(prefix);
        printNumberExpression(number, wrap);
        expressions.push(suffix);
    }

    function printStringNotation(string, shift=true) {
        if (string === null) return;
        if (typeof string !== 'string') string = `${string}`;
        if (string.length === 0) return;

        const lines = shift ? [' '.repeat(string.length), string] : [string];
        notation_stream_1.print(lines);
        // notation_stream_2.print(lines);
    }
    
    function printNumberNotation(number) {
        if (is_poly(number)) {
            notation_stream_1.print(number.notation_lines);
            // notation_stream_2.print(number.ext_notation_lines);
        } else printStringNotation(number);
    }
    
    function printNotation(number, operator='', postfix=true, shift=true) {
        if (postfix) {
            printNumberNotation(number);
            if (operator.length !== 0)
                printStringNotation(OPS_NOTATION[operator], shift);
        } else {
            if (operator.length !== 0)
                printStringNotation(OPS_NOTATION[operator], shift);
            printNumberNotation(number);
        }
    }

    function printPair(number, operator='') {
        const postfix = operator === '2' || operator === '3';
        const shift_notation = !postfix;
        const wrap_expression = operator !== '=' && typeof number !== 'number';
        
        printNotation(number, operator, postfix, shift_notation);
        printExpression(number, operator, postfix, wrap_expression);
    }
    
    if (operators.length === 0) {
        if (numbers.length > 0)
            throw 'Multiple numbers provided with no operator!';

        printNumberNotation(first_number);
        printNumberExpression(first_number);
    } else {
        let result_number = first_number.copy();

        if (numbers.length === 0) {
            const operator = operators[0];
            if (operators.length > 1) throw `A single number can only be operated on by a single operator!`;
            if (!(operator in UNARY_OPS)) throw 'A single number can only be operated on by a unary operator!';

            printPair(first_number, operator);
            result_number = result_number[UNARY_OPS[operator]]();
        } else {
            if (operators.length !== numbers.length)
                throw 'Miss-match amount of numbers and operators!';

            printNumberNotation(first_number);
            printNumberExpression(first_number, true);
            
            for (const [operator, number] of zip(operators, numbers)) {
                printPair(number, operator);
                result_number = result_number[BINARY_OPS[operator]](number);
            }
        }

        printPair(result_number, '=');
    }

    printStringNotation('  =>');
    
    const out_stream = [
        ...notation_stream_1.lines,
        // ...notation_stream_2.lines,
        '',
        expressions.join('')
    ];

    console.log(`\n${out_stream.join('\n')}\n`);
    
    return expressions[expressions.length - 2];
}

