// BP18-070 Red-Winged Admissions Gift — Dragoncraft amulet, 1. 透京・ドラゴニュート・武闘竜人.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a Draconic Duelist card from among them and add it to your
// hand. Put the rest on the bottom of your deck in any order.
// Activate {[engage]} this, bury this: Give your leader {[defense]}+1. Activate only if there's a Draconic Duelist follower
// on your field with at least 4 attack.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { bigDuelist, draconicDuelist } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: draconicDuelist, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, c) => g.followers(c).some((id) => bigDuelist(g, id)),
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
