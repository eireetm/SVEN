// Shared pieces of BP20 Havencraft card scripts (not a card: the file name has no set prefix).
import { crestsInEx } from "../helpers";
import type { GameReader } from "../../engine/query";
import type { PlayerId } from "../../model/ids";

/** "If there are at least 3 crests in your EX area" (BP20-093, 100, 101, 103, T07–T10). */
export const threeCrests = (g: GameReader, p: PlayerId): boolean => crestsInEx(g, p) >= 3;
