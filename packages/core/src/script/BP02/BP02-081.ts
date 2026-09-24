// BP02-081 Precious Bloodfangs — Abysscraft spell, 2.
// (Also printed as BP02-082 "Yes My Dark", a collab name — CR 2.13, ruling.)
// Choose one of the following. (1) Summon X Forest Bat tokens. X equals the number of enemy cards
// on the field. (2) Give each Forest Bat token on your field {[attack]}+1/{[defense]}+1.
// (Either can be chosen even when nothing would happen — rulings.)
import { defineCard, spell } from "../helpers";
import { and, isToken, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "1",
          label: "Summon a Forest Bat for each enemy card on the field",
          *resolve(fx) {
            const x = fx.game.cards(fx.game.opponent(fx.controller), "field").length;
            yield* fx.summon(Array<string>(x).fill("Forest Bat"));
          },
        },
        {
          id: "2",
          label: "Give each Forest Bat on your field +1/+1",
          *resolve(fx) {
            for (const id of fx.game.cards(fx.controller, "field").filter((c) => and(isToken, named("Forest Bat"))(fx.game, c))) {
              yield* fx.giveStats(id, 1, 1);
            }
          },
        },
      ],
    }),
  ],
});
