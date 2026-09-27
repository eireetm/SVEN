// CP01-040 Special Week — Dragoncraft follower, 2, 2/2. ウマ娘.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Look at the top card of your deck. If it's an Umamusume card, you may reveal it and add it to your hand. (Not
// taken: it stays on top, unrevealed — ruling.)
import { defineCard, evolveAbility, fanfare, serveAbility } from "../helpers";
import { mayTakeTopCard, umamusume } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* mayTakeTopCard(fx, umamusume);
      },
    }),
  ],
});
