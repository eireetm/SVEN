// ECP01-018 Teio-Oo-Oo!!! — Swordcraft spell, 5. ウマ娘.
// Look at the top 7 cards of your deck. You may summon an Umamusume follower that costs 5 or less from among them. Put the rest
// on the bottom of your deck in any order. If you summoned a Tokai Teio, look at the top 7 cards of your deck. You may summon an
// Umamusume follower that costs 4 or less from among them. Put the rest on the bottom of your deck in any order. (元のコスト;
// 「それが『トウカイテイオー』なら」: the summoned follower.)
import { defineCard, spell } from "../helpers";
import { named } from "../targets";
import { maySummonUmamusumeFromTop } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const summoned = yield* maySummonUmamusumeFromTop(fx, 7, 5);
        if (summoned.some((id) => fx.game.card(id)?.zone === "field" && named("Tokai Teio")(fx.game, id))) {
          yield* maySummonUmamusumeFromTop(fx, 7, 4);
        }
      },
    }),
  ],
});
