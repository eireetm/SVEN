// ECP01-050 Wonder Acute — Havencraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// On Race - Give this follower {[attack]}+1/{[defense]}+1. You may summon an Umamusume follower that costs 2 or less or Umamusume
// amulet that costs 2 or less from your hand. (元のコスト.)
// {[fanfare]} Draw a card.
import { defineCard, fanfare, onRace, serveAbility } from "../helpers";
import { costAtMost, isAmulet, isFollower } from "../targets";
import { maySummonFromHand, plusOneThis, umamusume } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        yield* plusOneThis(fx);
        yield* maySummonFromHand(fx, (g, id) => (isFollower(g, id) || isAmulet(g, id)) && umamusume(g, id) && costAtMost(2)(g, id));
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
