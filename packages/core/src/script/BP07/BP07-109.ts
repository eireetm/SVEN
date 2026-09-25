// BP07-109 Maisha, Hero of Purgation (Evolved) — 3/4.
// On Evolve - {[cost05]}: Bury the top 5 cards of your deck. Give this follower Storm. (As many as
// there are; Storm even with 4 or fewer — ruling.)
// Strike - Select a Neutral spell that costs 3 or less in your cemetery and play it for 0 play
// points.
import { playPointsCost } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { maishaStrike } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: playPointsCost(5),
      *resolve(fx) {
        yield* fx.mill(5);
        yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
    maishaStrike,
  ],
});
