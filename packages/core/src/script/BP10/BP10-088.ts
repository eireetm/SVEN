// BP10-088 Spirit Curator — Abysscraft follower, 2, 2/3. 死霊術師.
// {[fanfare]} Choose one. (1) Put a Ghost token into your EX area. (2) If there's a follower with
// "Ghost" in its name in your EX area, look at the top 3 cards of your deck. You may reveal an
// {[abysscraft]} card from among them and add it to your hand. Put the rest on the bottom of your deck
// in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { isClass } from "../targets";
import { ghostFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "ghost",
          label: "(1) Put a Ghost token into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx(["Ghost"]);
          },
        },
        {
          id: "look",
          label: "(2) With a Ghost follower in your EX area, an Abysscraft card from the top 3",
          *resolve(fx) {
            if (!fx.game.cards(fx.controller, "ex").some((id) => ghostFollower(fx.game, id))) return;
            yield* lookAtTopCards(fx, 3, { filter: isClass("Abysscraft"), to: "hand" });
          },
        },
      ],
    }),
  ],
});
