// BP11-034 Dramatic Retreat — Swordcraft spell, 0. 兵士.
// {[quick]}
// This card can't be played during your turn.
// ----------
// Select a follower on your field and put it into its owner's EX area. (A token or an advanced card
// stays there; a full EX area leaves it on the field; its damage and effects are lost — rulings,
// CR 4.1.4, 4.8.3.2.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  playableIf: (g, _self, p) => g.activePlayer !== p,
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.putIntoEx(fx.targets[0]!);
      },
    }),
  ],
});
