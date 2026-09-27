// CP01-063 Sakura Chiyono O — Abysscraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// On Race: Give this follower {[attack]}+1/{[defense]}+1. Select up to 1 Umamusume card in your cemetery and add it to your hand.
import { defineCard, onRace, serveAbility } from "../helpers";
import { inYourZone } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      targets: [inYourZone("cemetery", { upTo: true, filter: umamusume })],
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.returnToHand(fx.targets[0] ?? []);
      },
    }),
  ],
});
