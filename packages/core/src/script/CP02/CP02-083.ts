// CP02-083 Syoko Hoshi — Abysscraft follower, 2, 3/2. デレマス・パッション.
// {[evolve]} {[cost01]}: Evolve this follower.
// This follower can't attack enemies. (Neither leaders nor followers, engaged ones too — ruling; CR 8.4.3.2.1.)
// At the start of your end phase, give your leader {[defense]}+1.
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";

export default defineCard({
  cannotAttack: true,
  abilities: [
    evolveAbility(1),
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
