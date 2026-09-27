// CP03-028 Solitary Knight, Gancelot — Swordcraft follower, 4, 4/4. ヴァンガード・ロイヤルパラディン.
// Rush. Assail. Twin Drive.
// {[fanfare]} If there's a Blaster Blade in your cemetery, draw 2 cards, then discard a card. For the rest of this turn, this
// follower doesn't take damage. (The whole effect is under the condition, as in Japanese — Q10.)
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";

export default defineCard({
  keywords: ["rush", "assail", "twinDrive"],
  abilities: [
    fanfare({
      condition: (g, c) => g.cards(c, "cemetery").some((id) => named("Blaster Blade")(g, id)),
      *resolve(fx) {
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
        yield* fx.preventDamage(fx.self, "all", "endOfTurn");
      },
    }),
  ],
});
