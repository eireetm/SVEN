// BP07-019 Bayleon, Sovereign Light (Evolved) — 4/4.
// Ward.
// On Evolve: Look at the top 4 cards of your deck. You may put up to 2 Natura cards from among them
// into your EX area. Put the rest on the bottom of your deck in any order.
// Activate Banish 2 cards named Naterran Great Tree from your field: Select a Natura follower on
// your field and give it {[attack]}+2.
import { banishFromYour } from "../costs";
import { activated, defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { yourFollower } from "../targets";
import { isTree, natura } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: natura, to: "ex", max: 2 });
      },
    }),
    activated(
      { custom: banishFromYour(["field"], isTree, 2) },
      {
        targets: [yourFollower({ filter: natura })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 2, 0);
        },
      },
    ),
  ],
});
