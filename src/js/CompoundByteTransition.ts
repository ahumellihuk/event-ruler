import { ByteMatch } from "./ByteMatch";
import { ByteState } from "./ByteState";
import { ByteTransition } from "./ByteTransition";
import { ShortcutTransition } from "./ShortcutTransition";
import { SingleByteTransition } from "./SingleByteTransition";

export class CompoundByteTransition extends ByteTransition {
    private readonly byteTransitions: Set<SingleByteTransition>;
    private readonly shortcutTransitions: Set<ShortcutTransition>;
    private readonly matchableTransitions: Set<SingleByteTransition>;
    private readonly transitionForNextByteState: ByteTransition;

    private constructor(byteTransitions: Set<SingleByteTransition>) {
        super();
        this.byteTransitions = new Set(byteTransitions);

        const shortcutTransitions = new Set<ShortcutTransition>();
        const matchableTransitions = new Set<SingleByteTransition>();
        const nextByteStates = new Set<SingleByteTransition>();

        this.byteTransitions.forEach(t => {
            if (t.isShortcutTrans()) {
                shortcutTransitions.add(t as ShortcutTransition);
            }
            if (t.isMatchTrans()) {
                matchableTransitions.add(t);
            }
            const nextByteState = t.getNextByteState();
            if (nextByteState !== null) {
                nextByteStates.add(nextByteState);
            }
        });

        this.shortcutTransitions = new Set(shortcutTransitions);
        this.matchableTransitions = new Set(matchableTransitions);
        this.transitionForNextByteState = nextByteStates.size === byteTransitions.size ? this : CompoundByteTransition.coalesce(nextByteStates);
    }

    static coalesce<T extends ByteTransition>(singles: Iterable<SingleByteTransition>): T | null {
        const iterator = singles[Symbol.iterator]();
        const firstElement = iterator.next().value;
        if (!firstElement) {
            return null;
        }

        if (iterator.next().done) {
            return firstElement as T;
        } else if (singles instanceof Set) {
            return new CompoundByteTransition(singles as Set<SingleByteTransition>) as T;
        } else {
            const set = new Set<SingleByteTransition>();
            for (const single of singles) {
                set.add(single);
            }
            return new CompoundByteTransition(set) as T;
        }
    }

    getNextByteState(): ByteState | null {
        let firstNonNull: ByteState | null = null;
        for (const trans of this.byteTransitions) {
            for (const single of trans.expand()) {
                const nextByteState = single.getNextByteState();
                if (nextByteState !== null) {
                    if (!nextByteState.hasIndeterminatePrefix()) {
                        return nextByteState;
                    }
                    if (firstNonNull === null) {
                        firstNonNull = nextByteState;
                    }
                }
            }
        }
        return firstNonNull;
    }

    setNextByteState(nextState: ByteState): SingleByteTransition {
        return nextState;
    }

    expand(): Set<SingleByteTransition> {
        return this.byteTransitions;
    }

    getTransitionForNextByteStates(): ByteTransition {
        return this.transitionForNextByteState;
    }

    getMatches(): Set<ByteMatch> {
        const matches = new Set<ByteMatch>();
        for (const single of this.matchableTransitions) {
            for (const match of single.getMatches()) {
                matches.add(match);
            }
        }
        return matches;
    }

    getShortcuts(): Set<ShortcutTransition> {
        return this.shortcutTransitions;
    }

    getTransition(utf8byte: number): ByteTransition | null {
        const singles = new Set<SingleByteTransition>();
        for (const transition of this.byteTransitions) {
            const nextTransition = transition.getTransition(utf8byte);
            if (nextTransition !== null) {
                for (const t of nextTransition.expand()) {
                    singles.add(t);
                }
            }
        }
        return CompoundByteTransition.coalesce(singles);
    }

    getTransitions(): Set<ByteTransition> {
        const allCeilings = new Set<number>();
        for (const transition of this.byteTransitions) {
            const nextByteState = transition.getNextByteState();
            if (nextByteState !== null) {
                for (const ceiling of nextByteState.getCeilings()) {
                    allCeilings.add(ceiling);
                }
            }
        }

        const result = new Set<ByteTransition>();
        for (const ceiling of allCeilings) {
            const singles = new Set<SingleByteTransition>();
            for (const transition of this.byteTransitions) {
                const nextTransition = transition.getTransition(ceiling - 1);
                if (nextTransition !== null) {
                    for (const t of nextTransition.expand()) {
                        singles.add(t);
                    }
                }
            }

            const coalesced = CompoundByteTransition.coalesce(singles);
            if (coalesced !== null) {
                result.add(coalesced);
            }
        }

        return result;
    }

    equals(o: any): boolean {
        if (o == null || o.constructor !== this.constructor) {
            return false;
        }
        const other = o as CompoundByteTransition;
        return this.byteTransitions === other.byteTransitions;
    }

    hashCode(): number {
        return Array.from(this.byteTransitions).reduce((acc, trans) => acc + trans.hashCode(), 0);
    }

    toString(): string {
        return `CBT: ${Array.from(this.byteTransitions).toString()}`;
    }
} 