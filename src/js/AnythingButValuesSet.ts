import { MatchType } from "./MatchType";
import { Patterns } from "./Patterns";

export class AnythingButValuesSet extends Patterns {
    private readonly values: Set<string>;

    constructor(matchType: MatchType, values: Set<string>) {
        super(matchType);
        this.values = new Set(values);
    }

    getValues(): Set<string> {
        return this.values;
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

        const that = o as AnythingButValuesSet;
        return this.values.size === that.values.size && [...this.values].every(value => that.values.has(value));
    }

    hashCode(): number {
        let result = super.hashCode();
        result = 31 * result + Array.from(this.values).reduce((acc, val) => acc + val.hashCode(), 0);
        return result;
    }

    toString(): string {
        return `ABVS:${Array.from(this.values).toString()}, (${super.toString()})`;
    }
} 