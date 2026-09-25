// BP09-049 Onion Patch — Runecraft follower, 1, 1/1. 魔法生物.
// Rush.
// While there are at least 5 cards named Onion Patch in your cemetery, this follower has Storm and
// "Strike - Select an enemy follower on the field and deal it 1 damage." (A passive ability — ruling:
// the Strike ability exists, and so triggers, only while the condition holds.)
// ----------
// You can put up to 50 of this card into your deck. (CR 6.1.2; main deck only — it is not an evolved
// card — ruling.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { ONION } from "./shared";

/** Only the cards' definitions are read (also used by keywordsFor). */
const fiveOnions = (g: GameReader, p: PlayerId) =>
  g.cards(p, "cemetery").filter((id) => g.db.get(g.card(id)!.def).name === ONION).length >= 5;

const onionStrike = strike({
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.dealDamage(fx.targets[0]![0]!, 1);
  },
});

export default defineCard({
  keywords: ["rush"],
  deckLimit: 50,
  field: { keywordsFor: (g, self, card) => (card === self && fiveOnions(g, g.card(self)!.controller) ? ["storm"] : []) },
  abilities: [{ ...onionStrike, trigger: (e, me, g) => fiveOnions(g, me.controller) && onionStrike.trigger(e, me, g) }],
});
