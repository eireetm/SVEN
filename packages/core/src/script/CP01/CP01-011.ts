// CP01-011 Ines Fujin — Forestcraft follower, 6, 7/7. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Rush. Assail.
// {[fanfare]} Select another card on your field and return it to its owner's hand. (Only the field — ruling.)
import { defineCard, fanfare, serveAbility } from "../helpers";
import { anotherCardOnYourField } from "./shared";

export default defineCard({
  keywords: ["rush", "assail"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [anotherCardOnYourField],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
