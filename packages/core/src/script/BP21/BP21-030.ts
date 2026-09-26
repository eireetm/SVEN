// BP21-030 Sharp Strategist — Swordcraft follower, 2, 2/3. 指揮官・学院.
// Activate {[costX]}, engage this: Select an Academic follower that costs X or less in your cemetery not named Sharp
// Strategist and summon it. (元のコスト. X is chosen before the target, CR 10.6.2.2.4, 10.6.2.3, and there must be a
// target, 10.6.2.3.3, so X is at least the cheapest one's cost. X is paid as it resolves: nothing happens between
// playing and resolving an activated ability, so this is the same as paying it when playing, 10.6.2.5.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { activated, defineCard } from "../helpers";
import { named } from "../targets";
import { academicFollower } from "./shared";

const strategist = named("Sharp Strategist");
const cost = (g: GameReader, id: CardId) => g.info(id).cost ?? 0;
const playPointsOf = (g: GameReader, p: PlayerId) => g.state.players[p].playPoints;
const candidates = (g: GameReader, p: PlayerId, x: number) =>
  g.cards(p, "cemetery").filter((id) => academicFollower(g, id) && !strategist(g, id) && cost(g, id) <= x);

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => candidates(g, c, playPointsOf(g, c)).length > 0,
        *resolve(fx) {
          const g = fx.game;
          const pp = playPointsOf(g, fx.controller);
          const least = Math.min(...candidates(g, fx.controller, pp).map((id) => cost(g, id)));
          const options = Array.from({ length: pp - least + 1 }, (_, i) => ({ id: String(least + i), label: `X = ${least + i}` }));
          const [pick] = yield* fx.choose(options);
          const x = Number(pick ?? least);
          yield* fx.payPlayPoints(x);
          const [card] = yield* fx.selectCards(candidates(g, fx.controller, x), 1, 1);
          if (card !== undefined) yield* fx.putOntoField([card]);
        },
      },
    ),
  ],
});
