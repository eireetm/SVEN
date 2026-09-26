// BP12-063 Dragoon Medic — Dragoncraft follower, 1, 0/1. 竜使い.
// When this card is discarded, you may put it into your EX area.
// ----------
// {[evolve]} {[cost02]}: Evolve this follower.
// At the start of your end phase, give your leader {[defense]}+1.
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { discardedToEx } from "./shared";

export default defineCard({
  abilities: [
    discardedToEx,
    evolveAbility(2),
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
