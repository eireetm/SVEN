// BP05-007 Fairy Torrent — Forestcraft spell, 1. 妖精.
// Quick.
// Select up to 2 Pixie followers on your field and put them into their owners' EX areas. If at
// least 1 Pixie follower was put into an EX area by this ability, give your leader {[defense]}+2.
// (+2 even for 2; they lose their effects, stat changes and counters; tokens stay in the EX area —
// rulings, CR 9.1.4.)
import { defineCard, spell } from "../helpers";
import { hasTrait, yourFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [yourFollower({ count: 2, upTo: true, filter: hasTrait("妖精") })],
      *resolve(fx) {
        const moved = yield* fx.putIntoEx(fx.targets[0] ?? []);
        if (moved.length > 0) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
