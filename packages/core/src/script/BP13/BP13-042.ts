// BP13-042 Grea, Scorching Fury — Runecraft follower, 2, 2/2. 魔法使い・学院・プリンセス・キラー.
// {[fanfare]} Discard an Academic card: Draw a card. If there are at least 5 Academic cards in your
// cemetery, put a Resentful Blaze token into your EX area.
// Activate {[engage]}: Select an enemy follower on the field and deal it 1 damage.
import { activated, defineCard, fanfare } from "../helpers";
import { discardA } from "../costs";
import { enemyFollower } from "../targets";
import { academic, countIn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(academic),
      *resolve(fx) {
        yield* fx.draw(1);
        if (countIn(fx.game, fx.controller, "cemetery", academic) >= 5) yield* fx.tokensToEx(["Resentful Blaze"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
