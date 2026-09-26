// BP12-054 Jerva, Wyrm Transcendent — Dragoncraft follower, 9, 6/6. 竜使い.
// When this card is discarded, you may put it into your EX area.
// ----------
// Ward.
// {[fanfare]} Deal 6 damage to each other follower on the field and each enemy leader.
// {[act]} {[cost03]}, bury this card from your EX area: Select an enemy follower on the field and deal it
// 6 damage. Activate only if Overflow is active for you. (Valid in the EX area — ruling, CR 10.3.5.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { discardedToEx } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    discardedToEx,
    fanfare({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        const others = [...fx.game.followers(fx.controller), ...fx.game.followers(opponent)].filter((id) => id !== fx.self);
        yield* fx.dealDamageEach([...others, fx.game.leader(opponent)], 6);
      },
    }),
    activated(
      { playPoints: 3, burySelf: true },
      {
        validIn: ["ex"],
        condition: (g, c) => g.overflow(c),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 6);
        },
      },
    ),
  ],
});
