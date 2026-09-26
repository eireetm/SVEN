// BP13-036 Anne, Mysterian Imperatrix — Runecraft follower, 2, 2/2. 魔法使い・学院・プリンセス・キラー.
// {[fanfare]} Discard an Academic card: Draw a card. If there are at least 5 Academic cards in your
// cemetery, put an Anne's Summoning token into your EX Area.
// Activate {[engage]}: You may play a Rending Blast from your evolve deck. Activate only if there are at
// least 15 Academic cards in your cemetery. (Its cost is paid — ruling; only a facedown one is in the
// evolve deck, CR 4.6.3.)
import { activated, defineCard, fanfare, playFromEvolveDeck } from "../helpers";
import { discardA } from "../costs";
import { named } from "../targets";
import { academic, countIn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(academic),
      *resolve(fx) {
        yield* fx.draw(1);
        if (countIn(fx.game, fx.controller, "cemetery", academic) >= 5) yield* fx.tokensToEx(["Anne's Summoning"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => countIn(g, c, "cemetery", academic) >= 15,
        *resolve(fx) {
          yield* playFromEvolveDeck(fx, named("Rending Blast"));
        },
      },
    ),
  ],
});
