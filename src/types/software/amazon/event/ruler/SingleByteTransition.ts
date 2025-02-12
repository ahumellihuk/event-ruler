import { ByteMatch } from "./ByteMatch";
import { ByteTransition } from "./ByteTransition";


export abstract class SingleByteTransition extends ByteTransition implements Iterable<SingleByteTransition> {
    abstract getMatch(): ByteMatch | null;
    abstract setMatch(match: ByteMatch | null): SingleByteTransition;
    abstract getTransitionForAllBytes(): ByteTransition | null;

    getMatches(): Iterable<ByteMatch> {
        const match = this.getMatch();
        return match ? [match] : [];
    }

    expand(): Iterable<SingleByteTransition> {
        return [this];
    }

    [Symbol.iterator](): Iterator<SingleByteTransition> {
        let hasNext = true;
        return {
            next: (): IteratorResult<SingleByteTransition> => {
                if (hasNext) {
                    hasNext = false;
                    return { value: this, done: false };
                }
                return { value: null, done: true };
            }
        };
    }

    getTransitionForNextByteStates(): ByteTransition | null {
        return this.getNextByteState();
    }

    gatherObjects(objectSet: Set<Object>, maxObjectCount: number): void {
        if (!objectSet.has(this) && objectSet.size < maxObjectCount) {
            objectSet.add(this);
            const match = this.getMatch();
            if (match) {
                match.gatherObjects(objectSet, maxObjectCount);
            }
            for (const transition of this.getTransitions()) {
                transition.gatherObjects(objectSet, maxObjectCount);
            }
            const nextByteStates = this.getTransitionForNextByteStates();
            if (nextByteStates) {
                nextByteStates.gatherObjects(objectSet, maxObjectCount);
            }
        }
    }
} 