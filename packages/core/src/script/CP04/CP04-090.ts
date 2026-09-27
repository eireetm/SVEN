// CP04-090 Demonic Salvation: Infinity — Abysscraft spell, 1. プリコネ・トワイライトキャラバン.
// {[quick]}
// Select an enemy follower on the field. Deal it 2 damage and look at the top card of your deck. If it's a PriConne card, you may
// bury it. (Without an enemy follower it can't be played — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { priconne } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        const top = fx.topCards(1);
        yield* fx.bury(yield* fx.selectCards(top.filter((id) => priconne(fx.game, id)), 0, 1, fx.controller, top));
      },
    }),
  ],
});
