import { ByteMatch } from "./ByteMatch";
import { ByteState } from "./ByteState";
import { ByteTransition } from "./ByteTransition";
import { ShortcutTransition } from "./ShortcutTransition";
import { SingleByteTransition } from "./SingleByteTransition";

export class CompositeByteTransition extends SingleByteTransition {
    private nextState: ByteState;
    private match: ByteMatch;

    constructor(nextState: ByteState, match: ByteMatch) {
        super();
        this.nextState = nextState;
        this.match = match;
    }

    getNextByteState(): ByteState {
        return this.nextState;
    }

    setNextByteState(nextState: ByteState | null): SingleByteTransition {
        if (nextState === null) {
            return this.match;
        } else {
            this.nextState = nextState;
            return this;
        }
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
        return this.match;
    }

    setMatch(match: ByteMatch | null): SingleByteTransition {
        if (match === null) {
            return this.nextState;
        } else {
            this.match = match;
            return this;
        }
    }

    getShortcuts(): Set<ShortcutTransition> {
        return new Set();
    }

    hasIndeterminatePrefix(): boolean {
        return this.nextState !== null && this.nextState.hasIndeterminatePrefix();
    }

    isMatchTrans(): boolean {
        return true;
    }
} 