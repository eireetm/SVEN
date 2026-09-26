// BP12-062 Phoenix Howl — Dragoncraft spell, 1. 不死鳥・星神.
// Choose up to 2. (1) Select an enemy follower on the field and deal it 2 damage. (2) {[costX]},
// {[costX]}: Search your deck for up to X cards named Star Phoenix, give them Rush, then shuffle. X
// equals a number of your choice.
// (The English text leaves out "summon them"; the Japanese and Chinese texts put them onto the field.
// X = 1 pays 2 play points in all; X may be 0, and then there is no search — rulings. The play points
// are an optional process of the option, CR 10.4.7.5.)
import type { CustomCost } from "../types";
import { defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";

/** "{[costX]}, {[costX]}": choose X, pay 2X play points. */
const payXTwice: CustomCost = {
  canPay: () => true,
  *pay(fx) {
    const most = Math.floor(fx.game.state.players[fx.controller].playPoints / 2);
    const options = Array.from({ length: most + 1 }, (_, x) => ({ id: String(x), label: `X = ${x} (pay ${2 * x})` }));
    const [x] = yield* fx.choose(options);
    fx.memory.x = Number(x);
    yield* fx.payPlayPoints(2 * Number(x));
  },
};

export default defineCard({
  abilities: [
    spell({
      modeCount: () => 2,
      modes: [
        {
          id: "damage",
          label: "(1) 2 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
        {
          id: "phoenix",
          label: "(2) Pay X twice: summon up to X Star Phoenixes with Rush",
          cost: payXTwice,
          *resolve(fx) {
            const x = Number(fx.memory.x ?? 0);
            if (x <= 0) return;
            const found = yield* fx.search((id) => named("Star Phoenix")(fx.game, id), { max: x, to: "field" });
            for (const id of found) {
              if (fx.game.card(id)?.zone === "field") yield* fx.giveKeyword(id, "rush");
            }
          },
        },
      ],
    }),
  ],
});
