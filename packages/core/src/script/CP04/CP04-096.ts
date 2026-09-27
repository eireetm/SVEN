// CP04-096 Yui (Evolved) — Havencraft, 2/2. プリコネ・トゥインクルウィッシュ.
// {[ub]} On Evolve - {[costX]}: Select a PriConne follower in your cemetery that costs X or less and summon it. (元のコスト. X is
// determined before the selection, CR 10.6.2.2.4; selecting first and then paying an X at least its cost gives the same choices.
// Not paying, or with nothing to select, it isn't executed; with a full field it is, and the card stays — rulings. Executed by
// CP04-114, X is 0, CR 14.5.1.5.)
// Whenever a {[ub]} ability of another follower on your field is executed, give your leader {[defense]}+1.
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { defineCard, onEvolve, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { priconneFollower } from "./shared";

const inCemetery = (g: GameReader, c: PlayerId, x: number): CardId[] =>
  g.cards(c, "cemetery").filter((id) => priconneFollower(g, id) && (g.info(id).cost ?? 0) <= x);

/** "{[costX]}": X from the selected follower's cost up to the play points there are. */
const payX: CustomCost = {
  canPay: () => true,
  *pay(fx) {
    const pp = fx.game.state.players[fx.controller].playPoints;
    const selected = fx.targets[0]?.[0];
    const least = selected === undefined ? 0 : (fx.game.info(selected).cost ?? 0);
    const options = Array.from({ length: Math.max(0, pp - least) + 1 }, (_, i) => ({ id: String(least + i), label: `X = ${least + i}` }));
    const [pick] = yield* fx.choose(options);
    yield* fx.payPlayPoints(Number(pick ?? least));
  },
};

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        cost: payX,
        targets: [
          {
            count: 1,
            candidates: (g, c, _self, play) => inCemetery(g, c, play?.free ? 0 : g.state.players[c].playPoints),
          },
        ],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0]!);
        },
      }),
    ),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
