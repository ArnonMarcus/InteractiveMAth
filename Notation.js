class Term {
    p; i; v;
    of(p, i, v) {this.i = i; this.v = v; this.p = p; return this}
    toString = () => `${this.coefficient}${this.form}${this.suffix}`;
    get suffix() {return this.i in SUFFIXES ? SUFFIXES[this.i] : this.i}
    get form() {return this.p.form};
    get coefficient() {return this.v};
}

class Notation {
    p;
    of(p) {this.p = p; return this;}
    
    static D = '\n';
    toString = () => this.lines.join(this.constructor.D);
    
    get lines() {return [this.terms.join('')]}
    get terms() {return this.p.array.strings()}

    static T = new Term();
    get extended_terms() {
        return this.p.array.map((v, i) => 
            this.constructor.T.of(this.p, i, v).toString()
        )
    }
}

class RowNotation extends Notation {
    get height() {return 3}
    get width() {return 2 + this.terms.length + this.p.array.length}
    get lines() {
        const body = this.terms.join(' ');
        const filler = ' '.repeat(body.length + 2);
        return [
            `┏${filler}`,
            `┃${body} )`,
            `┗${filler}`
        ];
    }

}

class ColumnNotation extends Notation {
    get height() {return this.p.array.length + 1}
    get width() {return this.terms.max_len() + 2}

    get lines() {
        const terms = this.terms;
        const max_length = terms.max_len();
        return [
            `┏${'━'.repeat(max_length)}┓`,
            ...terms.map((s) => s
                    .padEnd(s.length + 1)
                    .padStart( max_length + 2))
        ];
    }
}

class ColumnExtended extends ColumnNotation {
    get terms() {return this.extended_terms}
}

class RowExtended extends RowNotation {
    get terms() {return this.extended_terms}
}


