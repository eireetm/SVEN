// BP21-012 Fairy Funfact — Forestcraft spell, 1. 妖精・学院.
// Summon a Fairy token. Give each Pixie token follower on your field Rush and Assail. Combo (3) - Draw a card. (CR 13.2.1.2.)
import { defineCard, spell } from "../helpers";
import { FAIRY, pixieTokenFollower } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon([FAIRY]);
        for (const id of fx.game.cards(fx.controller, "field").filter((c) => pixieTokenFollower(fx.game, c))) {
          yield* fx.giveKeyword(id, "rush");
          yield* fx.giveKeyword(id, "assail");
        }
        if (fx.game.combo(fx.controller, 3)) yield* fx.draw(1);
      },
    }),
  ],
});
