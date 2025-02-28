import { InputByte } from "./InputByte";
import { InputCharacter } from "./InputCharacter";
import { StringValueParser } from "./StringValueParser";

/**
 * A parser to be used specifically for suffix rules.
 *
 * This undoes the `reverse()` from `Patterns` intentionally
 * to ensure we can correctly reverse utf-8 characters with 2+ bytes like '大' and '雨'.
 */
export class SuffixParser implements StringValueParser {

    constructor() {}

    parse(value: string): InputCharacter[] {
        const utf8bytes = new TextEncoder().encode([...value].reverse().join(''));
        const result: InputCharacter[] = new Array(utf8bytes.length);
        for (let i = 0; i < utf8bytes.length; i++) {
            const utf8byte = utf8bytes[utf8bytes.length - i - 1];
            result[i] = new InputByte(utf8byte);
        }
        return result;
    }
} 