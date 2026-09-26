// BP15-030 Sword General — Swordcraft follower, 5, 4/4. 指揮官.
// Ward.
// {[fanfare]} Draw a card. You may summon up to 2 Officer followers that cost 2 or less from your hand. (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { officer } from "./shared";

const cheapOfficer = and(isFollower, officer, costAtMost(2));

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        const cards = fx.game.cards(fx.controller, "hand").filter((id) => cheapOfficer(fx.game, id));
        yield* fx.putOntoField(yield* fx.chooseCards(cards, 0, 2));
      },
    }),
  ],
});
