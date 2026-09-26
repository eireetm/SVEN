// BP16-002 Aria, Lady of the Woods (Evolved) — Forestcraft follower, 1/1. 妖精・プリンセス.
// On Evolve - Summon a Fairy token.
// On Super Evolve - Give each Pixie token follower on your field and in your EX area {[attack]}+1/{[defense]}+1.
// (A super-evolution also triggers On Evolve; the two resolve in any order — rulings. The effect on a card in
// the EX area carries to the field when it is played, CR 10.6.2.1.3.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { FAIRY, pixieTokenFollower } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([FAIRY]);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        const g = fx.game;
        for (const id of [...g.cards(fx.controller, "field"), ...g.cards(fx.controller, "ex")]) {
          if (pixieTokenFollower(g, id)) yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
  ],
});
