import { Constants } from "./Constants";
import { MatchType } from "./MatchType";
import { Patterns } from "./Patterns";

export class Range extends Patterns {
    private static readonly MIN_RANGE_BYTES = Range.doubleToComparableBytes(-Number.MAX_VALUE);
    private static readonly MAX_RANGE_BYTES = Range.doubleToComparableBytes(Number.MAX_VALUE);
    private static readonly HEX_DIGIT_A_DECIMAL_VALUE = 10;

    readonly bottom: Uint8Array;
    readonly openBottom: boolean;
    readonly top: Uint8Array;
    readonly openTop: boolean;
    readonly isCIDR: boolean;

    constructor(bottom: Uint8Array, openBottom: boolean, top: Uint8Array, openTop: boolean, isCIDR: boolean) {
        super(MatchType.NUMERIC_RANGE);
        this.bottom = bottom;
        this.top = top;
        this.openBottom = openBottom;
        this.openTop = openTop;
        this.isCIDR = isCIDR;
    }

    private static deepCopy(range: Range): Range {
        return new Range(range.bottom.slice(), range.openBottom, range.top.slice(), range.openTop, range.isCIDR);
    }

    public static lessThan(val: string): Range {
        const byteVal = Range.stringToComparableBytes(val);
        return Range.between(Range.MIN_RANGE_BYTES, false, byteVal, true);
    }

    public static lessThanOrEqualTo(val: string): Range {
        const byteVal = Range.stringToComparableBytes(val);
        return Range.between(Range.MIN_RANGE_BYTES, false, byteVal, false);
    }

    public static greaterThan(val: string): Range {
        const byteVal = Range.stringToComparableBytes(val);
        return Range.between(byteVal, true, Range.MAX_RANGE_BYTES, false);
    }

    public static greaterThanOrEqualTo(val: string): Range {
        const byteVal = Range.stringToComparableBytes(val);
        return Range.between(byteVal, false, Range.MAX_RANGE_BYTES, false);
    }

    public static between(bottom: string, openBottom: boolean, top: string, openTop: boolean): Range {
        const byteBottom = Range.stringToComparableBytes(bottom);
        const byteTops = Range.stringToComparableBytes(top);
        Range.ensureValidRange(byteBottom, byteTops);
        return new Range(byteBottom, openBottom, byteTops, openTop, false);
    }

    private static ensureValidRange(byteBottom: Uint8Array, byteTops: Uint8Array): void {
        if (byteBottom.length !== byteTops.length) {
            throw new Error('Bottom and top must have the same length');
        }
        for (let i = 0; i < byteBottom.length; i++) {
            if (byteBottom[i] > byteTops[i]) {
                throw new Error('Bottom must be less than top');
            }
        }
    }

    public maxDigit(): number {
        return this.isCIDR ? Constants.MAX_HEX_DIGIT : Constants.MAX_NUM_DIGIT;
    }

    public minDigit(): number {
        return this.isCIDR ? Constants.MIN_HEX_DIGIT : Constants.MIN_NUM_DIGIT;
    }

    public clone(): Range {
        return Range.deepCopy(this);
    }

    public equals(o: any): boolean {
        if (this === o) {
            return true;
        }
        if (!(o instanceof Range)) {
            return false;
        }
        return this.openBottom === o.openBottom &&
               this.openTop === o.openTop &&
               this.bottom.every((val, index) => val === o.bottom[index]) &&
               this.top.every((val, index) => val === o.top[index]);
    }

    public hashCode(): number {
        let result = super.hashCode();
        result = 31 * result + this.bottom.reduce((acc, val) => acc + val, 0);
        result = 31 * result + Number(this.openBottom);
        result = 31 * result + this.top.reduce((acc, val) => acc + val, 0);
        result = 31 * result + Number(this.openTop);
        return result;
    }

    public toString(): string {
        if (this.isCIDR) {
            return `${new TextDecoder().decode(this.bottom)}/${new TextDecoder().decode(this.top)}:${this.openBottom}/${this.openTop}:${this.isCIDR} (${super.toString()})`;
        } else {
            return `${ComparableNumber.toIntVals(new TextDecoder().decode(this.bottom))}/${ComparableNumber.toIntVals(new TextDecoder().decode(this.top))}:${this.openBottom}/${this.openTop}:${this.isCIDR} (${super.toString()})`;
        }
    }

    private static doubleToComparableBytes(d: number): Uint8Array {
        return Range.stringToComparableBytes(d.toString());
    }

    private static stringToComparableBytes(string: string): Uint8Array {
        return new TextEncoder().encode(ComparableNumber.generate(string));
    }
} 