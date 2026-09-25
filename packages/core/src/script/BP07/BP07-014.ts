// BP07-014 Forest Hermit — Forestcraft follower, 1, 1/1. 狩人.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Put a Naterran Great Tree token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { TREE } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([TREE]);
      },
    }),
  ],
});
