// BP12-047 Gigahand Golem (Evolved) — Runecraft follower, 6/5. ゴーレム.
// On Evolve - Summon a Guardform Golem token and a Strikeform Golem token. (The Chinese text says "or";
// the English and Japanese say "and".)
// Activate, Earth Rite: Select another Golem follower on your field and give it {[attack]}+2/{[defense]}+2.
// Activate only once per turn.
import { activated, defineCard, onEvolve } from "../helpers";
import { anotherYourFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Guardform Golem", "Strikeform Golem"]);
      },
    }),
    activated(
      {},
      {
        earthRite: { mode: "required" },
        oncePerTurn: true,
        targets: [anotherYourFollower({ filter: hasTrait("ゴーレム") })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 2, 2);
        },
      },
    ),
  ],
});
