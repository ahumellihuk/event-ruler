import { InputCharacter } from "./InputCharacter";


/**
 * Transforms UTF-8 formatted bytes into InputCharacter
 *
 * @see InputCharacter
 *
 */
export interface ByteParser {

    /**
     * @param utf8byte byte that represent in UTF-8 encoding
     * @return processed and parsed Input Character
     */
    parse(utf8byte: number): InputCharacter;
} 