// CP04-054 Dark Eclipse — Runecraft spell, 2. プリコネ・美食殿.
// When this is discarded, select an enemy follower on the field and deal it 1 damage. (Also discarded for the hand limit in the end
// phase — ruling.)
// Select a PriConne follower on your field and give it {[attack]}+3, Rush and Assail.
import { defineCard, spell, whenDiscarded } from "../helpers";
import { enemyFollower, yourFollower } from "../targets";
import { priconne } from "./shared";

export default defineCard({
  abilities: [
    whenDiscarded({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
    spell({
      targets: [yourFollower({ filter: priconne })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 3, 0);
        yield* fx.giveKeyword(target, "rush");
        yield* fx.giveKeyword(target, "assail");
      },
    }),
  ],
});
