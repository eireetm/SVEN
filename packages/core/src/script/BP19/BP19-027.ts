// BP19-027 Prim, Princess's Picnic — Swordcraft follower, 2, 1/1. 指揮官・プリンセス.
// {[fanfare]} Search your deck for a Maid follower, reveal it, add it to your hand, then shuffle.
// {[act]} {[cost01]}, engage this: You may summon a Nonja, Silent Maid from your hand. If you do, give it Ward.
import { activated, defineCard, fanfare } from "../helpers";
import { isFollower, named } from "../targets";
import { maid } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isFollower(fx.game, id) && maid(fx.game, id));
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true },
      {
        *resolve(fx) {
          const nonjas = fx.game.cards(fx.controller, "hand").filter((id) => named("Nonja, Silent Maid")(fx.game, id));
          const chosen = yield* fx.chooseCards(nonjas, 0, Math.min(1, nonjas.length));
          for (const id of yield* fx.putOntoField(chosen)) yield* fx.giveKeyword(id, "ward");
        },
      },
    ),
  ],
});
