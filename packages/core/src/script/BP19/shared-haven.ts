// Shared pieces of BP19 Havencraft card scripts (not a card: the file name has no set prefix).
import type { FieldPassives, PlayOption } from "../types";
import { buryFromYourField, engageYourCards } from "../costs";
import { activated, atStartOfYourEndPhase, lastWords } from "../helpers";
import { costAtMost, isAmulet, named } from "../targets";
import { ERRALDE, HOLY_TIGER } from "./shared";

/**
 * BP19-098 / 100 / 102 "When playing this, engage an Erralde, Troth Convict on your field: This costs 0 to play."
 * (CR 10.4.7.3; a reserved one, 10.4.6; "costs 0" is set before other changes, 10.10.2.4.)
 */
export const erraldeOption: PlayOption = {
  id: "erralde",
  label: "Engage an Erralde, Troth Convict on your field: costs 0",
  ...engageYourCards(named(ERRALDE)),
  setCost: 0,
};

/** BP19-100 / 101 "At the start of your end phase, give your leader {[defense]}+1." */
export const agentEndPhase = atStartOfYourEndPhase({
  *resolve(fx) {
    yield* fx.giveLeaderDefense(fx.controller, 1);
  },
});

/** BP19-096 / 097 "{[lastwords]} You may summon a 1-cost or less amulet from your hand." (元のコスト.) */
export const wingsLastWords = lastWords({
  *resolve(fx) {
    const amulets = fx.game.cards(fx.controller, "hand").filter((id) => isAmulet(fx.game, id) && costAtMost(1)(fx.game, id));
    const chosen = yield* fx.chooseCards(amulets, 0, 1);
    if (chosen.length > 0) yield* fx.putOntoField(chosen);
  },
});

/** BP19-104 / 105 "Each Holy Tiger on your field has Ward." */
export const holyTigersHaveWard: FieldPassives = {
  // keywordsFor: namesOf (not info) for the other cards.
  keywordsFor: (g, self, card) => {
    const c = g.card(card);
    if (c?.zone !== "field" || c.controller !== g.card(self)!.controller) return [];
    return g.namesOf(card).includes(HOLY_TIGER) ? ["ward"] : [];
  },
};

/** BP19-104 / 105 "Activate Bury an amulet: Give this Storm." (An amulet on your field, CR 10.4.3.) */
export const tigerStorm = activated(
  { custom: buryFromYourField(isAmulet) },
  {
    *resolve(fx) {
      if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
    },
  },
);
