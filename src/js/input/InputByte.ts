import { InputCharacter } from "./InputCharacter";
import { InputCharacterType } from "./InputCharacterType";

/**
 * An InputCharacter that represents a single byte.
 */
export class InputByte extends InputCharacter {

    private readonly b: number;

    constructor(b: number) {
        super();
        this.b = b;
    }

    static cast(character: InputCharacter): InputByte {
        return character as InputByte;
    }

    getByte(): number {
        return this.b;
    }

    getType(): InputCharacterType {
        return InputCharacterType.BYTE;
    }

    equals(o: any): boolean {
        return o != null && o.constructor === this.constructor && (o as InputByte).getByte() === this.getByte();
    }

    hashCode(): number {
        return this.b;
    }

    toString(): string {
        return new TextDecoder().decode(new Uint8Array([this.getByte()]));
    }
} 