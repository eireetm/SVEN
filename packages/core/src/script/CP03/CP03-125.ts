// CP03-125 Powers Converged — Neutral spell, 3. ヴァンガード. (CP03-126 is the same card.)
// Choose one. If there are at least 3 faceup cards named Drive Point in your evolve deck, choose up to 3 instead. (1) Select an
// enemy follower on the field and deal it 4 damage. (2) Select a follower in your cemetery and add it to your hand. (3) Give your
// leader {[defense]}+4. (Each option at most once; Drive Points linked to followers aren't in the evolve deck — rulings. The
// number is decided when it is played, CR 5.18.3.1.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, inYourZone, isFollower, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, c) => (g.faceUpEvolveDeck(c).filter((id) => named("Drive Point")(g, id)).length >= 3 ? 3 : 1),
      modes: [
        {
          id: "1",
          label: "Deal 4 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          },
        },
        {
          id: "2",
          label: "Add a follower from your cemetery to your hand",
          targets: [inYourZone("cemetery", { filter: isFollower })],
          *resolve(fx) {
            yield* fx.returnToHand(fx.targets[0]!);
          },
        },
        {
          id: "3",
          label: "Give your leader +4 defense",
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 4);
          },
        },
      ],
    }),
  ],
});
