// BP09-019 Celia, Hope's Strategist — Swordcraft follower, 2/2. 指揮官・光輝. The front face of a
// double-faced evolved card; its back face is BP09-019_back Celia, Despair's Messenger (CR 2.14).
// On Evolve - Summon a Shield Guardian token.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Shield Guardian"]);
      },
    }),
  ],
});
