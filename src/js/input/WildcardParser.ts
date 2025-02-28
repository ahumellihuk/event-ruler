import { InputByte } from "./InputByte";
import { InputCharacter } from "./InputCharacter";
import { InputWildcard } from "./InputWildcard";
import { ParseException } from "./ParseException";
import { StringValueParser } from "./StringValueParser";

const ASTERISK_BYTE = 42; // ASCII code for '*'
const BACKSLASH_BYTE = 92; // ASCII code for '\'

/**
 * A parser to be used specifically for wildcard rules.
 */
export class WildcardParser implements StringValueParser {

    constructor() {}

    parse(value: string): InputCharacter[] {
        const utf8Bytes = new TextEncoder().encode(value);
        const result: InputCharacter[] = [];
        for (let i = 0; i < utf8Bytes.length; i++) {
            const utf8byte = utf8Bytes[i];
            if (utf8byte === ASTERISK_BYTE) {
                if (i + 1 < utf8Bytes.length && utf8Bytes[i + 1] === ASTERISK_BYTE) {
                    throw new ParseException(`Consecutive wildcard characters at pos ${i}`);
                }
                result.push(new InputWildcard());
            } else if (utf8byte === BACKSLASH_BYTE) {
                if (i + 1 < utf8Bytes.length) {
                    const nextUtf8byte = utf8Bytes[i + 1];
                    if (nextUtf8byte === ASTERISK_BYTE || nextUtf8byte === BACKSLASH_BYTE) {
                        result.push(new InputByte(nextUtf8byte));
                        i++;
                        continue;
                    }
                }
                throw new ParseException(`Invalid escape character at pos ${i}`);
            } else {
                result.push(new InputByte(utf8byte));
            }
        }
        return result;
    }
} 