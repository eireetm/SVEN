// Shared pieces of SD05 card scripts (not a card: the file name has no set prefix).
import { and, isToken, named } from "../targets";

export const BAT = "Forest Bat";
/** A Forest Bat token. */
export const forestBat = and(isToken, named(BAT));
