// BP19-101 Agent of the Commandments (Evolved) — 3/3.
// At the start of your end phase, give your leader {[defense]}+1.
// On Evolve - Search your deck for an Erralde, Troth Convict, reveal it, add it to your hand, then shuffle.
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";
import { ERRALDE } from "./shared";
import { agentEndPhase } from "./shared-haven";

export default defineCard({
  abilities: [
    agentEndPhase,
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named(ERRALDE)(fx.game, id));
      },
    }),
  ],
});
