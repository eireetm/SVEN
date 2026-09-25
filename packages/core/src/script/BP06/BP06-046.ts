// BP06-046 Traditional Sorcerer — Runecraft follower, 2, 1/4. 陰陽師.
// Whenever a Shikigami follower is put onto your field, give it Ward.
// {[fanfare]} If there are at least 7 spells and Onmyoji cards in your cemetery, summon a Paper
// Shikigami token and give your leader {[defense]}+2. (Both need the 7 — ruling.)
import { defineCard, fanfare, whenCardEntersYourField } from "../helpers";
import { sevenOnmyoji, shikigami } from "./shared";

export default defineCard({
  abilities: [
    whenCardEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data?.card;
          if (card !== undefined && fx.game.card(card)?.zone === "field") yield* fx.giveKeyword(card, "ward");
        },
      },
      { filter: shikigami },
    ),
    fanfare({
      *resolve(fx) {
        if (!sevenOnmyoji(fx.game, fx.controller)) return;
        yield* fx.summon(["Paper Shikigami"]);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
