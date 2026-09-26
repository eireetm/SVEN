// BP15-084 Adherent of Desire — Abysscraft follower, 1, 1/1. 絶傑・魔界.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Deal 1 damage to your leader. If there's a follower on your field with "Valnareik" in its name,
// evolve this. (Not an evolve ability — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { valnareikOnField } from "./shared-abyss";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
        if (valnareikOnField(fx.game, fx.controller) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
