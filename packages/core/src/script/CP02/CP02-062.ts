// CP02-062 Unbound Emotion — Dragoncraft spell, 2. デレマス・パッション.
// This card costs 1 more to play for every follower on the field.
// ----------
// Deal 7 damage to each follower on the field.
// (Rulings: both players' followers count and take damage; an effect setting its cost to 0 applies first, then +X — CR
// 10.10.2.4.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  playCost: (g, _self, c) => g.followers(c).length + g.followers(g.opponent(c)).length,
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.dealDamageEach([...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))], 7);
      },
    }),
  ],
});
