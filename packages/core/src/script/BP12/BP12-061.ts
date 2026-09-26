// BP12-061 Petalspine Stegosaurus — Dragoncraft follower, 5, 5/5. 自然・竜族.
// {[fanfare]} Discard 2 cards: Draw 2 cards.
// Activate {[engage]}: Select an enemy follower on the field and deal it 5 damage. Activate only if there
// are at least 5 Natura cards in your cemetery.
// {[lastwords]} Summon a Naterran Great Tree token.
import { activated, defineCard, fanfare } from "../helpers";
import { discardCardsCost } from "../costs";
import { enemyFollower } from "../targets";
import { countIn, natura, summonTreeLastWords } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardCardsCost(2),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => countIn(g, c, "cemetery", natura) >= 5,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      },
    ),
    summonTreeLastWords,
  ],
});
