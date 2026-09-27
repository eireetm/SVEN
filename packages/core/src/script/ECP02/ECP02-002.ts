// ECP02-002 Anastasia [Seize the Light] (Evolved) — 2/2.
// On Evolve - Select up to 2 other iM@S CG followers on your field and give them {[attack]}+1/{[defense]}+1.
// On Super-Evolve - Give each other iM@S CG follower on your field {[attack]}+1/{[defense]}+1. (Both trigger when it
// super-evolves, in any order — rulings.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { anotherYourFollower } from "../targets";
import { imas } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [anotherYourFollower({ count: 2, upTo: true, filter: imas })],
      *resolve(fx) {
        for (const id of fx.targets[0] ?? []) yield* fx.giveStats(id, 1, 1);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        const g = fx.game;
        for (const id of g.followers(fx.controller)) if (id !== fx.self && imas(g, id)) yield* fx.giveStats(id, 1, 1);
      },
    }),
  ],
});
