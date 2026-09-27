// CP04-069 Kaori — Dragoncraft follower, 3, 3/3. プリコネ・カォン.
// {[ub]} Strike - {[cost02]}: Deal 3 damage to each enemy leader.
// Rush.
// While there's another PriConne follower on your field, this has Storm. (A passive — ruling.)
import { playPointsCost } from "../costs";
import { defineCard, strike, ub } from "../helpers";
import { anotherOnYourField, damageEnemyLeader, traitOf } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    ub(
      strike({
        cost: playPointsCost(2),
        *resolve(fx) {
          yield* damageEnemyLeader(fx, 3);
        },
      }),
    ),
  ],
  field: {
    keywordsFor: (g, self, card) => (card === self && anotherOnYourField(g, self, traitOf("プリコネ")) ? ["storm"] : []),
  },
});
