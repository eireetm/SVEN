// BP21-070 Augite Wyrm — Dragoncraft follower, 9, 5/5. 竜族.
// {[fanfare]} Deal 6 damage to each enemy follower on the field.
// {[act]} {[cost01]}, discard this: Draw a card. (Valid in the hand — ruling, CR 10.3.5.)
import { discardThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 6);
      },
    }),
    activated(
      { playPoints: 1, custom: discardThis },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
