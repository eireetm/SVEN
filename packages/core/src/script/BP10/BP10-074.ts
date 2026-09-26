// BP10-074 VI. Milteo, The Lovers — Abysscraft follower, 5, 4/4. アルカナ・魔界.
// {[fanfare]} Discard a card: Reveal cards from the top of your deck until you reveal 2 followers that
// cost 3 or less. Summon them. Shuffle the rest and put them on the bottom of your deck. (元のコスト.
// With room for one, one of them is summoned and the other goes back with the rest; with only one
// found it is summoned; with none, the revealed cards go back — rulings.)
// At the start of your end phase, Necrocharge (20) - Evolve this follower. (Not an evolve ability, so
// not limited to once per turn — ruling.)
import type { CardId } from "../../model/ids";
import { discardCardsCost } from "../costs";
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";

const cheapFollower = and(isFollower, costAtMost(3));

export default defineCard({
  abilities: [
    fanfare({
      cost: discardCardsCost(1),
      *resolve(fx) {
        const revealed: CardId[] = [];
        const found: CardId[] = [];
        for (const id of fx.game.cards(fx.controller, "deck")) {
          revealed.push(id);
          if (cheapFollower(fx.game, id)) found.push(id);
          if (found.length === 2) break;
        }
        yield* fx.reveal(revealed);
        yield* fx.putOntoField(found);
        yield* fx.shuffleToBottom(revealed.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, p) => g.necrocharge(p, 20),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
