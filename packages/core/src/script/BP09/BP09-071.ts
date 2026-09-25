// BP09-071 Arcus, Spirited Manager — Abysscraft follower, 2, 5/5. 死者・死霊術師.
// This follower can't attack enemies. (Not even engaged enemy followers — ruling.)
// At the start of your main phase, Necrocharge (10) - Summon a Ghost token.
// {[act]} Bury another follower: Choose one of the following. Activate only once per turn. (1) Draw a
// card. (2) Summon 2 Ghost tokens. (3) Bury the top 2 cards of your deck. (A follower on your field,
// CR 10.4.3.)
import { buryAnotherFromYourField } from "../costs";
import { activated, atStartOfYourMainPhase, defineCard } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  cannotAttack: true,
  abilities: [
    atStartOfYourMainPhase({
      condition: (g, c) => g.necrocharge(c, 10),
      *resolve(fx) {
        yield* fx.summon(["Ghost"]);
      },
    }),
    activated(
      { custom: buryAnotherFromYourField(isFollower) },
      {
        oncePerTurn: true,
        modes: [
          {
            id: "draw",
            label: "(1) Draw a card",
            *resolve(fx) {
              yield* fx.draw(1);
            },
          },
          {
            id: "ghosts",
            label: "(2) Summon 2 Ghost tokens",
            *resolve(fx) {
              yield* fx.summon(["Ghost", "Ghost"]);
            },
          },
          {
            id: "mill",
            label: "(3) Bury the top 2 cards of your deck",
            *resolve(fx) {
              yield* fx.mill(2);
            },
          },
        ],
      },
    ),
  ],
});
