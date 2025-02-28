import { JsonNode, ObjectMapper } from 'jackson-js';
import { Machine } from './Machine';
import { RuleCompiler } from './RuleCompiler';
import { AnythingBut } from './AnythingBut';
import { AnythingButValuesSet } from './AnythingButValuesSet';
import { CIDR } from './CIDR';
import { MatchType } from './MatchType';
import { Patterns } from './Patterns';
import { ValuePatterns } from './ValuePatterns';

export class Ruler {
    private static readonly OBJECT_MAPPER = new ObjectMapper();

    private constructor() {}

    public static matchesRule(event: string, rule: string): boolean {
        const machine = new Machine();
        machine.addRule('rule', rule);
        return machine.rulesForJSONEvent(event).length > 0;
    }

    public static matches(event: string, rule: string): boolean {
        const eventRoot = Ruler.OBJECT_MAPPER.readTree(event);
        const ruleMap = RuleCompiler.ListBasedRuleCompiler.flattenRule(rule);
        return Ruler.matchesAllFields(eventRoot, ruleMap);
    }

    private static matchesAllFields(event: JsonNode, rule: Map<string[], Patterns[]>): boolean {
        for (const [key, value] of rule.entries()) {
            const fieldValue = Ruler.tryToRetrievePath(event, key);
            if (!Ruler.matchesOneOf(fieldValue, value)) {
                return false;
            }
        }
        return true;
    }

    private static matchesOneOf(val: JsonNode, patterns: Patterns[]): boolean {
        for (const pattern of patterns) {
            if (val == null) {
                if (pattern.type() === MatchType.ABSENT) {
                    return true;
                }
            } else if (val.isArray()) {
                for (const element of val) {
                    if (Ruler.matches(element, pattern)) {
                        return true;
                    }
                }
            } else {
                if (Ruler.matches(val, pattern)) {
                    return true;
                }
            }
        }
        return false;
    }

    private static matches(val: JsonNode, pattern: Patterns): boolean {
        switch (pattern.type()) {
            case MatchType.EXACT:
                const valuePattern = pattern as ValuePatterns;
                const compareTo = val.isTextual() ? `"${val.asText()}"` : val.asText();
                return compareTo === valuePattern.pattern();
            case MatchType.PREFIX:
                return val.isTextual() && `"${val.asText()}`.startsWith((pattern as ValuePatterns).pattern());
            case MatchType.PREFIX_EQUALS_IGNORE_CASE:
                return val.isTextual() && `"${val.asText().toLowerCase()}`.startsWith((pattern as ValuePatterns).pattern().toLowerCase());
            case MatchType.SUFFIX:
                return val.isTextual() && `${val.asText()}"`.endsWith((pattern as ValuePatterns).pattern().split('').reverse().join(''));
            case MatchType.SUFFIX_EQUALS_IGNORE_CASE:
                return val.isTextual() && `${val.asText().toLowerCase()}"`.endsWith((pattern as ValuePatterns).pattern().toLowerCase().split('').reverse().join(''));
            case MatchType.ANYTHING_BUT:
                const anythingButPattern = pattern as AnythingBut;
                if (val.isTextual()) {
                    return !anythingButPattern.getValues().some(v => v === `"${val.asText()}"`);
                } else if (val.isNumber()) {
                    return !anythingButPattern.getValues().some(v => v === ComparableNumber.generate(val.asText()));
                }
                return false;
            case MatchType.ANYTHING_BUT_IGNORE_CASE:
                const anythingButIgnoreCasePattern = pattern as AnythingButValuesSet;
                if (val.isTextual()) {
                    return !anythingButIgnoreCasePattern.getValues().some(v => v.toLowerCase() === `"${val.asText().toLowerCase()}"`);
                }
                return false;
            case MatchType.ANYTHING_BUT_SUFFIX:
                const anythingButSuffixPattern = pattern as AnythingButValuesSet;
                const valueForSuffix = `${val.asText()}"`;
                if (val.isTextual()) {
                    return !anythingButSuffixPattern.getValues().some(v => valueForSuffix.startsWith(v));
                }
                return false;
            case MatchType.ANYTHING_BUT_PREFIX:
                const anythingButPrefixPattern = pattern as AnythingButValuesSet;
                const valueForPrefix = `"${val.asText()}"`;
                if (val.isTextual()) {
                    return !anythingButPrefixPattern.getValues().some(v => valueForPrefix.startsWith(v));
                }
                return false;
            case MatchType.NUMERIC_EQ:
                return val.isNumber() && ComparableNumber.generate(val.asText()) === (pattern as ValuePatterns).pattern();
            case MatchType.EXISTS:
                return true;
            case MatchType.ABSENT:
                return false;
            case MatchType.NUMERIC_RANGE:
                const nr = pattern as Range;
                let bytes: Uint8Array;
                if (nr.isCIDR) {
                    if (!val.isTextual()) {
                        return false;
                    }
                    try {
                        bytes = new TextEncoder().encode(CIDR.ipToString(val.asText()));
                    } catch (e) {
                        return false;
                    }
                } else {
                    if (!val.isNumber()) {
                        return false;
                    }
                    bytes = new TextEncoder().encode(ComparableNumber.generate(val.asText()));
                }
                const comparedToBottom = Ruler.compare(bytes, nr.bottom);
                if (comparedToBottom > 0 || (comparedToBottom === 0 && !nr.openBottom)) {
                    const comparedToTop = Ruler.compare(bytes, nr.top);
                    return comparedToTop < 0 || (comparedToTop === 0 && !nr.openTop);
                }
                return false;
            case MatchType.EQUALS_IGNORE_CASE:
                return val.isTextual() && `"${val.asText()}"`.toLowerCase() === (pattern as ValuePatterns).pattern().toLowerCase();
            case MatchType.WILDCARD:
                return val.isTextual() && new RegExp((pattern as ValuePatterns).pattern().replace(/\*/g, '.*')).test(`"${val.asText()}"`);
            default:
                throw new Error(`Unsupported Pattern type ${pattern.type()}`);
        }
    }

    private static tryToRetrievePath(node: JsonNode, path: string[]): JsonNode | null {
        for (const step of path) {
            if (!node || !node.isObject()) {
                return null;
            }
            node = node.get(step);
        }
        return node;
    }

    private static compare(a: Uint8Array, b: Uint8Array): number {
        if (a.length !== b.length) throw new Error('Byte arrays must be of equal length');
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return a[i] - b[i];
            }
        }
        return 0;
    }
} 