import { ByteMatch } from "./ByteMatch";
import { ByteState } from "./ByteState";
import { ByteTransition } from "./ByteTransition";
import { SingleByteTransition } from "./SingleByteTransition";

export class ShortcutTransition extends SingleByteTransition {
    private match: ByteMatch;

    getNextByteState(): ByteState | null {
        return null;
    }

    setNextByteState(nextState: ByteState): SingleByteTransition {
        return nextState;
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

    setMatch(match: ByteMatch): SingleByteTransition {
        this.match = match;
        return this;
    }

    getShortcuts(): Iterable<ShortcutTransition> {
        return [this];
    }

    isShortcutTrans(): boolean {
        return true;
    }
} 