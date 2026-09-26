// BP21-081 Mach-Speed Maron — Abysscraft follower, 1, 2/2. 魔界・学院.
// {[evolve]} {[cost03]}: Evolve this.
// {[fanfare]} Roll a 6-sided die. If you rolled a 6 when rolling a die this turn, evolve this. (Any roll of 6 this turn,
// not only this one — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(3),
    fanfare({
      *resolve(fx) {
        yield* fx.rollDie();
        if (fx.game.diceRolledThisTurn(fx.controller).includes(6) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
