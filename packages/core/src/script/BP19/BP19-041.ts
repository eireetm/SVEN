// BP19-041 Kyrzael, Killshot Enforcer — Runecraft follower, 6, 4/4. 八獄・機械.
// Storm.
// Strike - Give each other Machina follower on your field {[attack]}+1/{[defense]}+1.
// {[fanfare]} Search your deck for a Warden of the Trigger, summon it, then shuffle.
import { defineCard, fanfare, strike } from "../helpers";
import { named } from "../targets";
import { machina } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller).filter((c) => c !== fx.self && machina(fx.game, c))) yield* fx.giveStats(id, 1, 1);
      },
    }),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => named("Warden of the Trigger")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
