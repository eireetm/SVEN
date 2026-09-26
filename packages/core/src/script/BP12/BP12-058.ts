// BP12-058 Cursed Furor — Dragoncraft spell, 2. 自然・ドラゴニュート・キラー.
// While Overflow is active for you, this card has {[quick]}
// ----------
// Select an enemy follower on the field. Deal it 4 damage and summon a Naterran Great Tree token. (Not
// playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { TREE } from "./shared";

export default defineCard({
  selfKeywords: (g, self) => (g.overflow(g.controller(self)) ? ["quick"] : []),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.summon([TREE]);
      },
    }),
  ],
});
