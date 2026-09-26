// BP15-023 Ralmia, Astrowing — Swordcraft follower, 2, 2/2. 兵士・超克.
// Storm.
// Strike - If there are 5 followers on your field, deal 2 damage to each enemy follower on the field.
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      condition: (g, p) => g.followers(p).length === 5,
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
