import { ByteParser } from "./ByteParser";
import { EqualsIgnoreCaseParser } from "./EqualsIgnoreCaseParser";
import { MatchTypeParser } from "./MatchTypeParser";
import { SuffixEqualsIgnoreCaseParser } from "./SuffixEqualsIgnoreCaseParser";
import { SuffixParser } from "./SuffixParser";
import { WildcardParser } from "./WildcardParser";
import { MatchType } from "../MatchType";
import { InputCharacter } from "./InputCharacter";
import { InputByte } from "./InputByte";

/**
 * Parses the value for a rule into InputCharacters that are used to add the rule to the Machine. Most characters from a
 * rule's value will be treated by their byte representation, but certain characters, such as for wildcards or regexes,
 * need to be represented differently so the Machine understands their special meaning.
 */
export class DefaultParser implements MatchTypeParser, ByteParser {

    static readonly DOLLAR_SIGN_BYTE = 0x24;
    static readonly LEFT_PARENTHESIS_BYTE = 0x28;
    static readonly RIGHT_PARENTHESIS_BYTE = 0x29;
    static readonly ASTERISK_BYTE = 0x2A;
    static readonly PLUS_SIGN_BYTE = 0x2B;
    static readonly COMMA_BYTE = 0x2C;
    static readonly HYPHEN_BYTE = 0x2D;
    static readonly PERIOD_BYTE = 0x2E;
    static readonly ZERO_BYTE = 0x30;
    static readonly NINE_BYTE = 0x39;
    static readonly QUESTION_MARK_BYTE = 0x3F;
    static readonly LEFT_SQUARE_BRACKET_BYTE = 0x5B;
    static readonly BACKSLASH_BYTE = 0x5C;
    static readonly RIGHT_SQUARE_BRACKET_BYTE = 0x5D;
    static readonly CARET_BYTE = 0x5E;
    static readonly LEFT_CURLY_BRACKET_BYTE = 0x7B;
    static readonly VERTICAL_LINE_BYTE = 0x7C;
    static readonly RIGHT_CURLY_BRACKET_BYTE = 0x7D;
    private static readonly SINGLETON = new DefaultParser();
    private readonly wildcardParser: WildcardParser;
    private readonly equalsIgnoreCaseParser: EqualsIgnoreCaseParser;
    private readonly suffixParser: SuffixParser;
    private readonly suffixEqualsIgnoreCaseParser: SuffixEqualsIgnoreCaseParser;

    private constructor(wildcardParser?: WildcardParser, equalsIgnoreCaseParser?: EqualsIgnoreCaseParser,
                      suffixParser?: SuffixParser, suffixEqualsIgnoreCaseParser?: SuffixEqualsIgnoreCaseParser) {
        this.wildcardParser = wildcardParser || new WildcardParser();
        this.equalsIgnoreCaseParser = equalsIgnoreCaseParser || new EqualsIgnoreCaseParser();
        this.suffixParser = suffixParser || new SuffixParser();
        this.suffixEqualsIgnoreCaseParser = suffixEqualsIgnoreCaseParser || new SuffixEqualsIgnoreCaseParser();
    }

    static getParser(): DefaultParser {
        return DefaultParser.SINGLETON;
    }

    static getNonSingletonParserForTesting(wildcardParser: WildcardParser, equalsIgnoreCaseParser: EqualsIgnoreCaseParser,
                                         suffixParser: SuffixParser, suffixEqualsIgnoreCaseParser: SuffixEqualsIgnoreCaseParser): DefaultParser {
        return new DefaultParser(wildcardParser, equalsIgnoreCaseParser, suffixParser, suffixEqualsIgnoreCaseParser);
    }

    parse(type: MatchType, value: string): InputCharacter[];
    parse(utf8byte: number): InputCharacter;
    parse(typeOrByte: MatchType | number, value?: string): InputCharacter | InputCharacter[] {
        if (typeof typeOrByte === 'number') {
            return new InputByte(typeOrByte);
        }

        const type = typeOrByte;
        if (!value) {
            throw new Error('Value is required when parsing with MatchType');
        }

        if (type === MatchType.WILDCARD || type === MatchType.ANYTHING_BUT_WILDCARD) {
            return this.wildcardParser.parse(value);
        } else if (type === MatchType.EQUALS_IGNORE_CASE || type === MatchType.ANYTHING_BUT_IGNORE_CASE || type === MatchType.PREFIX_EQUALS_IGNORE_CASE) {
            return this.equalsIgnoreCaseParser.parse(value);
        } else if (type === MatchType.SUFFIX || type === MatchType.ANYTHING_BUT_SUFFIX) {
            return this.suffixParser.parse(value);
        } else if (type === MatchType.SUFFIX_EQUALS_IGNORE_CASE) {
            return this.suffixEqualsIgnoreCaseParser.parse(value);
        }

        const encoder = new TextEncoder();
        const utf8bytes = encoder.encode(value);
        const result: InputCharacter[] = new Array(utf8bytes.length);
        for (let i = 0; i < utf8bytes.length; i++) {
            result[i] = new InputByte(utf8bytes[i]);
        }
        return result;
    }
} 