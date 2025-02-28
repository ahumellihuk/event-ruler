import { ByteMatch } from "./ByteMatch";
import { ByteState } from "./ByteState";
import { ShortcutTransition } from "./ShortcutTransition";
import { SingleByteTransition } from "./SingleByteTransition";

export abstract class ByteTransition {
    abstract getNextByteState(): ByteState | null;

    abstract setNextByteState(nextState: ByteState): SingleByteTransition;

    abstract getTransition(utf8byte: number): ByteTransition | null;

    abstract getTransitions(): Iterable<ByteTransition>;

    abstract getMatches(): Iterable<ByteMatch>;

    abstract getShortcuts(): Iterable<ShortcutTransition>;

    abstract expand(): Iterable<SingleByteTransition>;

    abstract getTransitionForNextByteStates(): ByteTransition;

    isShortcutTrans(): boolean {
        return false;
    }

    isMatchTrans(): boolean {
        return false;
    }

    isEmpty(): boolean {
        return !this.getMatches()[Symbol.iterator]().next().value && this.getNextByteState() === null;
    }

    hasIndeterminatePrefix(): boolean {
        return false;
    }

    gatherObjects(objectSet: Set<Object>, maxObjectCount: number): void {
        if (!objectSet.has(this) && objectSet.size < maxObjectCount) {
            objectSet.add(this);
            for (const match of this.getMatches()) {
                match.gatherObjects(objectSet, maxObjectCount);
            }
            const nextByteState = this.getNextByteState();
            if (nextByteState !== null) {
                nextByteState.gatherObjects(objectSet, maxObjectCount);
            }
        }
    }

    clone(): ByteTransition | null {
        try {
            return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        } catch (e) {
            return null;
        }
    }
} 