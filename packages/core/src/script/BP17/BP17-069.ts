// BP17-069 Poisonous Dilophosaurus — Dragoncraft follower, 6, 5/5. 自然・竜族.
// Bane.
// {[fanfare]} Banish a Naterran Great Tree from your field: Select an enemy follower on the field and destroy it.
// {[lastwords]} Summon a Naterran Great Tree token.
import { banishFromYour } from "../costs";
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";
import { isTree, TREE } from "./shared";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    fanfare({
      cost: banishFromYour(["field"], isTree),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.summon([TREE]);
      },
    }),
  ],
});
