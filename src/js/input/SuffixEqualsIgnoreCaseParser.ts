import { EqualsIgnoreCaseParser } from "./EqualsIgnoreCaseParser";
import { InputCharacter } from "./InputCharacter";

/**
 * A parser to be used specifically for suffix equals-ignore-case rules.
 *
 * This extends EqualsIgnoreCaseParser to parse and reverse char bytes into InputMultiByteSet
 * to account for lower-case and upper-case variants.
 */
export class SuffixEqualsIgnoreCaseParser extends EqualsIgnoreCaseParser {

    constructor() {
        super();
    }

    parse(value: string): InputCharacter[] {
        // By using EqualsIgnoreCaseParser, we reverse chars in one pass when getting the char bytes for
        // lower-case and upper-case values.
        return this.parse(value, true);
    }
} 