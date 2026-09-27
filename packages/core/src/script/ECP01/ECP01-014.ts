// ECP01-014 Aston Machan — Swordcraft follower, 1, 1/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// On Race - Select up to 1 enemy follower on the field and deal it 4 damage. Give this follower {[attack]}+1/{[defense]}+1 and
// deal it 2 damage.
import { defineCard, onRace, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { damageUpToOneThenPlusOne } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        yield* damageUpToOneThenPlusOne(fx, 4);
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.dealDamage(fx.self, 2);
      },
    }),
  ],
});
