// BP16-045 Homework Time! — Runecraft spell, 1. 魔法使い・学院.
// Draw a card. If there are at least 5 Academic cards in your cemetery, put a Looking Smart! token into your EX
// area.
import { defineCard, spell } from "../helpers";
import { academicInCemetery } from "./shared-rune";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
        if (academicInCemetery(fx.game, fx.controller) >= 5) yield* fx.tokensToEx(["Looking Smart!"]);
      },
    }),
  ],
});
