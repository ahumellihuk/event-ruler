import { ByteMachine } from "./ByteMachine";
import { ByteTransition } from "./ByteTransition";
import { SingleByteTransition } from "./SingleByteTransition";

class ByteMap {
    private map: Map<number, ByteTransition> = new Map<number, ByteTransition>();

    constructor() {
        this.map.set(256, null);
    }

    putTransition(utf8byte: number, transition: SingleByteTransition): void {
        this.updateTransition(utf8byte, transition, 'PUT');
    }

    putTransitionForAllBytes(transition: SingleByteTransition): void {
        const newMap = new Map<number, ByteTransition>();
        newMap.set(256, transition);
        this.map = newMap;
    }

    addTransition(utf8byte: number, transition: SingleByteTransition): void {
        this.updateTransition(utf8byte, transition, 'ADD');
    }

    addTransitionForAllBytes(transition: SingleByteTransition): void {
        const newMap = new Map<number, ByteTransition>(this.map);
        newMap.forEach((storedTransition, key) => {
            const newSingles = new Set<SingleByteTransition>();
            this.expand(storedTransition).forEach(single => newSingles.add(single));
            newSingles.add(transition);
            newMap.set(key, this.coalesce(newSingles));
        });
        this.map = newMap;
    }

    removeTransition(utf8byte: number, transition: SingleByteTransition): void {
        this.updateTransition(utf8byte, transition, 'REMOVE');
    }

    removeTransitionForAllBytes(transition: SingleByteTransition): void {
        const newMap = new Map<number, ByteTransition>(this.map);
        newMap.forEach((storedTransition, key) => {
            const newSingles = new Set<SingleByteTransition>();
            this.expand(storedTransition).forEach(single => newSingles.add(single));
            newSingles.delete(transition);
            newMap.set(key, this.coalesce(newSingles));
        });
        this.map = newMap;
    }

    private updateTransition(utf8byte: number, transition: SingleByteTransition, operation: 'ADD' | 'PUT' | 'REMOVE'): void {
        const index = utf8byte & 0xFF;
        const target = this.map.get(index + 1);

        let coalesced: ByteTransition;
        if (operation === 'PUT') {
            coalesced = this.coalesce(transition);
        } else {
            const targetIterable = this.expand(target);
            if (!targetIterable.size) {
                coalesced = operation === 'ADD' ? this.coalesce(transition) : null;
            } else {
                const singles = new Set<SingleByteTransition>(targetIterable);
                if (operation === 'ADD') {
                    singles.add(transition);
                } else {
                    singles.delete(transition);
                }
                coalesced = this.coalesce(singles);
            }
        }

        const atBottom = index === 0 || this.map.has(index);
        if (!atBottom) {
            this.map.set(index, target);
        }
        this.map.set(index + 1, coalesced);

        this.mergeAdjacentInMapIfNeeded(this.map);
    }

    private mergeAdjacentInMapIfNeeded(inputMap: Map<number, ByteTransition>): void {
        const entries = Array.from(inputMap.entries());
        for (let i = 0; i < entries.length - 1; i++) {
            const [key1, value1] = entries[i];
            const [key2, value2] = entries[i + 1];
            if (this.expand(value1).equals(this.expand(value2))) {
                inputMap.delete(key2);
            }
        }
    }

    isEmpty(): boolean {
        return this.numberOfTransitions() === 0;
    }

    numberOfTransitions(): number {
        return this.getSingleByteTransitions().size;
    }

    hasTransition(transition: ByteTransition): boolean {
        return this.getSingleByteTransitions().has(transition);
    }

    getTransition(utf8byte: number): ByteTransition | null {
        return this.map.get(utf8byte & 0xFF) || null;
    }

    getTransitionForAllBytes(): ByteTransition {
        const candidates = new Set<SingleByteTransition>();
        const iterator = this.map.values();
        const firstByteTransition = iterator.next().value;
        if (!firstByteTransition) {
            return ByteMachine.EmptyByteTransition.INSTANCE;
        }
        this.expand(firstByteTransition).forEach(single => candidates.add(single));

        for (const nextByteTransition of iterator) {
            if (!nextByteTransition) {
                return ByteMachine.EmptyByteTransition.INSTANCE;
            }
            const singles = this.expand(nextByteTransition);
            candidates.forEach(candidate => {
                if (!singles.has(candidate)) {
                    candidates.delete(candidate);
                }
            });
            if (!candidates.size) {
                return ByteMachine.EmptyByteTransition.INSTANCE;
            }
        }

        return this.coalesce(candidates);
    }

    getTransitions(): Set<ByteTransition> {
        const result = new Set<ByteTransition>();
        this.map.forEach(transition => {
            if (transition) {
                result.add(transition);
            }
        });
        return result;
    }

    getCeilings(): Set<number> {
        return new Set(this.map.keys());
    }

    private getSingleByteTransitions(): Set<SingleByteTransition> {
        const allTransitions = new Set<SingleByteTransition>();
        this.map.forEach(transition => {
            if (transition) {
                this.expand(transition).forEach(single => allTransitions.add(single));
            }
        });
        return allTransitions;
    }

    private expand(transition: ByteTransition): Set<SingleByteTransition> {
        if (!transition) {
            return new Set();
        }
        return transition.expand();
    }

    private coalesce(transitions: Set<SingleByteTransition>): ByteTransition {
        // Implement coalesce logic here
        return {} as ByteTransition; // Placeholder
    }

    toString(): string {
        const thisMap = this.map;
        const sb: string[] = [];
        thisMap.forEach((value, key) => {
            sb.push(`${key} => ${value}`);
        });
        return sb.join(', ');
    }
}

export default ByteMap; 