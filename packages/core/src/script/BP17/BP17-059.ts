// BP17-059 Djeana, the Stouthearted — Dragoncraft follower, 2, 2/2. 自然・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Summon a Naterran Great Tree token.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { TREE } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([TREE]);
      },
    }),
  ],
});
