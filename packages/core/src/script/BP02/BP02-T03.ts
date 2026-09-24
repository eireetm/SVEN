// BP02-T03 Leonidas's Resolve — Swordcraft amulet token, 8.
// Whenever a {[swordcraft]} follower is put onto your field, give it {[attack]}+3/{[defense]}+3 and
// Rush.
import { defineCard, whenFollowerEntersYourField } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          const card = fx.data!.card!;
          yield* fx.giveStats(card, 3, 3);
          yield* fx.giveKeyword(card, "rush");
        },
      },
      { filter: isClass("Swordcraft") },
    ),
  ],
});
