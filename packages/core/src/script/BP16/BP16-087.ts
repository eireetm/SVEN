// BP16-087 Vlad, Impaler — Abysscraft follower, 7, 4/4. 吸血鬼・キラー.
// {[evolve]} {[cost01]}: Evolve this.
// Storm.
// {[fanfare]} Deal 3 damage to each enemy follower on the field.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 3);
      },
    }),
  ],
});
