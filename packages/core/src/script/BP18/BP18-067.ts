// BP18-067 Neon-Tailed Prefect (Evolved) — 2/4.
// On Evolve - Look at the top 2 cards of your deck. You may reveal a Draconic Duelist card from among them and add it to your
// hand. Put the rest on the bottom of your deck in any order.
// Whenever a Draconic Duelist follower with at least 4 attack on your field attacks, give it {[attack]}+1.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { draconicDuelist } from "./shared";
import { prefectPush } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: draconicDuelist, to: "hand" });
      },
    }),
    prefectPush,
  ],
});
