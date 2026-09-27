// Shared pieces of DSD01b card scripts (not a card: the file name has no set prefix).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { Keyword } from "../../model/keyword";
import { lastWords } from "../helpers";
import { named } from "../targets";
import { draconicDuelist } from "../BP19/shared";

export { draconicDuelist };

/** The DSD01b-T01 amulet token (遺されし電撃). */
export const AFTERSHOCK = "Aftershock";
/** Its lightning counters (雷カウンター). */
export const LIGHTNING = "lightning";

/** "Draconic Duelist cards on your field" — Aftershock is one too (rulings). */
export const duelistCardsOnYourField = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "field").filter((id) => draconicDuelist(g, id)).length;

/**
 * "While there is another Draconic Duelist card on your field, this has [keywords]" (DSD01b-012, 016): a passive that comes and
 * goes; an attack already declared goes on without it (rulings). Part of computing keywords, so it reads traits with
 * `typeAndTraits`.
 */
export const withAnotherDuelist =
  (keywords: readonly Keyword[]) =>
  (g: GameReader, self: CardId): readonly Keyword[] => {
    if (g.card(self)?.zone !== "field") return [];
    const other = g.cards(g.controller(self), "field").some((id) => id !== self && g.typeAndTraits(id).traits.includes("武闘竜人"));
    return other ? keywords : [];
  };

/**
 * DSD01b-001 / 002 Romaronia: "{[lastwords]} If there is an Aftershock on your field, place a lightning counter on each Aftershock on
 * your field. If there is no Aftershock on your field, summon an Aftershock." Checked when it resolves, in the text's order: a
 * summoned one gets no counter, and a second Last Words then adds counters (rulings).
 */
export const romaroniaLastWords = lastWords({
  *resolve(fx) {
    const shocks = fx.game.cards(fx.controller, "field").filter((id) => named(AFTERSHOCK)(fx.game, id));
    if (shocks.length === 0) {
      yield* fx.summon([AFTERSHOCK]);
      return;
    }
    for (const id of shocks) yield* fx.addCounters(id, LIGHTNING, 1);
  },
});
