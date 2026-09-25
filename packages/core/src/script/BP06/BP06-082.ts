// BP06-082 Cougar Pelt Warrior (Evolved) — Abysscraft follower, 4/3. 獣.
// On Evolve - Search your deck for a Cougar Pelt Warrior, put it onto your field engaged, then
// shuffle your deck. (Shuffled even without one — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named("Cougar Pelt Warrior")(fx.game, id), { to: "field", engaged: true });
      },
    }),
  ],
});
