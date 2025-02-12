import { MatchType } from "./MatchType";
import { Patterns } from "./Patterns";


export class AnythingBut extends Patterns {
    private readonly values: Set<string>;
    private readonly numeric: boolean;

    constructor(values: Set<string>, numeric: boolean) {
        super(MatchType.ANYTHING_BUT);
        this.values = new Set(values);
        this.numeric = numeric;
    }

    static anythingButMatch(values: Set<string>, isNumber: boolean): AnythingBut {
        return new AnythingBut(values, isNumber);
    }

    getValues(): Set<string> {
        return this.values;
    }

    isNumeric(): boolean {
        return this.numeric;
    }

    equals(o: any): boolean {
        if (this === o) {
            return true;
        }
        if (o == null || o.constructor !== this.constructor) {
            return false;
        }
        if (!super.equals(o)) {
            return false;
        }

        const that = o as AnythingBut;
        return this.isNumeric === that.isNumeric && this.values.size === that.values.size && [...this.values].every(value => that.values.has(value));
    }

    hashCode(): number {
        let result = super.hashCode();
        result = 31 * result + Array.from(this.values).reduce((acc, val) => acc + val.hashCode(), 0);
        result = 31 * result + (this.numeric ? 1 : 0);
        return result;
    }

    toString(): string {
        return `AB:${Array.from(this.values).toString()}, isNum=${this.isNumeric} (${super.toString()})`;
    }
} 