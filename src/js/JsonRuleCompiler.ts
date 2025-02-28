import { Patterns } from './Patterns';
import { Path } from './Path';
import { MatchType } from './MatchType';
import { CIDR } from './CIDR';
import { AnythingBut } from './AnythingBut';
import { AnythingButValuesSet } from './AnythingButValuesSet';

/**
 * Compiles Rules, expressed in JSON, for use in Ruler.
 */
export class JsonRuleCompiler {
    private constructor() {}

    public static check(source: string | Uint8Array): string | null {
        try {
            JsonRuleCompiler.doCompile(source);
            return null;
        } catch (error: unknown) {
            return error instanceof Error ? error.message : String(error);
        }
    }

    public static compile(source: string | Uint8Array): Map<string, Patterns[]> {
        return JsonRuleCompiler.doCompile(source);
    }

    private static doCompile(source: string | Uint8Array): Map<string, Patterns[]> {
        const path = new Path();
        const rule = new Map<string, Patterns[]>();
        const json = typeof source === 'string' ? JSON.parse(source) as Record<string, unknown> : JSON.parse(new TextDecoder().decode(source)) as Record<string, unknown>;

        if (typeof json !== 'object' || json === null || Array.isArray(json)) {
            throw new Error("Filter is not an object");
        }

        JsonRuleCompiler.parseObject(rule, path, json, true);
        return rule;
    }

    private static parseObject(rule: Map<string, Patterns[]>, path: Path, obj: Record<string, unknown>, withQuotes: boolean): void {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            throw new Error("Empty objects are not allowed");
        }

        for (const key of keys) {
            const value = obj[key];
            if (key === "$or") {
                if (!Array.isArray(value)) {
                    throw new Error("$or value must be an array");
                }
                JsonRuleCompiler.parseIntoOrRelationship(rule, path, value, withQuotes);
                continue;
            }
            
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    JsonRuleCompiler.writeRules(rule, path.extendedName(key), value, withQuotes);
                } else {
                    path.push(key);
                    JsonRuleCompiler.parseObject(rule, path, value as Record<string, unknown>, withQuotes);
                    path.pop();
                }
            } else {
                throw new Error(`"${key}" must be an object or an array`);
            }
        }
    }

    private static parseIntoOrRelationship(rule: Map<string, Patterns[]>, path: Path, orArray: unknown[], withQuotes: boolean): void {
        if (orArray.length === 0) {
            throw new Error("$or array must not be empty");
        }

        for (const item of orArray) {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                throw new Error("Each item in $or array must be an object");
            }
            JsonRuleCompiler.parseObject(rule, path, item as Record<string, unknown>, withQuotes);
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
                        patterns.push(JsonRuleCompiler.processMatchExpression(value as Record<string, unknown>));
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

    private static processMatchExpression(obj: Record<string, unknown>): Patterns {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            throw new Error("Empty match expression");
        }
        if (keys.length > 1) {
            throw new Error("Match object must contain exactly one field");
        }

        const matchType = keys[0];
        const value = obj[matchType];

        switch (matchType) {
            case "exactly":
                if (typeof value !== 'string') {
                    throw new Error("exact match pattern must be a string");
                }
                return Patterns.exactMatch(`"${value}"`);

            case "prefix":
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Handle prefix-equals-ignore-case
                    const prefixObj = value as Record<string, unknown>;
                    if (Object.keys(prefixObj).length !== 1 || !prefixObj["equals-ignore-case"]) {
                        throw new Error("Unsupported prefix pattern");
                    }
                    if (typeof prefixObj["equals-ignore-case"] !== 'string') {
                        throw new Error("equals-ignore-case match pattern must be a string");
                    }
                    return Patterns.prefixEqualsIgnoreCaseMatch(`"${prefixObj["equals-ignore-case"]}"`);
                }
                if (typeof value !== 'string') {
                    throw new Error("prefix match pattern must be a string");
                }
                return Patterns.prefixMatch(`"${value}`); // note no trailing quote

            case "suffix":
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Handle suffix-equals-ignore-case
                    const suffixObj = value as Record<string, unknown>;
                    if (Object.keys(suffixObj).length !== 1 || !suffixObj["equals-ignore-case"]) {
                        throw new Error("Unsupported suffix pattern");
                    }
                    if (typeof suffixObj["equals-ignore-case"] !== 'string') {
                        throw new Error("equals-ignore-case match pattern must be a string");
                    }
                    return Patterns.suffixEqualsIgnoreCaseMatch(`${suffixObj["equals-ignore-case"]}"`);
                }
                if (typeof value !== 'string') {
                    throw new Error("suffix match pattern must be a string");
                }
                return Patterns.suffixMatch(`${value}"`); // note no beginning quote

            case "equals-ignore-case":
                if (typeof value !== 'string') {
                    throw new Error("equals-ignore-case match pattern must be a string");
                }
                return Patterns.equalsIgnoreCaseMatch(`"${value}"`);

            case "wildcard":
                if (typeof value !== 'string') {
                    throw new Error("wildcard match pattern must be a string");
                }
                return Patterns.wildcardMatch(`"${value}"`);

            case "anything-but":
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Handle anything-but with modifiers
                    const anythingButObj = value as Record<string, unknown>;
                    const objKeys = Object.keys(anythingButObj);
                    if (objKeys.length !== 1) {
                        throw new Error("Anything-But expression must contain exactly one field");
                    }
                    const modifier = objKeys[0];
                    const modifierValue = anythingButObj[modifier];

                    switch (modifier) {
                        case "equals-ignore-case":
                            if (typeof modifierValue !== 'string') {
                                throw new Error("equals-ignore-case match pattern must be a string");
                            }
                            return Patterns.anythingButIgnoreCaseMatch(`"${modifierValue}"`);
                        case "prefix":
                            if (typeof modifierValue !== 'string') {
                                throw new Error("prefix match pattern must be a string");
                            }
                            if (modifierValue === '') {
                                throw new Error("Null prefix not allowed");
                            }
                            return Patterns.anythingButPrefix(`"${modifierValue}`);
                        case "suffix":
                            if (typeof modifierValue !== 'string') {
                                throw new Error("suffix match pattern must be a string");
                            }
                            if (modifierValue === '') {
                                throw new Error("Null suffix not allowed");
                            }
                            return Patterns.anythingButSuffix(`${modifierValue}"`);
                        case "wildcard":
                            if (typeof modifierValue !== 'string') {
                                throw new Error("wildcard match pattern must be a string");
                            }
                            return Patterns.anythingButWildcard(`"${modifierValue}"`);
                        default:
                            throw new Error(`Unsupported anything-but pattern: ${modifier}`);
                    }
                }

                if (typeof value === 'string') {
                    return Patterns.anythingButMatch(`"${value}"`);
                }
                if (Array.isArray(value)) {
                    if (value.length === 0) {
                        throw new Error("anything-but array must not be empty");
                    }
                    const values = new Set(value.map(v => {
                        if (typeof v === 'string') {
                            return `"${v}"`;
                        } else if (typeof v === 'number') {
                            return v.toString();
                        } else {
                            throw new Error("Inside anything-but list, start|null|boolean is not supported");
                        }
                    }));
                    return Patterns.anythingButMatchSet(values);
                }
                throw new Error("anything-but value must be a string, array, or object with modifier");

            case "numeric":
                if (typeof value === 'string' || typeof value === 'number') {
                    return Patterns.numericEquals(value.toString());
                }
                if (Array.isArray(value)) {
                    if (value.length === 0 || value.length > 3) {
                        throw new Error("Invalid numeric range expression");
                    }
                    const [op, ...nums] = value;
                    if (typeof op !== 'string') {
                        throw new Error("Invalid member in numeric match");
                    }
                    if (!nums.every(n => typeof n === 'number' || typeof n === 'string')) {
                        throw new Error("Values in numeric range must be numbers or numeric strings");
                    }

                    if (op === "=") {
                        if (nums.length !== 1) {
                            throw new Error("Value of equals must be a single numeric value");
                        }
                        return Patterns.numericEquals(nums[0].toString());
                    }

                    // For ranges, we need to construct a range string like "10-20"
                    if (nums.length !== 1) {
                        throw new Error(`Value of ${op} must be a single numeric value`);
                    }

                    const num = nums[0].toString();
                    switch (op) {
                        case "<":
                            return Patterns.numericEquals(`-${num}`);
                        case "<=":
                            return Patterns.numericEquals(`-${num}`);
                        case ">":
                            return Patterns.numericEquals(`${num}-`);
                        case ">=":
                            return Patterns.numericEquals(`${num}-`);
                        default:
                            throw new Error(`Unknown numeric operator: ${op}`);
                    }
                }
                throw new Error("numeric match expression must be a number, string, or array");

            case "exists":
                if (typeof value !== 'boolean') {
                    throw new Error("exists match pattern must be true or false");
                }
                return value ? Patterns.existencePatterns() : Patterns.absencePatterns();

            case "cidr":
                if (typeof value !== 'string') {
                    throw new Error("cidr match pattern must be a string");
                }
                const cidr = CIDR.cidr(value);
                if (!cidr) {
                    throw new Error("Invalid CIDR pattern");
                }
                return cidr;

            default:
                throw new Error(`Unknown match type: ${matchType}`);
        }
    }
} 