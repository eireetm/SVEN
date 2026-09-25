// BP09-056 Virtuous Lindworm — Dragoncraft follower, 10/10. 竜族・光輝. The front face of a double-faced
// evolved card; its back face is BP09-056_back Iniquitous Lindworm (CR 2.14).
// Ward.
// At the start of your end phase, give your leader {[defense]}+6 and draw 3 cards.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 6);
        yield* fx.draw(3);
      },
    }),
  ],
});
