// BP02-013 Elf Healer — Forestcraft follower, 3, 1/5.
// {[fanfare]} Give your leader {[defense]}+3.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
