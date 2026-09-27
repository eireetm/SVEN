// ECP01-055 Progenitors and Guides — Neutral follower, 6, 4/4. ウマ娘.
// {[fanfare]} Discard an Umamusume card: Recover 4 play points.
// Activate {[engage]}: Choose one. (1) Select an Umamusume follower that costs 5 or less in your cemetery and add it to your hand.
// (2) Select up to 2 faceup cards named Carrot in your evolve deck and turn them facedown. Gain 1 Evolution Point. (3) Give each
// other Umamusume follower on your field {[attack]}+1/{[defense]}+1. (元のコスト. Without a follower to select (1) can't be chosen;
// the evolution point is gained by either player, also with 3 already — rulings.)
import { discardA } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { costAtMost, inYourZone } from "../targets";
import { faceUpCarrots, umamusume, umamusumeFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(umamusume),
      *resolve(fx) {
        yield* fx.recoverPlayPoints(4);
      },
    }),
    activated(
      { engageSelf: true },
      {
        modes: [
          {
            id: "cemetery",
            label: "Add an Umamusume follower that costs 5 or less from your cemetery to your hand",
            targets: [inYourZone("cemetery", { filter: (g, id) => umamusumeFollower(g, id) && costAtMost(5)(g, id) })],
            *resolve(fx) {
              yield* fx.returnToHand(fx.targets[0]!);
            },
          },
          {
            id: "carrots",
            label: "Turn up to 2 faceup Carrots facedown and gain 1 evolution point",
            targets: [{ count: 2, upTo: true, candidates: (g, c) => faceUpCarrots(g, c) }],
            *resolve(fx) {
              yield* fx.turnFacedown(fx.targets[0]!);
              yield* fx.gainEvolutionPoints(1);
            },
          },
          {
            id: "boost",
            label: "Give each other Umamusume follower on your field +1/+1",
            *resolve(fx) {
              const g = fx.game;
              for (const id of g.followers(fx.controller)) if (id !== fx.self && umamusume(g, id)) yield* fx.giveStats(id, 1, 1);
            },
          },
        ],
      },
    ),
  ],
});
