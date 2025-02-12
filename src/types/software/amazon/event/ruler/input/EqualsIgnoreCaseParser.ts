import { InputByte } from "./InputByte";
import { InputCharacter } from "./InputCharacter";
import { InputMultiByteSet } from "./InputMultiByteSet";
import { MultiByte } from "./MultiByte";

/**
 * A parser to be used specifically for equals-ignore-case rules. For Java characters where lower and upper case UTF-8
 * representations do not differ, we will parse into InputBytes. Otherwise, we will use InputMultiByteSet.
 *
 * Note that there are actually characters whose upper-case/lower-case UTF-8 representations differ in number of bytes.
 * One example where length differs by 1: ⱥ, Ⱥ
 * One example where length differs by 4: ΰ, Ϋ́
 * InputMultiByteSet handles differing byte lengths per Java character.
 */
export class EqualsIgnoreCaseParser {

    constructor() {}

    parse(value: string): InputCharacter[] {
        return this.parseWithReverse(value, false);
    }

    protected parseWithReverse(value: string, reverseCharBytes: boolean): InputCharacter[] {
        const result: InputCharacter[] = [];
        for (const c of value) {
            const lowerCaseUtf8bytes = this.getCharUtfBytes(c, (ch) => ch.toLowerCase(), reverseCharBytes);
            const upperCaseUtf8bytes = this.getCharUtfBytes(c, (ch) => ch.toUpperCase(), reverseCharBytes);
            if (lowerCaseUtf8bytes.every((byte, index) => byte === upperCaseUtf8bytes[index])) {
                for (const byte of lowerCaseUtf8bytes) {
                    result.push(new InputByte(byte));
                }
            } else {
                const multiBytes = new Set<MultiByte>();
                multiBytes.add(new MultiByte(...lowerCaseUtf8bytes));
                multiBytes.add(new MultiByte(...upperCaseUtf8bytes));
                result.push(new InputMultiByteSet(multiBytes));
            }
        }
        return result;
    }

    private getCharUtfBytes(c: string, stringTransformer: (s: string) => string, reverseCharBytes: boolean): number[] {
        const byteArray = new TextEncoder().encode(stringTransformer(c));
        return reverseCharBytes ? byteArray.reverse() : byteArray;
    }
} 