// BP17-115 Cosmic Angel — Neutral follower, 3, 3/4. 天使・光輝.
// Ward.
// {[fanfare]} Search your deck for an Angel card not named Cosmic Angel, reveal it, add it to your hand, then shuffle. If
// there are at least 5 Angel cards in your cemetery, give your leader {[defense]}+2.
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { angel } from "./shared";

const cosmic = named("Cosmic Angel");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => angel(g, id) && !cosmic(g, id));
        if (g.cards(fx.controller, "cemetery").filter((id) => angel(g, id)).length >= 5) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
