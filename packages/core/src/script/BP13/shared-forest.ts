// BP13 Forestcraft abilities shared by a card and its evolved card (not a card).
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { AutomaticAbility } from "../types";
import { strike } from "../helpers";
import { and, enemyFollower, isClass, isSpell } from "../targets";

export const forestcraftSpell = and(isSpell, isClass("Forestcraft"));

/** "{[forestcraft]} spells with different names in your cemetery" (BP13-005 / 006). */
const forestcraftSpellNames = (g: GameReader, p: PlayerId): number =>
  new Set(g.cards(p, "cemetery").filter((id: CardId) => forestcraftSpell(g, id)).map((id) => g.db.get(g.card(id)!.def).name)).size;

/**
 * BP13-005 / 006 "Strike - Select an enemy follower on the field. If there are at least 5 {[forestcraft]}
 * spells with different names in your cemetery, give it -2/-2 and give this follower +2/+2."
 */
export const nelchaStrike: AutomaticAbility = strike({
  targets: [enemyFollower()],
  *resolve(fx) {
    if (forestcraftSpellNames(fx.game, fx.controller) < 5) return;
    yield* fx.giveStats(fx.targets[0]![0]!, -2, -2);
    if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
  },
});
