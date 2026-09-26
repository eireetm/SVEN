// BP19-012 Puppet Workout — Forestcraft spell, 3. 人形.
// Summon 2 Puppet tokens. Give each Puppetry token follower on your field {[attack]}+2 and Assail.
import { defineCard, spell } from "../helpers";
import { isToken } from "../targets";
import { PUPPET, puppetry } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.summon([PUPPET, PUPPET]);
        for (const id of fx.game.followers(fx.controller).filter((c) => isToken(fx.game, c) && puppetry(fx.game, c))) {
          yield* fx.giveStats(id, 2, 0);
          yield* fx.giveKeyword(id, "assail");
        }
      },
    }),
  ],
});
