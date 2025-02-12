import { JsonRuleCompiler } from './JsonRuleCompiler';
import { Patterns } from './Patterns';

describe('JsonRuleCompiler', () => {
    test('testBigNumbers', () => {
        const rule = '{ "account": [ 123456789012 ] }';
        const event = '{"account": 123456789012 }';
        const compiledRule = JsonRuleCompiler.compile(rule);
        expect(compiledRule).toBeDefined();
        // Add logic to check if the event matches the compiled rule
    });

    test('testPrefixEqualsIgnoreCaseCompile', () => {
        const json = '{"a": [ { "prefix": { "equals-ignore-case": "child" } } ] }';
        expect(JsonRuleCompiler.check(json)).toBeNull();
    });

    test('testSuffixEqualsIgnoreCaseCompile', () => {
        const json = '{"a": [ { "suffix": { "equals-ignore-case": "child" } } ] }';
        expect(JsonRuleCompiler.check(json)).toBeNull();
    });

    test('testVariantForms', () => {
        const r1 = '{ "a": [ 133.3 ] }';
        const r2 = '{ "a": [ { "numeric": [ ">", 120, "<=", 140 ] } ] }';
        const r3 = '{ "b": [ "192.0.2.0" ] }';
        const r4 = '{ "b": [ { "cidr": "192.0.2.0/24" } ] }';
        const event = '{ "a": 133.3, "b": "192.0.2.0" }';
        const compiledR1 = JsonRuleCompiler.compile(r1);
        const compiledR2 = JsonRuleCompiler.compile(r2);
        const compiledR3 = JsonRuleCompiler.compile(r3);
        const compiledR4 = JsonRuleCompiler.compile(r4);
        // Add logic to check if the event matches the compiled rules
    });

    test('testCompile', () => {
        let j = '[1,2,3]';
        expect(JsonRuleCompiler.check(j)).not.toBeNull();

        j = '{"a":1}';
        expect(JsonRuleCompiler.check(j)).not.toBeNull();

        j = '{"a":[ { "x":2 } ]}';
        expect(JsonRuleCompiler.check(j)).not.toBeNull();

        j = '{ "foo": {}}';
        expect(JsonRuleCompiler.check(j)).not.toBeNull();

        j = '{ "foo": []}';
        expect(JsonRuleCompiler.check(j)).not.toBeNull();

        j = '{"a":[1]}';
        expect(JsonRuleCompiler.check(j)).toBeNull();

        const compiled = JsonRuleCompiler.compile(j);
        const patterns = compiled.get('a');
        expect(patterns).toHaveLength(2);
        // Add further checks for patterns
    });
}); 