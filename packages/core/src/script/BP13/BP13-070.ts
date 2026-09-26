// BP13-070 Beating of the Dragonwings — Dragoncraft spell, 1. ドラゴニュート.
// As an additional cost to play this card, bury a Dragonewt follower. (A follower on your field, CR 10.4.3;
// not playable without paying it, nor without a target — rulings.)
// ----------
// Select an enemy follower on the field. Deal it 4 damage and draw a card.
import { defineCard, spell } from "../helpers";
import { buryFromYourField } from "../costs";
import { and, enemyFollower, hasTrait, isFollower } from "../targets";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "bury", label: "Bury a Dragonewt follower", ...buryFromYourField(and(isFollower, hasTrait("ドラゴニュート")), 1) }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.draw(1);
      },
    }),
  ],
});
