// BP02-037 Sun Oracle Pascale — Runecraft follower, 4, 3/5.
// {[fanfare]} Summon a Magic Sediment token.
// {[q]}{[act]}{[engage]}, Earth Rite: Select an enemy follower on the field and give it
// {[attack]}-2/{[defense]}-2.
// {[q]}{[act]}{[engage]}, Earth Rite: Select another follower on your field and give it
// {[attack]}+2/{[defense]}+2.
// ({[q]}: activatable at Quick timing, CR 12.3.3 — rulings; Earth Rite, CR 13.3.3.)
import { activated, defineCard, fanfare } from "../helpers";
import { anotherYourFollower, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        quick: true,
        earthRite: { mode: "required" },
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, -2, -2);
        },
      },
    ),
    activated(
      { engageSelf: true },
      {
        quick: true,
        earthRite: { mode: "required" },
        targets: [anotherYourFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 2, 2);
        },
      },
    ),
  ],
});
