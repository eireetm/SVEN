// BP21-095 Wilbert, Desolate Paladin (Evolved) — 3/3.
// Ward.
// On Evolve - Choose 1. (1) Summon a Holy Cavalier token. Give each Holy Cavalier on your field {[attack]}+1 and Assail.
// (2) Put a Crest: Wilbert, Desolate Paladin token into your EX area. (One per name there, CR 9.1.5.1.1.)
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";

const cavalier = named("Holy Cavalier");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      modes: [
        {
          id: "cavalier",
          label: "(1) Summon a Holy Cavalier; Holy Cavaliers get +1/+0 and Assail",
          *resolve(fx) {
            yield* fx.summon(["Holy Cavalier"]);
            for (const id of fx.game.followers(fx.controller).filter((f) => cavalier(fx.game, f))) {
              yield* fx.giveStats(id, 1, 0);
              yield* fx.giveKeyword(id, "assail");
            }
          },
        },
        {
          id: "crest",
          label: "(2) Put a Crest: Wilbert, Desolate Paladin into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx(["Crest: Wilbert, Desolate Paladin"]);
          },
        },
      ],
    }),
  ],
});
