// BP10-013 Reclusive Ponderer — Forestcraft follower, 4, 4/4. アルカナ・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Search your deck for an Arcana card, put it into your EX area, then shuffle.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { arcana } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => arcana(fx.game, id), { to: "ex" });
      },
    }),
  ],
});
