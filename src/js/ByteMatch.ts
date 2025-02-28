import { ByteState } from "./ByteState";
import { ByteTransition } from "./ByteTransition";
import { CompositeByteTransition } from "./CompositeByteTransition";
import { NameState } from "./NameState";
import { Patterns } from "./Patterns";
import { ShortcutTransition } from "./ShortcutTransition";
import { SingleByteTransition } from "./SingleByteTransition";

export class ByteMatch extends SingleByteTransition {
    private readonly pattern: Patterns;
    private readonly nextNameState: NameState;

    constructor(pattern: Patterns, nextNameState: NameState) {
        super();
        this.pattern = pattern;
        this.nextNameState = nextNameState;
    }

    getNextByteState(): ByteState | null {
        return null;
    }

    setNextByteState(nextState: ByteState | null): SingleByteTransition {
        return nextState === null ? this : new CompositeByteTransition(nextState, this);
    }

    getTransition(utf8byte: number): ByteTransition | null {
        return null;
    }

    getTransitionForAllBytes(): ByteTransition | null {
        return null;
    }

    getTransitions(): Set<ByteTransition> {
        return new Set();
    }

    getMatch(): ByteMatch {
        return this;
    }

    setMatch(match: ByteMatch): SingleByteTransition {
        return match;
    }

    getShortcuts(): Set<ShortcutTransition> {
        return new Set();
    }

    getPattern(): Patterns {
        return this.pattern;
    }

    getNextNameState(): NameState {
        return this.nextNameState;
    }

    isMatchTrans(): boolean {
        return true;
    }

    gatherObjects(objectSet: Set<Object>, maxObjectCount: number): void {
        if (!objectSet.has(this) && objectSet.size < maxObjectCount) {
            objectSet.add(this);
            this.nextNameState.gatherObjects(objectSet, maxObjectCount);
        }
    }

    toString(): string {
        return `BM: HC=${this.hashCode()} P=${this.pattern} (${this.pattern.pattern()}) NNS=${this.nextNameState}`;
    }

    equals(o: any): boolean {
        if (this === o) {
            return true;
        }
        if (o == null || o.constructor !== this.constructor) {
            return false;
        }
        const byteMatch = o as ByteMatch;
        return this.pattern === byteMatch.pattern && this.nextNameState === byteMatch.nextNameState;
    }

    hashCode(): number {
        return this.pattern.hashCode() ^ this.nextNameState.hashCode();
    }
} 