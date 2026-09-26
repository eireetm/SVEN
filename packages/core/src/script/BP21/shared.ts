// Shared pieces of BP21 card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { hasTrait, isFollower, isToken } from "../targets";

/** Traits used by several BP21 cards (日文种族). */
export const academic = hasTrait("学院");
export const beast = hasTrait("獣");
export const puppetry = hasTrait("人形");
export const pixie = hasTrait("妖精");
export const levin = hasTrait("レヴィオン");
export const officer = hasTrait("兵士");
export const alchemist = hasTrait("錬金術師");
export const earthSigil = hasTrait("土の印");
export const dragonewt = hasTrait("ドラゴニュート");

export const FAIRY = "Fairy";
export const PASSION = "passion";

/** "an Academic or Beast follower" (BP21-001, 005, 006, 008, 010, 011, T02). */
export const academicOrBeastFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && (academic(g, id) || beast(g, id));

/** "a Pixie token follower" (BP21-007, 012, 018). */
export const pixieTokenFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && isToken(g, id) && pixie(g, id);

/** "Pixie cards in your EX area" (BP21-004). */
export const pixiesInEx = (g: GameReader, p: PlayerId): number => g.cards(p, "ex").filter((id) => pixie(g, id)).length;

/** "an Academic follower" (BP21-019, 020, 021, 024, 025, 030). */
export const academicFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && academic(g, id);

/** "Levin cards in your cemetery" (BP21-022, 034). */
export const levinsInCemetery = (g: GameReader, p: PlayerId): number => g.cards(p, "cemetery").filter((id) => levin(g, id)).length;

/** "Academic cards in your cemetery" (BP21-037, 039, 042). */
export const academicsInCemetery = (g: GameReader, p: PlayerId): number => g.cards(p, "cemetery").filter((id) => academic(g, id)).length;

/** "an Alchemist follower that costs at least 3 on your field" (BP21-T04, T05; 元のコスト, CR 5.16.1.2 when evolved). */
export const bigAlchemistOnYourField = (g: GameReader, p: PlayerId): boolean =>
  g.followers(p).some((id) => alchemist(g, id) && (g.info(id).cost ?? 0) >= 3);

/**
 * "a card in your EX area with at least N passion counters" (BP21-057, 060, 061, 063, 065, 069): the most passion counters
 * on one card in your EX area.
 */
export const passionInEx = (g: GameReader, p: PlayerId): number => Math.max(0, ...g.cards(p, "ex").map((id) => g.counters(id, PASSION)));
