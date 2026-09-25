// BP09-094 Jeweled Priestess (Evolved) — Havencraft follower, 3/3. 信仰・光輝.
// On Evolve - You may summon an amulet that costs 2 or less from your hand. (元のコスト.)
// Once per turn, when an amulet is put onto your field, give your leader {[defense]}+1. (Evolving is
// not being put onto the field; also in the opponent's turn; each copy — rulings.)
import { defineCard, onEvolve, whenCardEntersYourField } from "../helpers";
import { and, costAtMost, isAmulet } from "../targets";
import { summonFromHand } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* summonFromHand(fx, and(isAmulet, costAtMost(2)));
      },
    }),
    whenCardEntersYourField(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
      { type: "amulet" },
    ),
  ],
});
