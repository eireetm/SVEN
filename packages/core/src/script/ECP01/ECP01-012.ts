// ECP01-012 Symboli Rudolf [Enchaînement] — Swordcraft follower, 4, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[feed]}{[feed]} {[cost02]}: Race this follower 2 times.
// {[feed]}{[feed]}{[feed]} {[cost03]}: Race this follower 3 times.
// On Race - Give this follower {[attack]}+1/{[defense]}+1. Look at the top 3 cards of your deck. You may summon an Umamusume
// follower that costs 3 or less from among them. Put the rest on the bottom of your deck in any order. (元のコスト. Racing 3
// times: the first On Race resolves first, then the others and the summoned follower's Fanfare in any order — rulings.)
import { defineCard, onRace, serveAbility } from "../helpers";
import { maySummonUmamusumeFromTop, plusOneThis } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    serveAbility(2, 2),
    serveAbility(3, 3),
    onRace({
      *resolve(fx) {
        yield* plusOneThis(fx);
        yield* maySummonUmamusumeFromTop(fx, 3, 3);
      },
    }),
  ],
});
