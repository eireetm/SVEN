// BP19-072 Dragonewt's Might — Dragoncraft spell, 4. ドラゴニュート・武闘竜人.
// Select up to 2 enemy followers on the field and deal them each 6 damage. You may discard a card. If you do and the discarded
// card is a Dragonewt follower, deal 2 damage to each enemy leader. (Playable with no enemy follower — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isFollower } from "../targets";
import { dragonewt } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        if (fx.targets[0]!.length > 0) yield* fx.dealDamageEach(fx.targets[0]!, 6);
        const hand = fx.game.cards(fx.controller, "hand");
        const [card] = yield* fx.chooseCards(hand, 0, Math.min(1, hand.length));
        if (card === undefined) return;
        const dragonewtFollower = isFollower(fx.game, card) && dragonewt(fx.game, card);
        yield* fx.discardCards([card]);
        if (dragonewtFollower) yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
