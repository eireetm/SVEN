// BP17-063 Forestclaw Sentinel — Dragoncraft follower, 3, 3/3. 自然・獣.
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
