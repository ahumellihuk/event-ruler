import { AnythingBut } from "./AnythingBut";
import { AnythingButValuesSet } from "./AnythingButValuesSet";
import { ByteMatch } from "./ByteMatch";
import { ByteState } from "./ByteState";
import { ByteTransition } from "./ByteTransition";
import { CIDR } from "./CIDR";
import { InputCharacter } from "./input/InputCharacter";
import { MatchType } from "./MatchType";
import { NameState } from "./NameState";
import { NameStateWithPattern } from "./NameStateWithPattern";
import { Patterns } from "./Patterns";
import { SingleByteTransition } from "./SingleByteTransition";
import { ValuePatterns } from "./ValuePatterns";

export class ByteMachine {
    private static readonly SHORTCUT_MATCH_TYPES = new Set([MatchType.EXACT]);

    private readonly startState = new ByteState();
    private startStateMatch: ByteMatch | null = null;

    private readonly hasNumeric = new AtomicInteger(0);
    private readonly hasIP = new AtomicInteger(0);
    private readonly hasSuffix = new AtomicInteger(0);

    private readonly anythingButs = new Map<NameState, Patterns[]>();

    transitionOn(valString: string): Set<NameStateWithPattern> {
        const transitionTo = new Set<NameStateWithPattern>();

        if (this.hasIP.get() > 0) {
            try {
                const ipString = valString.startsWith('"') && valString.endsWith('"')
                    ? CIDR.ipToString(valString.slice(1, -1))
                    : CIDR.ipToString(valString);
                this.doTransitionOn(ipString, transitionTo, TransitionValueType.CIDR);
            } catch (e) {
                // no-op
            }
        }

        if (this.hasNumeric.get() > 0) {
            try {
                this.doTransitionOn(ComparableNumber.generate(valString), transitionTo, TransitionValueType.NUMERIC);
                return transitionTo;
            } catch (e) {
                // no-op
            }
        }
        this.doTransitionOn(valString, transitionTo, TransitionValueType.STRING);
        return transitionTo;
    }

    isEmpty(): boolean {
        return this.startState.hasNoTransitions() && this.startStateMatch === null &&
               this.anythingButs.size === 0 && this.hasNumeric.get() === 0 &&
               this.hasIP.get() === 0;
    }

    deletePattern(pattern: Patterns): void {
        switch (pattern.type()) {
            case MatchType.NUMERIC_RANGE:
                this.deleteRangePattern(pattern as Range);
                break;
            case MatchType.ANYTHING_BUT:
                this.deleteAnythingButPattern(pattern as AnythingBut);
                break;
            case MatchType.ANYTHING_BUT_IGNORE_CASE:
            case MatchType.ANYTHING_BUT_PREFIX:
            case MatchType.ANYTHING_BUT_SUFFIX:
            case MatchType.ANYTHING_BUT_WILDCARD:
                this.deleteAnythingButValuesSetPattern(pattern as AnythingButValuesSet);
                break;
            case MatchType.EXACT:
            case MatchType.NUMERIC_EQ:
            case MatchType.PREFIX:
            case MatchType.PREFIX_EQUALS_IGNORE_CASE:
            case MatchType.SUFFIX:
            case MatchType.SUFFIX_EQUALS_IGNORE_CASE:
            case MatchType.EQUALS_IGNORE_CASE:
            case MatchType.WILDCARD:
                this.deleteMatchPattern(pattern as ValuePatterns);
                break;
            case MatchType.EXISTS:
                this.deleteExistencePattern(pattern);
                break;
            default:
                throw new Error(`${pattern} is not implemented yet`);
        }
    }

    private deleteExistencePattern(pattern: Patterns): void {
        const characters = getParser().parse(pattern.type(), Patterns.EXISTS_BYTE_STRING);
        this.deleteMatchStep(this.startState, 0, pattern, characters);
    }

    private deleteAnythingButPattern(pattern: AnythingBut): void {
        pattern.getValues().forEach(value =>
            this.deleteMatchStep(this.startState, 0, pattern, getParser().parse(pattern.type(), value)));
    }

    private deleteAnythingButValuesSetPattern(pattern: AnythingButValuesSet): void {
        pattern.getValues().forEach(value =>
            this.deleteMatchStep(this.startState, 0, pattern, getParser().parse(pattern.type(), value)));
    }

    private deleteMatchPattern(pattern: ValuePatterns): void {
        const characters = getParser().parse(pattern.type(), pattern.pattern());

        if (characters.length === 1 && isWildcard(characters[0])) {
            this.startStateMatch = null;
            return;
        }

        this.deleteMatchStep(this.startState, 0, pattern, characters);
    }

    private deleteMatchStep(byteState: ByteState, charIndex: number, pattern: Patterns,
                            characters: InputCharacter[]): void {
        const currentChar = characters[charIndex];
        const trans = getTransition(byteState, currentChar);

        for (const eachTrans of trans.expand()) {
            if (charIndex < characters.length - 1) {
                if (eachTrans.isShortcutTrans()) {
                    this.deleteMatch(currentChar, byteState, pattern, eachTrans);
                } else {
                    const nextByteState = eachTrans.getNextByteState();
                    if (nextByteState && nextByteState !== byteState) {
                        this.deleteMatchStep(nextByteState, charIndex + 1, pattern, characters);
                    }

                    eachTrans = this.deleteMatchStepForWildcard(byteState, charIndex, pattern, characters, eachTrans,
                        nextByteState);

                    if (nextByteState &&
                        (nextByteState.hasNoTransitions() || nextByteState.hasOnlySelfReferentialTransition())) {
                        putTransitionNextState(byteState, currentChar, eachTrans, null);
                    }
                }
            } else {
                this.deleteMatch(currentChar, byteState, pattern, eachTrans);
            }
        }
    }

    private deleteMatchStepForWildcard(byteState: ByteState, charIndex: number, pattern: Patterns,
                                       characters: InputCharacter[],
                                       transition: SingleByteTransition, nextByteState: ByteState): SingleByteTransition {
        const currentChar = characters[charIndex];

        if (charIndex === characters.length - 2 && isWildcard(characters[characters.length - 1])) {
            this.deleteMatch(currentChar, byteState, pattern, transition);
        }
        return transition;
    }

    private doTransitionOn(valString: string, transitionTo: Set<NameStateWithPattern>, valueType: TransitionValueType): void {
        // Implement the logic for handling transitions based on value type
    }

    private deleteRangePattern(range: Range): void {
        // Implement the logic for deleting range patterns
    }

    private deleteMatch(currentChar: InputCharacter, byteState: ByteState, pattern: Patterns, trans: SingleByteTransition): void {
        // Implement the logic for deleting a match
    }

    private static getTransition(byteState: ByteState, currentChar: InputCharacter): ByteTransition {
        // Implement the logic to get a transition
        return {} as ByteTransition; // Placeholder
    }

    private static putTransitionNextState(byteState: ByteState, currentChar: InputCharacter, transition: SingleByteTransition, nextState: ByteState | null): void {
        // Implement the logic to put a transition to the next state
    }

    private static isWildcard(character: InputCharacter): boolean {
        // Implement the logic to check if a character is a wildcard
        return false; // Placeholder
    }

    // Additional methods and logic to be implemented
} 