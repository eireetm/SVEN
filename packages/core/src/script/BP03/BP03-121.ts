// BP03-121 Eggsplosion — Neutral spell, 3. 童話.
// Deal X to each follower and each enemy leader. X equals 1 plus cards named Eggsplosion or
// Humpty Dumpty in your cemetery. This spell is in the resolution zone, so it does not count.
import { defineCard, spell } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const names = fx.game.cards(fx.controller, "cemetery").filter(
          (id) => named("Eggsplosion")(fx.game, id) || named("Humpty Dumpty")(fx.game, id),
        ).length;
        const x = names + 1;
        const followers = [...fx.game.followers(fx.controller), ...fx.game.followers(fx.game.opponent(fx.controller))];
        yield* fx.dealDamages([
          ...followers.map((target) => ({ target, amount: x })),
          { target: fx.game.leader(fx.game.opponent(fx.controller)), amount: x },
        ]);
      },
    }),
  ],
});
