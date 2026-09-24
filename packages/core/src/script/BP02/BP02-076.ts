// BP02-076 Vampiric Fortress — Abysscraft amulet, 1.
// (Also printed as BP02-077 "Planet Laplaton", a collab name — CR 2.13, ruling.)
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a Vampire card from among them
// and add it to your hand. Put the remaining cards on the bottom of your deck in any order.
// {[act]}{[cost01]}, {[engage]}, put this card into your cemetery: Summon a Forest Bat token.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: hasTrait("吸血鬼"), to: "hand" });
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.summon(["Forest Bat"]);
        },
      },
    ),
  ],
});
