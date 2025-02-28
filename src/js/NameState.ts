import { ByteMachine } from "./ByteMachine";
import { NameMatcher } from "./NameMatcher";
import { Patterns } from "./Patterns";
import { SubRuleContext } from "./SubRuleContext";

export class NameState {
    private valueTransitions: Map<string, ByteMachine> = new Map();
    private mustNotExistMatchers: Map<string, NameMatcher<NameState>> = new Map();
    private keyToNextNameState: Map<string, NameState> = new Map();
    private patternToRules: Map<Patterns, Set<any>> = new Map();
    private patternToTerminalSubRuleIds: Map<Patterns, Set<SubRuleContext>> = new Map();
    private patternToNonTerminalSubRuleIds: Map<Patterns, Set<SubRuleContext>> = new Map();
    private subRuleIdToCount: Map<SubRuleContext, number> = new Map();

    getTransitionOn(token: string): ByteMachine | undefined {
        return this.valueTransitions.get(token);
    }

    getTerminalPatterns(): Set<Patterns> {
        return new Set(this.patternToTerminalSubRuleIds.keys());
    }

    getNonTerminalPatterns(): Set<Patterns> {
        return new Set(this.patternToNonTerminalSubRuleIds.keys());
    }

    getTerminalSubRuleIdsForPattern(pattern: Patterns): Set<SubRuleContext> | undefined {
        return this.patternToTerminalSubRuleIds.get(pattern);
    }

    getNonTerminalSubRuleIdsForPattern(pattern: Patterns): Set<SubRuleContext> | undefined {
        return this.patternToNonTerminalSubRuleIds.get(pattern);
    }

    deleteSubRule(rule: any, subRuleId: SubRuleContext, pattern: Patterns, isTerminal: boolean): boolean {
        this.deleteFromPatternToSetMap(this.patternToRules, pattern, rule);
        const patternToSubRules = isTerminal ? this.patternToTerminalSubRuleIds : this.patternToNonTerminalSubRuleIds;
        const deleted = this.deleteFromPatternToSetMap(patternToSubRules, pattern, subRuleId);
        if (deleted) {
            const count = this.subRuleIdToCount.get(subRuleId);
            if (count === 1) {
                this.subRuleIdToCount.delete(subRuleId);
            } else if (count !== undefined) {
                this.subRuleIdToCount.set(subRuleId, count - 1);
            }
        }
        return deleted;
    }

    private deleteFromPatternToSetMap(map: Map<Patterns, Set<any>>, pattern: Patterns, setElement: any): boolean {
        const set = map.get(pattern);
        if (set) {
            const deleted = set.delete(setElement);
            if (set.size === 0) {
                map.delete(pattern);
            }
            return deleted;
        }
        return false;
    }

    removeTransition(name: string): void {
        this.valueTransitions.delete(name);
    }

    removeKeyTransition(name: string): void {
        this.mustNotExistMatchers.delete(name);
    }

    removeNextNameState(key: string): void {
        this.keyToNextNameState.delete(key);
    }

    isEmpty(): boolean {
        return this.valueTransitions.size === 0 &&
               this.mustNotExistMatchers.size === 0 &&
               this.patternToRules.size === 0 &&
               this.patternToTerminalSubRuleIds.size === 0 &&
               this.patternToNonTerminalSubRuleIds.size === 0 &&
               this.subRuleIdToCount.size === 0;
    }

    addSubRule(rule: any, subRuleId: SubRuleContext, pattern: Patterns, isTerminal: boolean): void {
        this.addToPatternToSetMap(this.patternToRules, pattern, rule);
        const patternToSubRules = isTerminal ? this.patternToTerminalSubRuleIds : this.patternToNonTerminalSubRuleIds;
        if (this.addToPatternToSetMap(patternToSubRules, pattern, subRuleId)) {
            this.subRuleIdToCount.set(subRuleId, (this.subRuleIdToCount.get(subRuleId) || 0) + 1);
        }
    }

    private addToPatternToSetMap(map: Map<Patterns, Set<any>>, pattern: Patterns, setElement: any): boolean {
        if (!map.has(pattern)) {
            map.set(pattern, new Set());
        }
        return map.get(pattern)!.add(setElement);
    }

    containsRule(rule: any, pattern: Patterns): boolean {
        const rules = this.patternToRules.get(pattern);
        return rules !== undefined && rules.has(rule);
    }

    addTransition(key: string, to: ByteMachine): void {
        this.valueTransitions.set(key, to);
    }

    addKeyTransition(key: string, to: NameMatcher<NameState>): void {
        this.mustNotExistMatchers.set(key, to);
    }

    addNextNameState(key: string, nextNameState: NameState): void {
        this.keyToNextNameState.set(key, nextNameState);
    }

    getKeyTransitionOn(token: string): NameMatcher<NameState> | undefined {
        return this.mustNotExistMatchers.get(token);
    }

    hasKeyTransitions(): boolean {
        return this.mustNotExistMatchers.size > 0;
    }

    getNameTransitions(event: string[]): Set<NameState> {
        const nextNameStates = new Set<NameState>();
        if (this.mustNotExistMatchers.size === 0) {
            return nextNameStates;
        }
        const absentValues = new Set(this.mustNotExistMatchers.values());
        for (let i = 0; i < event.length; i += 2) {
            const matcher = this.mustNotExistMatchers.get(event[i]);
            if (matcher) {
                absentValues.delete(matcher);
                if (absentValues.size === 0) {
                    break;
                }
            }
        }
        for (const nameMatcher of absentValues) {
            nextNameStates.add(nameMatcher.getNextState());
        }
        return nextNameStates;
    }
} 