// BP08-072 Tartarus the Tormentor — Abysscraft follower, 10, 7/7. 魔界.
// Costs 5 less to play with at least 15 Departed cards in your cemetery, including from the EX
// area (ruling, CR 10.4.4.1, 13.5).
// {[evolve]} {[cost01]}: Evolve this follower.
// Activate from hand, pay 1 and put this card into your EX area: look at the top 2, optionally take
// a Departed card, and bury the rest (ruling, CR 5.11, 10.3.5).
import { putThisFromHandIntoEx } from "../costs";
import { activated, defineCard, evolveAbility, lookAtTopCards } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  playCost: (g, _self, c) => (g.cards(c, "cemetery").filter((id) => hasTrait("死者")(g, id)).length >= 15 ? -5 : 0),
  abilities: [
    evolveAbility(1),
    activated(
      { playPoints: 1, custom: putThisFromHandIntoEx },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* lookAtTopCards(fx, 2, { filter: hasTrait("死者"), to: "hand", rest: "cemetery" });
        },
      },
    ),
  ],
});
