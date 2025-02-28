/**
 * A grouping of multiple bytes. This can be used to represent a character that has a UTF-8 representation requiring
 * multiple bytes.
 */
export class MultiByte {

    public static readonly MIN_FIRST_BYTE_FOR_ONE_BYTE_CHAR = 0x00;
    public static readonly MAX_FIRST_BYTE_FOR_ONE_BYTE_CHAR = 0x7F;
    public static readonly MIN_FIRST_BYTE_FOR_TWO_BYTE_CHAR = 0xC2;
    public static readonly MAX_FIRST_BYTE_FOR_TWO_BYTE_CHAR = 0xDF;

    /**
     * A continuation byte is a byte that is not the first UTF-8 byte in a multibyte character.
     */
    public static readonly MIN_CONTINUATION_BYTE = 0x80;
    public static readonly MAX_CONTINUATION_BYTE = 0xBF;
    public static readonly MAX_NON_FIRST_BYTE = 0xBF;

    private readonly bytes: number[];

    constructor(...bytes: number[]) {
        if (bytes.length === 0) {
            throw new Error("Must provide at least one byte");
        }
        this.bytes = bytes;
    }

    getBytes(): number[] {
        return [...this.bytes];
    }

    singular(): number {
        if (this.bytes.length !== 1) {
            throw new Error("Must be a singular byte");
        }
        return this.bytes[0];
    }

    is(...bytes: number[]): boolean {
        return this.bytes.length === bytes.length && this.bytes.every((b, i) => b === bytes[i]);
    }

    isNumeric(): boolean {
        return this.bytes.every(b => b >= MultiByte.MIN_CONTINUATION_BYTE && b <= MultiByte.MAX_CONTINUATION_BYTE);
    }

    isLessThan(other: MultiByte): boolean {
        return this.compare(other) < 0;
    }

    isLessThanOrEqualTo(other: MultiByte): boolean {
        return this.compare(other) <= 0;
    }

    isGreaterThan(other: MultiByte): boolean {
        return this.compare(other) > 0;
    }

    isGreaterThanOrEqualTo(other: MultiByte): boolean {
        return this.compare(other) >= 0;
    }

    private compare(other: MultiByte): number {
        for (let i = 0; i < Math.min(this.bytes.length, other.bytes.length); i++) {
            if (this.bytes[i] !== other.bytes[i]) {
                return this.bytes[i] - other.bytes[i];
            }
        }
        return this.bytes.length - other.bytes.length;
    }

    equals(o: any): boolean {
        return o instanceof MultiByte && this.is(...o.getBytes());
    }

    hashCode(): number {
        return this.bytes.reduce((acc, b) => acc * 31 + b, 0);
    }

    toString(): string {
        return this.bytes.toString();
    }
} 