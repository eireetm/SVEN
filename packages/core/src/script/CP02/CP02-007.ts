// CP02-007 Brand New Beat — Forestcraft amulet, 1. デレマス・クール.
// When this card leaves the field, if a Magical Item was banished from your EX area this turn, draw a card.
// Activate {[engage]}, bury this card: Select a follower on your field and give it {[attack]}+1/{[defense]}+1.
// (Rulings: playing a Magical Item as a spell does not banish it; without a follower to select the ability can't be
// activated, CR 10.6.2.3.3.)
import { activated, defineCard, whenThisLeavesField } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    whenThisLeavesField({
      condition: (g, c) => g.magicalItemsBanishedThisTurn(c) > 0,
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [yourFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        },
      },
    ),
  ],
});
