// BP08-096 Manifestation of Repose — Havencraft spell, 2. 絶傑・狂信.
// Costs 2 less with Marwynn, Omen of Repose on your field. Select your follower, give it +2
// defense, and draw. Aura only protects from opponents (rulings; CR 10.4.4.1, 12.15.2).
import { defineCard, spell } from "../helpers";
import { named, yourFollower } from "../targets";

export default defineCard({
  playCost: (g, _self, p) =>
    g.cards(p, "field").some((id) => named("Marwynn, Omen of Repose")(g, id)) ? -2 : 0,
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 0, 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
