// ECP01-051 Mejiro Ardan [Hopeful Petals Dancing in the Night] — Havencraft follower, 6, 3/3. ウマ娘・メジロ家.
// {[feed]} {[cost01]}: Race this follower.
// On Race - Give this follower {[attack]}+1/{[defense]}+1. Search your deck for up to 2 Mejiro Family followers and/or Mejiro
// Family amulets that cost a total of 6 or less, summon them, then shuffle. (元のコスト.)
import { defineCard, onRace, serveAbility } from "../helpers";
import { isAmulet, isFollower } from "../targets";
import { mejiro, plusOneThis } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      *resolve(fx) {
        const g = fx.game;
        yield* plusOneThis(fx);
        yield* fx.search((id) => mejiro(g, id) && (isFollower(g, id) || isAmulet(g, id)), { max: 2, totalCostAtMost: 6, to: "field" });
      },
    }),
  ],
});
