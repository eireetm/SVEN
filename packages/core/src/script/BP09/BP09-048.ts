// BP09-048 Beastfaced Mage — Runecraft follower, 1, 2/2. 魔法使い・獣.
// {[act]} {[engage]}, Earth Rite: Select an enemy follower on the field and deal it 2 damage.
// {[lastwords]} Summon a Magic Sediment token.
import { activated, defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        earthRite: { mode: "required" },
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
    ),
    lastWords({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
      },
    }),
  ],
});
