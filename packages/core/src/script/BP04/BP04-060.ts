// BP04-060 Python (Evolved) — Dragoncraft, 8/9.
// On Evolve: Search your deck for up to 10 cards and banish them.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        // A search with no condition but the number: not revealed; banished face up (ruling).
        yield* fx.search(() => true, { max: 10, to: "banish", reveal: false });
      },
    }),
  ],
});
