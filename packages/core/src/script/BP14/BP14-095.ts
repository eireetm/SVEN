// BP14-095 Winged Gatekeeper — Havencraft follower, 2, 2/2. 宴楽・狂信・鳥族.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a Fox of Invitation token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { FOX } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FOX]);
      },
    }),
  ],
});
