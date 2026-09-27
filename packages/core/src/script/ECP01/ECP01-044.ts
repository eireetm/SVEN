// ECP01-044 Manhattan Cafe — Abysscraft follower, 1, 1/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// {[fanfare]} Bury the top card of your deck.
// Activate {[engage]}, bury this card: Select a 2-cost Umamusume follower in your cemetery and summon it. Activate only if there are
// at least 10 Umamusume cards in your cemetery. (元のコスト.)
import { activated, defineCard, fanfare, serveAbility } from "../helpers";
import { inYourZone } from "../targets";
import { umamusumeFollower, umamusumeInCemetery } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => umamusumeInCemetery(g, c) >= 10,
        targets: [inYourZone("cemetery", { filter: (g, id) => umamusumeFollower(g, id) && g.info(id).cost === 2 })],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0]!);
        },
      },
    ),
  ],
});
