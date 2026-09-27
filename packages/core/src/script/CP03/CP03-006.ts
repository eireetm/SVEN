// CP03-006 Navalgazer Dragon (Evolved) — 2/4. (Evolved from CP03-005, which names it.)
// Twin Drive.
// On Evolve - You may summon a 1-cost Aqua Force follower from your hand. (元のコスト.)
// Whenever an Aqua Force follower on your field attacks, if it's the 3rd time an Aqua Force follower on your field has attacked
// this turn, give your leader {[defense]}+2 and draw a card.
import { defineCard, onEvolve, whenYourFollowerAttacks } from "../helpers";
import { aquaForce, aquaForceAttacks, followerThat, maySummonFromHand } from "./shared";

export default defineCard({
  keywords: ["twinDrive"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* maySummonFromHand(fx, (g, id) => followerThat(aquaForce)(g, id) && g.info(id).cost === 1);
      },
    }),
    // Once per attack; each copy triggers; exactly the 3rd attack, this one included (rulings).
    whenYourFollowerAttacks(
      {
        condition: (g, c) => aquaForceAttacks(g, c) === 3,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
          yield* fx.draw(1);
        },
      },
      aquaForce,
    ),
  ],
});
