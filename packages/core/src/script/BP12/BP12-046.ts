// BP12-046 Gigahand Golem — Runecraft follower, 2, 3/2. ゴーレム.
// {[evolve]} {[cost05]}: Evolve this follower.
// {[fanfare]} Summon a Magic Sediment token.
// Activate, Earth Rite: Select another Golem follower on your field and give it {[attack]}+1/{[defense]}+1.
// Activate only once per turn.
import { activated, defineCard, evolveAbility, fanfare } from "../helpers";
import { anotherYourFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(5),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
      },
    }),
    activated(
      {},
      {
        earthRite: { mode: "required" },
        oncePerTurn: true,
        targets: [anotherYourFollower({ filter: hasTrait("ゴーレム") })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        },
      },
    ),
  ],
});
