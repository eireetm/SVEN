// ECP01-041 Machikanetannhauser [Machitan☆Adventure] — Abysscraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// On Race - Select up to 1 Umamusume follower that costs 3 or less in your cemetery and summon it. Give this follower
// {[attack]}+1/{[defense]}+1. (元のコスト.)
// {[fanfare]} Bury the top card of your deck.
import { defineCard, fanfare, onRace, serveAbility } from "../helpers";
import { costAtMost, inYourZone } from "../targets";
import { plusOneThis, umamusumeFollower } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      targets: [inYourZone("cemetery", { upTo: true, filter: (g, id) => umamusumeFollower(g, id) && costAtMost(3)(g, id) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
        yield* plusOneThis(fx);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
