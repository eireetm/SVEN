// BP22-118 〔全力疾走〕オグリキャップ (evolved) — Dragoncraft (Umamusume universe), 3/3. ウマ娘.
// 【疾走】
// 【進化時】相手の場のフォロワー1体を選ぶ。それに4ダメージ。
// 【超進化時】場の他のウマ娘・カードX枚をアクト：これは攻撃力+X/体力+Xする。
// (Storm. On Evolve - Select an enemy follower on the field and deal it 4 damage. On Super-Evolve - Engage X other Umamusume cards on
// your field (CR 10.4.3): give this +X/+X. Super-evolving triggers both, in either order (rulings).)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import type { CustomCost } from "../types";
import { umamusume } from "./shared";

/** "Engage X other Umamusume cards on your field" (reserved ones, CR 10.4.6): X is how many were engaged. */
const engageXUmamusume: CustomCost = {
  canPay: (g, c, self) => g.cards(c, "field").some((id) => id !== self && g.card(id)?.engaged === false && umamusume(g, id)),
  *pay(fx) {
    const g = fx.game;
    const reserved = g.cards(fx.controller, "field").filter((id) => id !== fx.self && g.card(id)?.engaged === false && umamusume(g, id));
    const chosen = yield* fx.chooseCards(reserved, 1, reserved.length);
    yield* fx.engage(chosen);
    fx.memory.x = chosen.length;
  },
};

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    onSuperEvolve({
      cost: engageXUmamusume,
      *resolve(fx) {
        const x = Number(fx.memory.x ?? 0);
        if (x > 0 && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, x, x);
      },
    }),
  ],
});
