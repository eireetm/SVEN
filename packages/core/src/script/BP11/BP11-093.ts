// BP11-093 Set — Havencraft follower, 6, 2/6. 信仰・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward. Bane. Aura.
// {[act]} {[cost01]}, discard this card: Give your leader {[defense]}+2. (Valid in the hand — ruling,
// CR 10.3.5.)
import { discardThis } from "../costs";
import { activated, defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward", "bane", "aura"],
  abilities: [
    evolveAbility(1),
    activated(
      { playPoints: 1, custom: discardThis },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      },
    ),
  ],
});
