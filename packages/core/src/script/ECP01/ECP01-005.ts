// ECP01-005 Haru Urara [Sunny Passion ♪] — Forestcraft follower, 2, 1/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// On Race - Give this follower {[attack]}+1/{[defense]}+1. Look at the top 5 cards of your deck. You may summon an Umamusume
// follower that costs 2 or less from among them. Put the rest on the bottom of your deck in any order. (元のコスト.)
import { defineCard, onRace, serveAbility } from "../helpers";
import { maySummonUmamusumeFromTop, plusOneThis } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        yield* plusOneThis(fx);
        yield* maySummonUmamusumeFromTop(fx, 5, 2);
      },
    }),
  ],
});
