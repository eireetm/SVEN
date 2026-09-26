// Shared pieces of BP15 Abysscraft card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { Keyword } from "../../model/keyword";
import { and, hasTrait, isFollower, nameIncludes } from "../targets";
import { demon, omen } from "./shared";

type Filter = (g: GameReader, id: CardId) => boolean;

export const ONE_TAILED_FOX = "One-Tailed Fox";
export const ECHOING_SCREAM = "Rulenye, Echoing Scream";

/** "While Sanguine is active for you, this has Storm" (BP15-076, 077; CR 13.5.2.2). */
export const sanguineStorm = (g: GameReader, self: CardId): readonly Keyword[] => (g.sanguine(g.controller(self)) ? ["storm"] : []);

/** "a follower on your field with "Valnareik" in its name" (BP15-084, 086). */
export const valnareikFollower: Filter = and(isFollower, nameIncludes("Valnareik"));
export const valnareikOnField = (g: GameReader, p: PlayerId): boolean => g.followers(p).some((id) => valnareikFollower(g, id));

/** "a card with both the Omen and Demon traits" (BP15-085, 086). */
export const omenDemon: Filter = and(omen, demon);

/** "Necromancer" (死霊術師). */
export const necromancer = hasTrait("死霊術師");

/** "a 2-cost card" — 元のコスト 2 (BP15-080, 081, 087). */
export const costs2: Filter = (g, id) => g.info(id).cost === 2;
