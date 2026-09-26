// BP18-005 Verdant Authority Caretaker — Forestcraft follower, 2, 1/2. 透京・植物族.
// {[evolve]} {[cost00]}: Evolve this.
// You may play any number of Evolve per turn. (CR 8.3.2.2.)
// Whenever a follower on your field evolves, give your leader {[defense]}+1.
import { defineCard, evolveAbility, whenYourFollowerEvolves } from "../helpers";

export default defineCard({
  field: { unlimitedEvolve: true },
  abilities: [
    evolveAbility(0),
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
