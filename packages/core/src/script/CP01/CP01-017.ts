// CP01-017 Winning Ticket — Swordcraft follower, 3, 2/2. ウマ娘・BNW.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Storm.
// {[fanfare]} If there is a Trial Initiation and Narita Taishin in your cemetery, give this follower {[attack]}+3/{[defense]}+1.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare, serveAbility } from "../helpers";
import { named } from "../targets";

const inCemetery = (g: GameReader, p: PlayerId, name: string) => g.cards(p, "cemetery").some((id) => named(name)(g, id));

export default defineCard({
  keywords: ["storm"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        const g = fx.game;
        if (inCemetery(g, fx.controller, "Trial Initiation") && inCemetery(g, fx.controller, "Narita Taishin")) yield* fx.giveStats(fx.self, 3, 1);
      },
    }),
  ],
});
