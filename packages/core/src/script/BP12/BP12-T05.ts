// BP12-T05 Medusiana — Abysscraft follower token, 3, 1/5. 魔界・ゴルゴーン.
// Rush. Assail. Bane.
// {[fanfare]} Give your leader {[defense]}+X, where X equals the number of Demon followers on your field.
// {[lastwords]} Each opponent buries a follower. (Each opponent chooses one of their followers; Aura and
// "can't be destroyed by abilities" don't stop it — ruling.)
import { defineCard, fanfare, lastWords } from "../helpers";
import { demon } from "./shared";

export default defineCard({
  keywords: ["rush", "assail", "bane"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const x = fx.game.followers(fx.controller).filter((id) => demon(fx.game, id)).length;
        if (x > 0) yield* fx.giveLeaderDefense(fx.controller, x);
      },
    }),
    lastWords({
      *resolve(fx) {
        const opponent = fx.game.opponent(fx.controller);
        yield* fx.bury(yield* fx.chooseCards(fx.game.followers(opponent), 1, 1, opponent));
      },
    }),
  ],
});
