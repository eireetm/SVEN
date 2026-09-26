// BP19-086 Vicious Blitzer — Abysscraft follower, 1, 1/1. 八獄・魔界.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Deal 1 damage to your leader. If there's a Garodeth, Insurgent Convict on your field, evolve this. (Not this
// turn's evolve ability — ruling, CR 8.3.2.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { garodethOnField } from "./shared-abyss";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
        if (garodethOnField(fx.game, fx.controller) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
