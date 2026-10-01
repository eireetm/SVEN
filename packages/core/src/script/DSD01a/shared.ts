// Shared pieces of DSD01a card scripts (not a card: the file name has no set prefix).
import type { CardId } from "../../model/ids";
import type { EffectContext } from "../../engine/effects/context";

export { academic, academicsInCemetery } from "../BP21/shared";

/** The DSD01a-T01 token spell. Its data has only the Japanese name, which is its card name. */
export const MAGIC_BULLET = "マナリアの魔弾";
/** Grea's Ember (DSD01a-009 = BP21-PR10): only the Japanese name, which is its card name. */
export const GREAS_EMBER = "グレアの炎熱";
export const ANNES_SORCERY = "Anne's Sorcery";

/** "its leader": the leader of the selected follower's controller (the opponent's, if it has left the field). */
export const leaderOf = (fx: EffectContext, follower: CardId): CardId =>
  fx.game.leader(fx.game.card(follower)?.zone === "field" ? fx.game.controller(follower) : fx.game.opponent(fx.controller));
