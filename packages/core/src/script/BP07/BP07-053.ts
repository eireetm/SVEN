// BP07-053 Valdain, Cursed Shadow (Evolved) — 5/5.
// On Evolve - Choose one of the following. (1) Select an enemy follower on the field. Deal it 4
// damage, search your deck for a Shadow's Corrosion and put it into your EX area, then shuffle your
// deck. (2) Select a Shadow's Corrosion in your cemetery and play it for 0 play points.
// Rulings: (1) can't be chosen without an enemy follower; (2) must then be chosen if there is a
// Corrosion in the cemetery, which is selected even if it can't be played (no target) — then
// nothing happens; if neither can be chosen, nothing happens. Played, it goes into the EX area
// (its own text) instead of the cemetery.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, named } from "../targets";
import { playSelectedForZero, spellInYourCemetery } from "./shared";

const CORROSION = "Shadow's Corrosion";

export default defineCard({
  abilities: [
    onEvolve({
      modes: [
        {
          id: "damage",
          label: "(1) 4 damage to an enemy follower; a Shadow's Corrosion from your deck into your EX area",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 4);
            yield* fx.search((id) => named(CORROSION)(fx.game, id), { to: "ex" });
          },
        },
        {
          id: "play",
          label: "(2) Play a Shadow's Corrosion from your cemetery for 0",
          targets: [spellInYourCemetery(named(CORROSION))],
          *resolve(fx) {
            yield* playSelectedForZero(fx, fx.targets[0]![0]);
          },
        },
      ],
    }),
  ],
});
