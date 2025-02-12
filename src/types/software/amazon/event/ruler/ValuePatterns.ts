import { MatchType } from "./MatchType";
import { Patterns } from "./Patterns";

export class ValuePatterns extends Patterns {
    private readonly pattern: string;

    constructor(type: MatchType, pattern: string) {
        super(type);
        this.pattern = pattern;
    }

    public getPattern(): string {
        return this.pattern;
    }

    public equals(o: any): boolean {
        if (this === o) {
            return true;
        }
        if (o == null || o.constructor !== this.constructor) {
            return false;
        }
        if (!super.equals(o)) {
            return false;
        }

        const that = o as ValuePatterns;
        return this.pattern === that.pattern;
    }

    public hashCode(): number {
        let result = super.hashCode();
        result = 31 * result + (this.pattern ? this.pattern.hashCode() : 0);
        return result;
    }

    public toString(): string {
        if (this.type() === MatchType.NUMERIC_EQ) {
            return `VP:${ComparableNumber.toIntVals(this.pattern)} (${super.toString()})`;
        } else {
            return `VP:${this.pattern} (${super.toString()})`;
        }
    }
} 