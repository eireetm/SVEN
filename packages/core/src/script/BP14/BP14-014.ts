// BP14-014 Fairylight Guide — Forestcraft follower, 2, 2/2. 宴楽・妖精.
// {[fanfare]} {[cost01]} Select a card in an opponent's EX area and, if there are at least 3 cards in your EX
// area, transform it into a Fairy token. (Transform: banish it and create the token in the same area; Aura
// only protects cards on the field — rulings.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { inOpponentZone } from "../targets";
import { FAIRY } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(1),
      targets: [inOpponentZone("ex")],
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "ex").length < 3) return;
        yield* fx.transform(fx.targets[0]!, FAIRY);
      },
    }),
  ],
});
