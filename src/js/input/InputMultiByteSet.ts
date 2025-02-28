import { InputCharacter } from "./InputCharacter";
import { InputCharacterType } from "./InputCharacterType";
import { MultiByte } from "./MultiByte";

/**
 * An InputCharacter that represents a set of MultiBytes.
 */
export class InputMultiByteSet extends InputCharacter {

    private readonly multiBytes: Set<MultiByte>;

    constructor(multiBytes: Set<MultiByte>) {
        super();
        this.multiBytes = new Set(multiBytes);
    }

    static cast(character: InputCharacter): InputMultiByteSet {
        return character as InputMultiByteSet;
    }

    getMultiBytes(): Set<MultiByte> {
        return this.multiBytes;
    }

    getType(): InputCharacterType {
        return InputCharacterType.MULTI_BYTE_SET;
    }

    equals(o: any): boolean {
        if (o == null || !(o instanceof InputMultiByteSet)) {
            return false;
        }

        return o.getMultiBytes().size === this.getMultiBytes().size && [...o.getMultiBytes()].every(mb => this.getMultiBytes().has(mb));
    }

    hashCode(): number {
        return Array.from(this.getMultiBytes()).reduce((acc, mb) => acc + mb.hashCode(), 0);
    }

    toString(): string {
        return Array.from(this.getMultiBytes()).toString();
    }
} 