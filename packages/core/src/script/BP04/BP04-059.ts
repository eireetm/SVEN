// BP04-059 Python — Dragoncraft follower, 6, 6/7. 竜族.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Search your deck for up to 10 cards and banish them. (The English says "Select";
// the Japanese is a search, 探し.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        // A search with no condition but the number: not revealed; banished face up (ruling).
        yield* fx.search(() => true, { max: 10, to: "banish", reveal: false });
      },
    }),
  ],
});
