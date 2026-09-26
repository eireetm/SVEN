// BP13-106 Sahaquiel & Israfil (Evolved) — Neutral follower, 7/7. 天使・大神.
// Ward.
// On Evolve - Select another follower on the field and put it into its owner's EX area. If you put it into
// your EX area, summon it engaged. (Either field; a stolen or given follower goes to its owner's EX area,
// CR 5.22.5; it loses its damage and given abilities, CR 4.1.4; its Fanfare triggers — rulings.)
import { defineCard, onEvolve } from "../helpers";
import { anotherFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [anotherFollower()],
      *resolve(fx) {
        for (const id of yield* fx.putIntoEx(fx.targets[0]!)) {
          if (fx.game.card(id)?.owner === fx.controller) yield* fx.putOntoField([id], fx.controller, { engaged: true });
        }
      },
    }),
  ],
});
