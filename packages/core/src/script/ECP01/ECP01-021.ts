// ECP01-021 Tanino Gimlet — Runecraft follower, 4, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower.
// On Race - Select up to 1 enemy follower on the field and deal it 4 damage. Give this follower {[attack]}+1/{[defense]}+1.
// {[fanfare]} Search your deck for a Vodka and 1-cost Umamusume spell, reveal them, add them to your hand, then shuffle.
// (元のコスト. Either may be left unfound — ruling.)
import { defineCard, fanfare, onRace, serveAbility } from "../helpers";
import { enemyFollower, isSpell, named } from "../targets";
import { damageUpToOneThenPlusOne, umamusume } from "./shared";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    onRace({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        yield* damageUpToOneThenPlusOne(fx, 4);
      },
    }),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.searchEach([(id) => named("Vodka")(g, id), (id) => isSpell(g, id) && umamusume(g, id) && g.info(id).cost === 1], { to: "hand" });
      },
    }),
  ],
});
