// CP04-027 Tomo — Swordcraft follower, 2, 2/1. プリコネ・NIGHTMARE.
// {[evolve]} {[cost02]}: Evolve this.
// Storm.
// {[fanfare]} If there are at least 4 PriConne followers on your field, evolve this. (This one included; not its evolve ability —
// ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { priconne } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(2),
    fanfare({
      condition: (g, c) => g.followers(c).filter((id) => priconne(g, id)).length >= 4,
      *resolve(fx) {
        yield* fx.evolve(fx.self);
      },
    }),
  ],
});
