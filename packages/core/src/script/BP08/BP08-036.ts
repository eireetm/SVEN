// BP08-036 Sweet-Tooth Medusa (Evolved) — Runecraft follower, 4/5. 魔法使い・ゴルゴーン.
// On Evolve - Select up to 2 enemy followers on the field and deal 5 damage divided between them.
// During your turn, whenever an enemy follower is put from the field into the cemetery, summon a
// Serpent token.
// {[q]}Activate Bury 2 cards named Serpent: The next card you play this turn costs 2 less.
// (Serpents on your field, CR 10.4.3. Played twice before you play a card, the next card costs 4
// less — ruling.)
import { buryFromYourField } from "../costs";
import { activated, defineCard, onEvolve } from "../helpers";
import { and, enemyFollower, isFollower, named } from "../targets";
import { medusaSerpent } from "./shared";

export default defineCard({
  nextPlay: { medusa: () => true },
  abilities: [
    onEvolve({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0]!, 5);
      },
    }),
    medusaSerpent,
    activated(
      { custom: buryFromYourField(and(isFollower, named("Serpent")), 2) },
      {
        quick: true,
        *resolve(fx) {
          yield* fx.nextPlayCostsLess("medusa", 2);
        },
      },
    ),
  ],
});
