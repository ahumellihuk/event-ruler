import { ByteMachine } from "./ByteMachine";
import ByteMap from "./ByteMap";
import { ByteMatch } from "./ByteMatch";
import { ByteTransition } from "./ByteTransition";
import { CompositeByteTransition } from "./CompositeByteTransition";
import { ShortcutTransition } from "./ShortcutTransition";
import { SingleByteTransition } from "./SingleByteTransition";


export class ByteState extends SingleByteTransition {
    private transitionStore: any = null;
    private hasIndeterminatePrefix = false;

    getNextByteState(): ByteState {
        return this;
    }

    setNextByteState(nextState: ByteState): SingleByteTransition {
        return nextState;
    }

    getMatch(): ByteMatch | null {
        return null;
    }

    setMatch(match: ByteMatch | null): SingleByteTransition {
        return match === null ? this : new CompositeByteTransition(this, match);
    }

    getShortcuts(): Set<ShortcutTransition> {
        return new Set();
    }

    hasNoTransitions(): boolean {
        return this.transitionStore === null;
    }

    getTransition(utf8byte: number): ByteTransition | null {
        const transitionStore = this.transitionStore;
        if (transitionStore === null) {
            return null;
        } else if (transitionStore instanceof SingleByteTransitionEntry) {
            const entry = transitionStore as SingleByteTransitionEntry;
            return utf8byte === entry.utf8byte ? entry.transition : null;
        }
        const map = transitionStore as ByteMap;
        return map.getTransition(utf8byte);
    }

    getTransitionForAllBytes(): ByteTransition | null {
        const transitionStore = this.transitionStore;
        if (transitionStore === null || transitionStore instanceof SingleByteTransitionEntry) {
            return ByteMachine.EmptyByteTransition.INSTANCE;
        }
        const map = transitionStore as ByteMap;
        return map.getTransitionForAllBytes();
    }

    getTransitions(): Iterable<ByteTransition> {
        const transitionStore = this.transitionStore;
        if (transitionStore === null) {
            return new Set();
        } else if (transitionStore instanceof SingleByteTransitionEntry) {
            const entry = transitionStore as SingleByteTransitionEntry;
            return entry.transition;
        }
        const map = transitionStore as ByteMap;
        return map.getTransitions();
    }

    putTransition(utf8byte: number, transition: SingleByteTransition): void {
        const transitionStore = this.transitionStore;
        if (transitionStore === null) {
            this.transitionStore = new SingleByteTransitionEntry(utf8byte, transition);
        } else if (transitionStore instanceof SingleByteTransitionEntry) {
            const entry = transitionStore as SingleByteTransitionEntry;
            if (utf8byte === entry.utf8byte) {
                entry.transition = transition;
            } else {
                const map = new ByteMap();
                map.putTransition(entry.utf8byte, entry.transition);
                map.putTransition(utf8byte, transition);
                this.transitionStore = map;
            }
        } else {
            const map = transitionStore as ByteMap;
            map.putTransition(utf8byte, transition);
        }
    }

    putTransitionForAllBytes(transition: SingleByteTransition): void {
        const map = new ByteMap();
        map.putTransitionForAllBytes(transition);
        this.transitionStore = map;
    }

    addTransition(utf8byte: number, transition: SingleByteTransition): void {
        const transitionStore = this.transitionStore;
        if (transitionStore === null) {
            this.transitionStore = new SingleByteTransitionEntry(utf8byte, transition);
        } else if (transitionStore instanceof SingleByteTransitionEntry) {
            const entry = transitionStore as SingleByteTransitionEntry;
            const map = new ByteMap();
            map.addTransition(entry.utf8byte, entry.transition);
            map.addTransition(utf8byte, transition);
            this.transitionStore = map;
        } else {
            const map = transitionStore as ByteMap;
            map.addTransition(utf8byte, transition);
        }
    }

    addTransitionForAllBytes(transition: SingleByteTransition): void {
        const transitionStore = this.transitionStore;
        let map: ByteMap;
        if (transitionStore instanceof ByteMap) {
            map = transitionStore as ByteMap;
        } else {
            map = new ByteMap();
        }
        if (transitionStore instanceof SingleByteTransitionEntry) {
            const entry = transitionStore as SingleByteTransitionEntry;
            map.addTransition(entry.utf8byte, entry.transition);
        }
        map.addTransitionForAllBytes(transition);
        this.transitionStore = map;
    }

    removeTransition(utf8byte: number, transition: SingleByteTransition): void {
        const transitionStore = this.transitionStore;
        if (transitionStore === null) {
            return;
        }

        if (transitionStore instanceof SingleByteTransitionEntry) {
            const entry = transitionStore as SingleByteTransitionEntry;
            if (utf8byte === entry.utf8byte && transition.equals(entry.transition)) {
                this.transitionStore = null;
            }
        } else {
            const map = transitionStore as ByteMap;
            map.removeTransition(utf8byte, transition);
            if (map.isEmpty()) {
                this.transitionStore = null;
            }
        }
    }

    removeTransitionForAllBytes(transition: SingleByteTransition): void {
        const transitionStore = this.transitionStore;
        if (transitionStore === null) {
            return;
        }

        if (transitionStore instanceof SingleByteTransitionEntry) {
            const entry = transitionStore as SingleByteTransitionEntry;
            if (transition.equals(entry.transition)) {
                this.transitionStore = null;
            }
        } else {
            const map = transitionStore as ByteMap;
            map.removeTransitionForAllBytes(transition);
            if (map.isEmpty()) {
                this.transitionStore = null;
            }
        }
    }

    hasIndeterminatePrefix(): boolean {
        return this.hasIndeterminatePrefix;
    }

    setIndeterminatePrefix(hasIndeterminatePrefix: boolean): void {
        this.hasIndeterminatePrefix = hasIndeterminatePrefix;
    }

    hasOnlySelfReferentialTransition(): boolean {
        // Implement the logic to check for self-referential transitions
        return false; // Placeholder
    }

    getCeilings(): Set<number> {
        // Implement the logic to get ceiling values
        return new Set(); // Placeholder
    }

    toString(): string {
        // Implement the logic for string representation
        return ''; // Placeholder
    }

    private static SingleByteTransitionEntry = class {
        utf8byte: number;
        transition: SingleByteTransition;

        constructor(utf8byte: number, transition: SingleByteTransition) {
            this.utf8byte = utf8byte;
            this.transition = transition;
        }

        toString(): string {
            // Implement the logic for string representation
            return ''; // Placeholder
        }
    }
} 