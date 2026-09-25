// BP06-113 Colosseum on High — Neutral amulet, 6. 挑戦者.
// {[fanfare]} Each player looks at the top 3 cards of their deck. They may summon a follower from
// among them. They bury the rest. (The active player chooses first, then the other; then both bury
// — ruling, CR 1.3.4.)
// While this card is on the field, if a follower on the field can attack a follower, it can't
// attack leaders. (Not attacking is fine — ruling.)
import { defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  field: { followersBeforeLeaders: true },
  abilities: [
    fanfare({
      *resolve(fx) {
        const active = fx.game.activePlayer;
        const order = [active, fx.game.opponent(active)];
        const tops = order.map((p) => fx.topCards(3, p));
        for (const [i, p] of order.entries()) {
          const top = tops[i]!;
          const chosen = yield* fx.selectCards(top.filter((id) => isFollower(fx.game, id)), 0, 1, p, top);
          yield* fx.putOntoField(chosen, p);
        }
        yield* fx.bury(tops.flat().filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
