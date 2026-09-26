// BP17-040 Belphomet, Ultimate Creator — Runecraft follower, 5, 5/5. 機械・超克.
// This costs 5 less to play if there's a Machina follower on your field that costs 6 or more.
// ----------
// {[fanfare]} Bury each Machina follower that costs 6 or more. If you buried a 6-cost Machina follower, summon an Assault
// Tentacle token. If you buried a 7-cost Machina follower, deal 4 damage to each enemy follower on the field and give each
// other Machina follower on your field {[attack]}+2/{[defense]}+2. (On your field — the Japanese text; 元のコスト.)
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";
import { machina } from "./shared";

const bigMachina = (g: GameReader, p: PlayerId) =>
  g.followers(p).filter((id) => isFollower(g, id) && machina(g, id) && (g.info(id).cost ?? 0) >= 6);

export default defineCard({
  playCost: (g, _self, p) => (bigMachina(g, p).length > 0 ? -5 : 0),
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const buried = bigMachina(g, fx.controller);
        const costs = buried.map((id) => g.info(id).cost);
        yield* fx.bury(buried);
        if (costs.includes(6)) yield* fx.summon(["Assault Tentacle"]);
        if (!costs.includes(7)) return;
        yield* fx.dealDamageEach(g.followers(g.opponent(fx.controller)), 4);
        for (const id of g.followers(fx.controller)) if (id !== fx.self && machina(g, id)) yield* fx.giveStats(id, 2, 2);
      },
    }),
  ],
});
