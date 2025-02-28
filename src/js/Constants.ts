/**
 * Defines various constants used throughout the Ruler application.
 */
export class Constants {

    private constructor() {
        throw new Error("You can't create an instance of a utility class.");
    }

    static readonly EXACT_MATCH = "exactly";
    static readonly EQUALS_IGNORE_CASE = "equals-ignore-case";
    static readonly PREFIX_MATCH = "prefix";
    static readonly SUFFIX_MATCH = "suffix";
    static readonly ANYTHING_BUT_MATCH = "anything-but";
    static readonly EXISTS_MATCH = "exists";
    static readonly WILDCARD = "wildcard";
    static readonly NUMERIC = "numeric";
    static readonly CIDR = "cidr";

    // This is Ruler reserved words to represent the $or relationship among the fields.
    static readonly OR_RELATIONSHIP_KEYWORD = "$or";

    static readonly EQ = "=";
    static readonly LT = "<";
    static readonly LE = "<=";
    static readonly GT = ">";
    static readonly GE = ">=";

    static readonly IPv4_REGEX = /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/;
    static readonly IPv6_REGEX = /[0-9a-fA-F:]*:[0-9a-fA-F:]*/;
    static readonly HEX_DIGITS = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E', 'F'
    ];
    static readonly MAX_HEX_DIGIT = Constants.HEX_DIGITS[Constants.HEX_DIGITS.length - 1]; // F
    static readonly MIN_HEX_DIGIT = Constants.HEX_DIGITS[0]; // 0

    static readonly BASE128_DIGITS = Array.from({ length: 128 }, (_, i) => i);

    static readonly MAX_NUM_DIGIT = Constants.BASE128_DIGITS[Constants.BASE128_DIGITS.length - 1];
    static readonly MIN_NUM_DIGIT = Constants.BASE128_DIGITS[0];

    static readonly RESERVED_FIELD_NAMES_IN_OR_RELATIONSHIP = [
        // Add reserved field names here
    ];
} 