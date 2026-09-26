// BP13-018 Feybolt Archer — Forestcraft follower, 2, 2/1. 妖精・狩人.
// {[fanfare]} Summon a Fairy token. Look at the top 3 cards of your deck. You may reveal a Pixie card from
// among them and add it to your hand. Put the rest on the bottom of your deck in any order. (Also when a
// full field takes no Fairy — ruling.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { FAIRY, pixie } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([FAIRY]);
        yield* lookAtTopCards(fx, 3, { filter: pixie, to: "hand" });
      },
    }),
  ],
});
