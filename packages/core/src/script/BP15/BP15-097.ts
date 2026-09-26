// BP15-097 Sarissa, Luxflash Spear — Havencraft follower, 2, 2/2. 先導・獣.
// Ward.
// While there are at least 3 cards on your field, this has Storm. (This one counts; a declared attack goes on
// without it — rulings.)
// {[fanfare]} Select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  selfKeywords: (g, self) => (g.cards(g.controller(self), "field").length >= 3 ? ["storm"] : []),
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -1, -1);
      },
    }),
  ],
});
