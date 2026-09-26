// BP12-020 Lecia, Sky Saber — Swordcraft follower, 3, 3/3. 指揮官.
// {[fanfare]} Search your deck for a Nano, the Dawnblade, summon it, then shuffle.
// Whenever a Nano, the Dawnblade on your field evolves, choose one. (1) Put a Twilight Blade token into
// your EX area. (2) Give your leader {[defense]}+2.
import type { AutomaticAbility } from "../types";
import { defineCard, fanfare, whenYourFollowerEvolves } from "../helpers";
import { named } from "../targets";
import { NANO } from "./shared";

const nanoEvolves = whenYourFollowerEvolves({
  modes: [
    {
      id: "blade",
      label: "(1) Put a Twilight Blade into your EX area",
      *resolve(fx) {
        yield* fx.tokensToEx(["Twilight Blade"]);
      },
    },
    {
      id: "defense",
      label: "(2) Your leader +2 defense",
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    },
  ],
});

/** Only a Nano, the Dawnblade evolving (the evolved card has the same name, CR 5.16.1.1). */
const whenNanoEvolves: AutomaticAbility = {
  ...nanoEvolves,
  trigger: (e, me, game) => e.type === "evolved" && named(NANO)(game, e.card) && nanoEvolves.trigger(e, me, game),
};

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named(NANO)(fx.game, id), { to: "field" });
      },
    }),
    whenNanoEvolves,
  ],
});
