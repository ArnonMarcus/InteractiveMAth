class ExpressionTerm extends Term {
    get form() {return this.i === 0 ? '' : this.p.form}
    get suffix() {return this.i < 2 ? '' : super.suffix};
    get coefficient() {
        if (this.i === 0) return this.v;
        const v = abs(this.v);
        return v === 1 ? '' : v;
    }
}

class Expression extends Notation {
    static D = ' ';
    static T = new ExpressionTerm();

    get terms() {
        const terms = [];
        
        for (const [operator, term] of this.operators_and_terms) {
            if (term.length > 0) {
                if (terms.length === 0) {
                    if (operator === ' - ')
                        terms.push('-');
                } else
                    terms.push(...operator);
                terms.push(...term);
            }
        }

        return terms;
    }

    get operators_and_terms() {
        if (this.p.is_zero)
            return [['', `0${this.p.form}°`]];

        const terms = Array(this.p.array.length).fill('');
        const operators = Array(this.p.array.length).fill(' + ');

        for (let [i, v] of this.p.array.entries()) {
            if (v !== 0) {
                if (v < 0) operators[i] = ' - ';
                terms[i] = this.constructor.T.of(this.p, i, v).toString();
            }
        }

        return zip(operators, terms);
    }
}



class Expression2D extends Expression {

}

//
// function getBinomialTerms(array, columns_variable, rows_variable) {
//     if (array.length === 0 || all_zeros(array))
//         return [[`0${columns_variable}°${rows_variable}°`]];
//
//    
//    
//     if (array.length !== 0 && array[0].length !== 0) {
//         string_array[0] = getPolynomialTerms(array[0].coeff, columns_variable)
//     }
//    
//    
//    
//     if (this.is_zero)
//         return `0${FORM[0]}°${FORM[1]}°`;
//
//     const row_degrees = this.getRowDegrees();
//     const column_degrees = this.getColumnDegrees();
//     const degree = {row: null, column: null};
//     const suffix = {row: null, column: null};
//     const is_first = {row: null, column: null};
//     const string_parts = [];
//
//     let prefix;
//     let coefficient;
//     let is_first_non_zero;
//
//     for (const [i, p] of this.array.entries()) {
//         degree.column = column_degrees[i];
//
//         for (const [row_index, v] of p.coeff.entries()) {
//             degree.row = row_degrees[row_index];
//
//             if (v === 0 || (
//                 row_index > degree.row &&
//                 i > degree.column
//             ))
//                 continue;
//
//             is_first.row = row_index === 0;
//             is_first.column = i === 0;
//             if (is_first.row && is_first.column) {
//                 string_parts.push(v);
//                 continue;
//             }
//
//             is_first_non_zero = string_parts.length === 0;
//
//             suffix.row = PolyNumber._formatSuffix(i);
//             suffix.column = PolyNumber._formatSuffix(row_index);
//
//             prefix = PolyNumber._formatPrefix(v, is_first_non_zero);
//             coefficient = PolyNumber._formatValue(v, is_first_non_zero);
//
//             string_parts.push([
//                 prefix,
//                 coefficient,
//                 is_first.row ? '' : FORM.BETA,
//                 suffix.row,
//                 is_first.column ? '' : FORM.BETA,
//                 suffix.column
//             ].join(''));
//         }
//     }
//
//     return string_parts.join('');
// }
//
// get notation() {return this.notation_lines.join('\n')};
// get notation_lines() {
//     if (this.is_zero)
//         return ['┏━┓', '┃0', '┗'];
//
//     const string_grid = grid2D(array.length, longest(array));
//     const width = this.width;
//     const height = this.height;
//     const co_widths = Array(height);
//     const co_strings = Array(height);
//     const column_widths = Array(width);
//     const column_strings = Array(width);
//     const rows = grid2D(height, width, 0);
//
//     for (const [c, p] of this.array.entries()) {
//         co_widths.fill(1);
//         co_strings.fill('0');
//
//         for (const [i, co] of p.coeff.entries()) {
//             co_strings[i] = `${co}`;
//             co_widths[i] = co_strings[i].length;
//         }
//
//         column_widths[c] = max(...co_widths);
//         column_strings[c] = [...co_strings];
//     }
//
//     for (const [column_index, column] of column_strings.entries()) {
//         for (let [row_index, string] of column.entries()) {
//             for (let l = string.length; l < column_widths[column_index]; l++)
//                 string += ' ';
//
//             rows[row_index][column_index] = string;
//         }
//     }
//
//     const header_length = sum(column_widths) + width - 1;
//     return [
//         '┏'+'━'.repeat(header_length)+'┓',
//         ...rows.map((row) => `┃${row.join(' ')} `),
//         '┗'+' '.repeat(header_length + 1)
//     ]
// }
//
// get height() {return max(...this.column_heights)}
// get width() {return this.array.length}
//
// get column_degrees() {return this.array.map(p => p.deg)}
// get column_heights() {return this.array.map(p => p.height)}
// get column_widths() {return this.array.map(p => p.width)}
//
// get row_degrees() {return this.rows.map(p => p.deg)}
// get row_heights() {return this.rows.map(p => p.height)}
// get row_widths() {return this.rows.map(p => p.width)}
//
// get notation_height() {return this.height + 2}
// get notation_width() {return sum(this.notation_column_widths) - this.width + 2}
//
// get notation_column_heights() {return this.array.map(p => p.notation_height)}
// get notation_column_widths() {return this.array.map(p => p.notation_width)}
// get notation_row_heights() {return this.rows.map(p => p.notation_height)}
// get notation_row_widths() {return this.rows.map(p => p.notation_width)}

