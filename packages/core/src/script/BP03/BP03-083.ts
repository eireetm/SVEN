// BP03-083 Furtive Fangs — Abysscraft spell, 1. 獣・童話.
// Select a follower on your field. For the rest of this turn it has
// "Strike: Select an enemy follower and deal it damage equal to this follower's attack."
// Two copies are two abilities (ruling).
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.grant(fx.targets[0]![0]!, "strikeByAttack", "endOfTurn");
      },
    }),
  ],
});
