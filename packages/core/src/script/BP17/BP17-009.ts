// BP17-009 Beastfolk Harvester — Forestcraft follower, 2, 2/2. 自然・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Naterran Great Tree token into your EX area. If there are at least 3 Natura cards in your EX area,
// give your leader {[defense]}+1. (The new one counts — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { countIn, natura, TREE } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([TREE]);
        if (countIn(fx.game, fx.controller, "ex", natura) >= 3) yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
