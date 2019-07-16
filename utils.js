
function _print(p, string_arrays) {
    const string_array = typeof p === 'number' ? `${p}` : p._toStringArray();
    const height = string_array.length;
    const width = string_array[0].length;

    if (height < string_arrays.length) {
        string_array.length = string_arrays.length;
        const spacer = Array(width).fill(' ').join('');
        for (let h = height; h < string_arrays.length; h++)
            string_array[h] = spacer;
    }

    for (let [s, string] of string_array.entries())
        string_arrays[s] += string;
}

function _printOp(op, string_arrays) {
    _printOpStrings(_makeOpStrings(op, string_arrays.length), string_arrays)
}
function _printOpStrings(op_strings, string_arrays) {
    for (let [o, op_string] of op_strings.entries())
        string_arrays[o] += op_string;
}
function _makeOpStrings(op, total_height) {
    const op_strings = Array(total_height);

    for (let o of op_strings.keys())
        op_strings[o] = Array(3).fill(' ').join('');

    op_strings[total_height === 1 ? 0 : 1] = ` ${op} `;

    return op_strings
}

const P = (...array) => new PolyNumber(array);
const B = (...array) => new BiPolyNumber(array);


function pr(...args) {
    const string_arrays = [];
    const ops = [];
    const array = [];
    const standard_form_array = [];
    let standard_form;
    
    for (let item of args) {
        if (item in BINARY_OPS || item in UNARY_OPS)
            ops.push(item);
        else array.push(item);
    }

    const first = array.shift();
    if (array.length === 0) {
        standard_form = first.toStandardForm();

        string_arrays.length = typeof first === 'number' ? 1 : first.string_height;
        string_arrays.fill('');
        
        const op = ops[0];
        if (op in UNARY_OPS) {
            const result = first.copy()[UNARY_OPS[op]]();
            
            _printOp(op, string_arrays);
            _print(first, string_arrays);
            _printOp('=', string_arrays);
            _print(result, string_arrays);

            standard_form_array.push(`${op === '!' ? '-' : op}(${standard_form}) = ${result}`);
        } else {
            _print(first, string_arrays);
            standard_form_array.push(standard_form);
        }
    } else {
        const result = first.copy();
        for (let [op, item] of zip(ops, array))
            result[BINARY_OPS[op]](item);
        
        array.unshift(first);
        array.push(result);
        const array_heights = array.map((p) => typeof p === 'number' ? 1 : p.string_height);
        string_arrays.length = max(...array_heights);
        string_arrays.fill('');
        array.pop();
        ops.push('=');
        
        for (let [item, op] of zip(array, ops)) {
            standard_form = typeof item === 'number' ? `${item}` : item.toStandardForm();
            standard_form_array.push(`(${standard_form})${op === 'x' ? '' : ` ${op} `}`);
            _print(item, string_arrays);
            _printOp(op, string_arrays);
        }

        standard_form_array.push(result.toStandardForm());
        _print(result, string_arrays);
        
        standard_form = standard_form_array.join('');
        const separator = Array(standard_form.length).fill('_').join('');
        string_arrays.push(`${separator}\n\n${standard_form}\n`);
    }
    
    console.log(`\n${string_arrays.join('\n')}\n`);
}

