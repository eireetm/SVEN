// BP03-042 Milady, Mystic Queen — Runecraft follower, 4, 2/2. チェス.
// {[evolve]} {[cost01]}: Evolve.
// {[fanfare]} Summon a Magical Pawn. Put a Magical Pawn into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Magical Pawn"]);
        yield* fx.tokensToEx(["Magical Pawn"]);
      },
    }),
  ],
});
