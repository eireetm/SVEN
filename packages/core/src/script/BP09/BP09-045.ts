// BP09-045 Summoning Drills — Runecraft amulet, 2. 錬金術師・土の印.
// Stack.
// {[fanfare]} Put a Guardform Golem token onto your field.
// {[fanfare]} Discard a card: Put a Strikeform Golem token into your EX area. Give each Golem follower
// on your field and in your EX area {[attack]}+1. (The +1 applies even if the EX area is full — ruling.
// The two Fanfares resolve in any order — ruling.)
import { discardCardsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

const golemFollower = and(isFollower, hasTrait("ゴーレム"));

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Guardform Golem"]);
      },
    }),
    fanfare({
      cost: discardCardsCost(1),
      *resolve(fx) {
        yield* fx.tokensToEx(["Strikeform Golem"]);
        const golems = [...fx.game.cards(fx.controller, "field"), ...fx.game.cards(fx.controller, "ex")].filter((id) =>
          golemFollower(fx.game, id),
        );
        for (const id of golems) yield* fx.giveStats(id, 1, 0);
      },
    }),
  ],
});
