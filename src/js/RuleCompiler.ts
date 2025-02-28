import { Path } from './Path';
import { CIDR } from './CIDR';
import { Patterns } from './Patterns';
import { MatchType } from './MatchType';
import { AnythingBut } from './AnythingBut';
import { AnythingButValuesSet } from './AnythingButValuesSet';

/**
 * Compiles Rules, expressed in JSON, for use in Ruler.
 * There are two flavors of compilation:
 * 1. Compile a JSON-based Rule into Map of String to List of Patterns which can be used in rulesForEvent,
 *    and has a "check" variant that just checks rules for syntactic accuracy
 * 2. Starting in ListBasedRuleCompiler, does the same thing but expresses field names as List of String
 *    rather than "."-separated strings for use in the Ruler class, which does not use state machines and
 *    needs to step into the event field by field.
 */
export abstract class RuleCompiler {
    protected constructor() {
        // Protected constructor to allow inheritance
    }

    /**
     * Verify the syntax of a rule
     * @param source rule, as a string or object
     * @returns null if the rule is valid, otherwise an error message
     */
    public static check(source: string | Record<string, unknown>): string | null {
        try {
            DotBasedRuleCompiler.doCompile(source);
            return null;
        } catch (error: unknown) {
            return error instanceof Error ? error.message : String(error);
        }
    }

    /**
     * Compile a rule from its JSON form to a Map suitable for use by events.ruler.Ruler
     * @param source rule, as a string or object
     * @returns Map form of rule
     */
    public static compile(source: string | Record<string, unknown>): Map<string, Patterns[]> {
        return DotBasedRuleCompiler.doCompile(source);
    }

    protected static processMatchExpression(obj: Record<string, unknown>): Patterns {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            throw new Error("Empty match expression");
        }
        if (keys.length > 1) {
            throw new Error("Match object must contain exactly one field");
        }

        const matchType = keys[0];
        const value = obj[matchType];
        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean' && !Array.isArray(value)) {
            throw new Error(`${matchType} value must be a string, number, boolean, or array`);
        }

        switch (matchType) {
            case "prefix":
                if (typeof value !== 'string') {
                    throw new Error("prefix value must be a string");
                }
                return Patterns.prefixMatch(value);

            case "prefix-equals-ignore-case":
                if (typeof value !== 'string') {
                    throw new Error("prefix-equals-ignore-case value must be a string");
                }
                return Patterns.prefixEqualsIgnoreCaseMatch(value);

            case "suffix":
                if (typeof value !== 'string') {
                    throw new Error("suffix value must be a string");
                }
                return Patterns.suffixMatch(value);

            case "suffix-equals-ignore-case":
                if (typeof value !== 'string') {
                    throw new Error("suffix-equals-ignore-case value must be a string");
                }
                return Patterns.suffixEqualsIgnoreCaseMatch(value);

            case "equals-ignore-case":
                if (typeof value !== 'string') {
                    throw new Error("equals-ignore-case value must be a string");
                }
                return Patterns.equalsIgnoreCaseMatch(value);

            case "wildcard":
                if (typeof value !== 'string') {
                    throw new Error("wildcard value must be a string");
                }
                return Patterns.wildcardMatch(value);

            case "anything-but":
                if (typeof value === 'string') {
                    return Patterns.anythingButMatch(value);
                }
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        throw new Error("anything-but array must not be empty");
                    }
                    const values = new Set(value.map(v => v.toString()));
                    return Patterns.anythingButMatchSet(values);
                }
                throw new Error("anything-but value must be a string or array of strings/numbers");

            case "anything-but-ignore-case":
                if (typeof value === 'string') {
                    return Patterns.anythingButIgnoreCaseMatch(value);
                }
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        throw new Error("anything-but-ignore-case array must not be empty");
                    }
                    if (!value.every(v => typeof v === 'string')) {
                        throw new Error("anything-but-ignore-case array elements must be strings");
                    }
                    const values = new Set(value.map(v => v.toLowerCase()));
                    return Patterns.anythingButIgnoreCaseMatchSet(values);
                }
                throw new Error("anything-but-ignore-case value must be a string or array of strings");

            case "numeric":
                if (typeof value === 'string' || typeof value === 'number') {
                    return Patterns.numericEquals(value.toString());
                }
                if (typeof value === 'object' && !Array.isArray(value)) {
                    return RuleCompiler.processNumericMatchExpression(value as Record<string, unknown>);
                }
                throw new Error("numeric match expression must be a number or object");

            case "exists":
                if (typeof value !== 'boolean') {
                    throw new Error("exists value must be true or false");
                }
                return value ? Patterns.existencePatterns() : Patterns.absencePatterns();

            default:
                throw new Error(`Unknown match type: ${matchType}`);
        }
    }

    protected static processNumericMatchExpression(obj: Record<string, unknown>): Patterns {
        let bottom: string | null = null;
        let top: string | null = null;
        let openBottom = false;
        let openTop = false;

        const keys = Object.keys(obj);
        for (const key of keys) {
            const value = obj[key];
            if (typeof value !== 'string' && typeof value !== 'number') {
                throw new Error(`${key} value must be a number or string`);
            }

            const strValue = value.toString();
            switch (key) {
                case "less-than":
                    if (top !== null) {
                        throw new Error("Match object must contain exactly one field");
                    }
                    top = strValue;
                    openTop = true;
                    break;

                case "less-than-equals":
                    if (top !== null) {
                        throw new Error("Match object must contain exactly one field");
                    }
                    top = strValue;
                    openTop = false;
                    break;

                case "greater-than":
                    if (bottom !== null) {
                        throw new Error("Match object must contain exactly one field");
                    }
                    bottom = strValue;
                    openBottom = true;
                    break;

                case "greater-than-equals":
                    if (bottom !== null) {
                        throw new Error("Match object must contain exactly one field");
                    }
                    bottom = strValue;
                    openBottom = false;
                    break;

                default:
                    throw new Error(`Unknown numeric match type: ${key}`);
            }
        }

        if (bottom === null && top === null) {
            throw new Error("Numeric range must have at least one boundary");
        }

        if (bottom !== null && top === null) {
            return Patterns.numericEquals(bottom);
        }

        if (bottom === null && top !== null) {
            return Patterns.numericEquals(top);
        }

        return Patterns.numericEquals(`${bottom!}-${top!}`);
    }
}

/**
 * Default implementation of RuleCompiler that uses dot notation for field names
 */
export class DotBasedRuleCompiler extends RuleCompiler {
    public static doCompile(source: string | Record<string, unknown>): Map<string, Patterns[]> {
        const path = new Path();
        const rule = new Map<string, Patterns[]>();
        const json = typeof source === 'string' ? JSON.parse(source) as Record<string, unknown> : source;

        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            throw new Error("Filter is not an object");
        }

        DotBasedRuleCompiler.parseObject(rule, path, json, true);
        return rule;
    }

    private static parseObject(rule: Map<string, Patterns[]>, path: Path, obj: Record<string, unknown>, withQuotes: boolean): void {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            throw new Error("Empty objects are not allowed");
        }

        for (const key of keys) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    DotBasedRuleCompiler.writeRules(rule, path.extendedName(key), value, withQuotes);
                } else {
                    path.push(key);
                    DotBasedRuleCompiler.parseObject(rule, path, value as Record<string, unknown>, withQuotes);
                    path.pop();
                }
            } else {
                throw new Error(`"${key}" must be an object or an array`);
            }
        }
    }

    private static writeRules(rule: Map<string, Patterns[]>, name: string, values: unknown[], withQuotes: boolean): void {
        if (values.length === 0) {
            throw new Error("Empty arrays are not allowed");
        }

        const patterns: Patterns[] = [];
        for (const value of values) {
            if (value === null) {
                patterns.push(Patterns.exactMatch("null"));
                continue;
            }

            switch (typeof value) {
                case 'string': {
                    const ipRange = CIDR.ipToRangeIfPossible(value);
                    if (ipRange) {
                        patterns.push(ipRange);
                    } else if (withQuotes) {
                        patterns.push(Patterns.exactMatch(`"${value}"`));
                    } else {
                        patterns.push(Patterns.exactMatch(value));
                    }
                    break;
                }
                case 'number':
                    try {
                        patterns.push(Patterns.numericEquals(value.toString()));
                    } catch (e) {
                        // no-op
                    }
                    patterns.push(Patterns.exactMatch(value.toString()));
                    break;
                case 'boolean':
                    patterns.push(Patterns.exactMatch(value.toString()));
                    break;
                case 'object':
                    if (!Array.isArray(value)) {
                        patterns.push(RuleCompiler.processMatchExpression(value as Record<string, unknown>));
                    } else {
                        throw new Error("Match value must be String, number, true, false, null, or match expression object");
                    }
                    break;
                default:
                    throw new Error("Match value must be String, number, true, false, null, or match expression object");
            }
        }

        rule.set(name, patterns);
    }
}

/**
 * A variant of RuleCompiler that expresses field names as arrays of strings
 * rather than dot-separated strings.
 */
export class ListBasedRuleCompiler extends RuleCompiler {
    public static flattenRule(source: string | Record<string, unknown>): Map<string[], Patterns[]> {
        const json = typeof source === 'string' ? JSON.parse(source) as Record<string, unknown> : source;
        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            throw new Error("Filter is not an object");
        }

        const stack: string[] = [];
        const rule = new Map<string[], Patterns[]>();
        ListBasedRuleCompiler.parseRuleObject(rule, stack, json, true);
        return rule;
    }

    private static parseRuleObject(rule: Map<string[], Patterns[]>, stack: string[], obj: Record<string, unknown>, withQuotes: boolean): void {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            throw new Error("Empty objects are not allowed");
        }

        for (const key of keys) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    ListBasedRuleCompiler.writeRules(rule, ListBasedRuleCompiler.rulePathname(stack, key), value, withQuotes);
                } else {
                    stack.push(key);
                    ListBasedRuleCompiler.parseRuleObject(rule, stack, value as Record<string, unknown>, withQuotes);
                    stack.pop();
                }
            } else {
                throw new Error(`"${key}" must be an object or an array`);
            }
        }
    }

    private static writeRules(rule: Map<string[], Patterns[]>, name: string[], values: unknown[], withQuotes: boolean): void {
        if (values.length === 0) {
            throw new Error("Empty arrays are not allowed");
        }

        const patterns: Patterns[] = [];
        for (const value of values) {
            if (value === null) {
                patterns.push(Patterns.exactMatch("null"));
                continue;
            }

            switch (typeof value) {
                case 'string': {
                    const ipRange = CIDR.ipToRangeIfPossible(value);
                    if (ipRange) {
                        patterns.push(ipRange);
                    } else if (withQuotes) {
                        patterns.push(Patterns.exactMatch(`"${value}"`));
                    } else {
                        patterns.push(Patterns.exactMatch(value));
                    }
                    break;
                }
                case 'number':
                    try {
                        patterns.push(Patterns.numericEquals(value.toString()));
                    } catch (e) {
                        // no-op
                    }
                    patterns.push(Patterns.exactMatch(value.toString()));
                    break;
                case 'boolean':
                    patterns.push(Patterns.exactMatch(value.toString()));
                    break;
                case 'object':
                    if (!Array.isArray(value)) {
                        patterns.push(RuleCompiler.processMatchExpression(value as Record<string, unknown>));
                    } else {
                        throw new Error("Match value must be String, number, true, false, null, or match expression object");
                    }
                    break;
                default:
                    throw new Error("Match value must be String, number, true, false, null, or match expression object");
            }
        }

        rule.set(name, patterns);
    }

    private static rulePathname(path: string[], stepName: string): string[] {
        return [...path, stepName];
    }
} 