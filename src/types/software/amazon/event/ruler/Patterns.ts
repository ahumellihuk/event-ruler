import { AnythingBut } from "./AnythingBut";
import { AnythingButValuesSet } from "./AnythingButValuesSet";
import { MatchType } from "./MatchType";
import { ValuePatterns } from "./ValuePatterns";

export class Patterns {
    public static readonly EXISTS_BYTE_STRING = "N";

    constructor(public readonly type: MatchType) {
        this.type = type;
    }

    static exactMatch(value: string): ValuePatterns {
        return new ValuePatterns(MatchType.EXACT, value);
    }

    static prefixMatch(prefix: string): ValuePatterns {
        return new ValuePatterns(MatchType.PREFIX, prefix);
    }

    static prefixEqualsIgnoreCaseMatch(prefix: string): ValuePatterns {
        return new ValuePatterns(MatchType.PREFIX_EQUALS_IGNORE_CASE, prefix);
    }

    static suffixMatch(suffix: string): ValuePatterns {
        return new ValuePatterns(MatchType.SUFFIX, suffix.split('').reverse().join(''));
    }

    static suffixEqualsIgnoreCaseMatch(suffix: string): ValuePatterns {
        return new ValuePatterns(MatchType.SUFFIX_EQUALS_IGNORE_CASE, suffix.split('').reverse().join(''));
    }

    static anythingButMatch(anythingBut: string): AnythingBut {
        return new AnythingBut(new Set([anythingBut]), false);
    }

    static anythingButNumberMatch(anythingBut: string): AnythingBut {
        return new AnythingBut(new Set([ComparableNumber.generate(anythingBut)]), true);
    }

    static anythingButMatchSet(anythingButs: Set<string>): AnythingBut {
        return new AnythingBut(anythingButs, false);
    }

    static anythingButIgnoreCaseMatch(anythingBut: string): AnythingButValuesSet {
        return new AnythingButValuesSet(MatchType.ANYTHING_BUT_IGNORE_CASE, new Set([anythingBut]));
    }

    static anythingButIgnoreCaseMatchSet(anythingButs: Set<string>): AnythingButValuesSet {
        return new AnythingButValuesSet(MatchType.ANYTHING_BUT_IGNORE_CASE, anythingButs);
    }

    static anythingButNumbersMatch(anythingButs: Set<string>): AnythingBut {
        const normalizedNumbers = new Set<string>();
        for (const d of anythingButs) {
            normalizedNumbers.add(ComparableNumber.generate(d));
        }
        return new AnythingBut(normalizedNumbers, true);
    }

    static anythingButPrefix(prefix: string): AnythingButValuesSet {
        return new AnythingButValuesSet(MatchType.ANYTHING_BUT_PREFIX, new Set([prefix]));
    }

    static anythingButPrefixSet(anythingButs: Set<string>): AnythingButValuesSet {
        return new AnythingButValuesSet(MatchType.ANYTHING_BUT_PREFIX, anythingButs);
    }

    static anythingButSuffix(suffix: string): AnythingButValuesSet {
        return new AnythingButValuesSet(MatchType.ANYTHING_BUT_SUFFIX, new Set([suffix.split('').reverse().join('')]));
    }

    static anythingButSuffixSet(anythingButs: Set<string>): AnythingButValuesSet {
        const reversed = new Set<string>();
        for (const s of anythingButs) {
            reversed.add(s.split('').reverse().join(''));
        }
        return new AnythingButValuesSet(MatchType.ANYTHING_BUT_SUFFIX, reversed);
    }

    static anythingButWildcard(value: string): AnythingButValuesSet {
        return new AnythingButValuesSet(MatchType.ANYTHING_BUT_WILDCARD, new Set([value]));
    }

    static anythingButWildcardSet(anythingButs: Set<string>): AnythingButValuesSet {
        return new AnythingButValuesSet(MatchType.ANYTHING_BUT_WILDCARD, anythingButs);
    }

    static numericEquals(val: string): ValuePatterns {
        return new ValuePatterns(MatchType.NUMERIC_EQ, ComparableNumber.generate(val));
    }

    static existencePatterns(): Patterns {
        return new Patterns(MatchType.EXISTS);
    }

    static absencePatterns(): Patterns {
        return new Patterns(MatchType.ABSENT);
    }

    static equalsIgnoreCaseMatch(value: string): ValuePatterns {
        return new ValuePatterns(MatchType.EQUALS_IGNORE_CASE, value);
    }

    static wildcardMatch(value: string): ValuePatterns {
        return new ValuePatterns(MatchType.WILDCARD, value);
    }

    clone(): Patterns {
        return new Patterns(this.type);
    }

    equals(o: any): boolean {
        if (!(o instanceof Patterns)) {
            return false;
        }
        return this.type === o.type;
    }

    hashCode(): number {
        return this.type ? this.type.hashCode() : 0;
    }

    toString(): string {
        return `T:${this.type}`;
    }
} 