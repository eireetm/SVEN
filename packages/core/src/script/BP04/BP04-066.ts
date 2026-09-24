// BP04-066 Lightning Blast — Dragoncraft spell, 5. 竜族. Quick.
// (BP04-067 is the same card.)
// You may play this card for 5 more play points (CR 10.4.7.3).
// Select an enemy follower on the field and banish it. If you played this card for 5 more play
// points, instead of banishing that follower, banish each enemy follower on the field.
// A follower must be selected either way, so it cannot be played without a selectable one; with
// one, the +5 version banishes every enemy follower, those with Aura included (rulings).
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  playOptions: [
    {
      id: "plus5",
      label: "Play for 5 more play points",
      canPay: () => true,
      *pay() {},
      costDelta: 5,
    },
  ],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.playOption === "plus5") yield* fx.banish(fx.game.followers(fx.game.opponent(fx.controller)));
        else yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
