// BP06-107 Mammoth God's Colosseum — Neutral follower, 7, 7/8. 大神・獣.
// {[fanfare]} Each player buries each follower on their field except for one of their choice.
// (The active player first, then the other knowing that choice — CR 1.3.4, ruling. "Bury" is not
// destroying — ruling.)
// {[lastwords]} Search your deck for a Colosseum on High, summon it, then shuffle your deck.
import { defineCard, fanfare, lastWords } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const active = fx.game.activePlayer;
        for (const p of [active, fx.game.opponent(active)]) {
          const followers = fx.game.followers(p);
          if (followers.length <= 1) continue;
          const [keep] = yield* fx.chooseCards(followers, 1, 1, p);
          yield* fx.bury(followers.filter((id) => id !== keep));
        }
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.search((id) => named("Colosseum on High")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
