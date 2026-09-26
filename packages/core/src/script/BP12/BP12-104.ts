// BP12-104 Changewing Cherub — Neutral follower, 1, 1/1. 機械・自然・天使.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Put a Repair Mode or Naterran Great Tree token into your EX Area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { REPAIR, TREE } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const [pick] = yield* fx.choose([
          { id: "repair", label: "Put a Repair Mode into your EX area" },
          { id: "tree", label: "Put a Naterran Great Tree into your EX area" },
        ]);
        yield* fx.tokensToEx([pick === "tree" ? TREE : REPAIR]);
      },
    }),
  ],
});
