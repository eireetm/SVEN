// BP17-030 Shadowed Memories — Swordcraft spell, 2. 暗殺者.
// This costs 2 less to play if you selected a follower on your field with "Leod" in its name.
// ----------
// Select an Assassin follower on your field and put it into its owner's EX area. (It loses its damage and effects; a
// full EX area leaves it on the field — rulings.)
// The target is selected before the cost is determined (CR 10.6.2.3, 10.6.2.5), so the two ways of playing it are
// options with disjoint targets: a Leod follower for 2 less, or another Assassin follower.
import { defineCard, spell } from "../helpers";
import { nameIncludes, yourFollower } from "../targets";
import { assassin } from "./shared";

const leod = nameIncludes("Leod");

export default defineCard({
  playOptionsRequired: true,
  playOptions: [
    { id: "leod", label: "Select a Leod follower: costs 2 less", canPay: () => true, *pay() {}, costDelta: -2, targetFilter: leod },
    { id: "other", label: "Select another Assassin follower", canPay: () => true, *pay() {}, targetFilter: (g, id) => !leod(g, id) },
  ],
  abilities: [
    spell({
      targets: [yourFollower({ filter: assassin })],
      *resolve(fx) {
        yield* fx.putIntoEx(fx.targets[0]!);
      },
    }),
  ],
});
