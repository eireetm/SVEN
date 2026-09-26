// BP17-T04 Quadra Magic — Runecraft spell token, 2. 魔法使い.
// Spellchain (5) - This costs 1 less to play. (CR 13.3.1.)
// ----------
// Select up to 2 enemy followers on the field and deal them 2 damage. Put an Elements of Creation token into your EX
// area. (With no enemy follower it still puts the token — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  playCost: (g, _self, p) => (g.spellchain(p, 5) ? -1 : 0),
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.targets[0] ?? [], 2);
        yield* fx.tokensToEx(["Elements of Creation"]);
      },
    }),
  ],
});
