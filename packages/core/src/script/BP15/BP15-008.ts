// BP15-008 Erosive Annihilation — Forestcraft spell, 1. 絶傑・狩人.
// {[quick]}
// This costs 1 less to play if there's a follower on your field with "Izudia" in its name.
// ----------
// Select an enemy follower on the field and deal it 1 damage. When it's put from the field into the cemetery this
// turn, draw a card. (Two copies on one follower draw 2 — ruling.)
import { defineCard, delayedWhenPutIntoCemetery, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { followerNamedOnField } from "./shared";

export default defineCard({
  keywords: ["quick"],
  playCost: (g, _self, p) => (followerNamedOnField(g, p, "Izudia") ? -1 : 0),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const card = fx.targets[0]![0]!;
        yield* fx.dealDamage(card, 1);
        yield* fx.delay(1, "endOfTurn", { card });
      },
    }),
    delayedWhenPutIntoCemetery(function* (fx) {
      yield* fx.draw(1);
    }),
  ],
});
