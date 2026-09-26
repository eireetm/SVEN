// BP06-111 Mithra, Daybreak Deity (Evolved) — Neutral follower, 6/6. 光輝.
// On Evolve - Declare any number from 1 to 6, then roll a 6-sided die. If you roll the declared
// number, give your leader {[defense]}+5, search your deck for any card, put it into your EX area,
// shuffle your deck, then recover all your play points. (Nothing else on a miss — ruling.)
import { defineCard, onEvolve } from "../helpers";

const FACES = [1, 2, 3, 4, 5, 6].map((n) => ({ id: String(n), label: String(n) }));

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const [declared] = yield* fx.choose(FACES);
        if ((yield* fx.rollDie()) !== Number(declared)) return;
        yield* fx.giveLeaderDefense(fx.controller, 5);
        // "any card": no condition, so it is not revealed (CR 5.8.1.2), but one must be found (5.8.1.1).
        yield* fx.search(() => true, { to: "ex", reveal: false, required: true });
        yield* fx.recoverPlayPoints(fx.game.state.players[fx.controller].maxPlayPoints);
      },
    }),
  ],
});
